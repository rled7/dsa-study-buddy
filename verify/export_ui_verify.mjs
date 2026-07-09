// End-to-end UI verification of the #/export route (task #39): real DOM,
// real form fill + submit click, stubbed fetch (no real token/network ever
// touched). Runs in an isolated CDP browser context so the fake solved-state
// and fake saved token never land in the real Chrome profile's localStorage.
import fs from "fs";

const CHROME_PORT = process.env.CHROME_PORT || 9339;
const APP_URL = process.env.APP_URL || "http://localhost:4328/";
const OUT =
  "/private/tmp/claude-501/-Users-user/52e30a5d-f8f8-496f-8983-52769836bbb4/scratchpad/export_ui_verify_results.json";

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve) => {
      const thisId = ++id;
      pending.set(thisId, resolve);
      const payload = { id: thisId, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  return { ws, send };
}

function waitOpen(ws) {
  return new Promise((resolve) => {
    if (ws.readyState === 1) return resolve();
    ws.addEventListener("open", () => resolve());
  });
}

async function main() {
  const version = await (await fetch(`http://localhost:${CHROME_PORT}/json/version`)).json();
  const { ws, send } = connect(version.webSocketDebuggerUrl);
  await waitOpen(ws);

  const { browserContextId } = await send("Target.createBrowserContext");
  const { targetId } = await send("Target.createTarget", { url: "about:blank", browserContextId });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Page.navigate", { url: APP_URL }, sessionId);
  await new Promise((r) => setTimeout(r, 800));

  const evalJs = async (expr) => {
    const r = await send(
      "Runtime.evaluate",
      { expression: expr, returnByValue: true, awaitPromise: true },
      sessionId
    );
    if (r.exceptionDetails) {
      throw new Error("Eval error: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    }
    return r.result.value;
  };

  const results = {};

  // Empty-state: no solved problems yet -> preview says so, push button disabled.
  await evalJs(`location.hash = '#/export'`);
  await new Promise((r) => setTimeout(r, 300));
  results.emptyStatePreview = await evalJs(
    `document.querySelector('.coming-soon') ? document.querySelector('.coming-soon').textContent : null`
  );
  results.emptyStatePushDisabled = await evalJs(`document.querySelector('#export-push-btn').disabled`);

  // Seed one real solved problem via the same direct-API pattern as #38's verification.
  await evalJs(`
    (async () => {
      const solutions = await import('/src/solutions.ts');
      const progress = await import('/src/progress.ts');
      solutions.saveSolutionCode('arr-subarray-sum-k', 'function subarraySumEqualsK(nums, k) { return 42; }');
      progress.markSolved('arr-subarray-sum-k');
    })()
  `);

  // Stub fetch on window BEFORE re-rendering/navigating so main.ts's import of
  // export-github.ts (already loaded) uses this stub when the form submits.
  await evalJs(`
    window.__pushCalls = [];
    window.fetch = async (url, init) => {
      window.__pushCalls.push({ url, method: init?.method || 'GET' });
      if (url.endsWith('/repos/uiowner/uirepo')) {
        return new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 });
      }
      if (init?.method === 'PUT') {
        return new Response(JSON.stringify({ content: {} }), { status: 201 });
      }
      return new Response('Not Found', { status: 404 });
    };
  `);

  await evalJs(`location.hash = '#/'`);
  await new Promise((r) => setTimeout(r, 200));
  await evalJs(`location.hash = '#/export'`);
  await new Promise((r) => setTimeout(r, 300));

  results.solvedStatePreview = await evalJs(
    `document.querySelector('.lead') ? document.querySelector('.lead').textContent : null`
  );
  results.solvedStatePushEnabled = await evalJs(`!document.querySelector('#export-push-btn').disabled`);

  // Fill the form via the same native-setter pattern the app's own editor tests use,
  // so React/Vite-style controlled-input listeners (if any) see the 'input' event.
  const fillField = (id, value) => `(() => {
    const el = document.querySelector('#${id}');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
  })()`;

  await evalJs(fillField("export-token", "fake-token-never-real"));
  await evalJs(fillField("export-owner", "uiowner"));
  await evalJs(fillField("export-repo", "uirepo"));

  await evalJs(`document.querySelector('#export-push-btn').click()`);
  await new Promise((r) => setTimeout(r, 500));

  results.statusHtmlAfterPush = await evalJs(`document.querySelector('#export-status').innerHTML`);
  results.statusHasErrorClass = await evalJs(
    `document.querySelector('#export-status').classList.contains('buddy-response--error')`
  );
  results.pushCalls = await evalJs(`window.__pushCalls`);

  // Confirm the token got persisted to localStorage under the real key (within
  // this isolated context only) so a reload would prefill it.
  results.savedTokenInIsolatedStorage = await evalJs(
    `localStorage.getItem('dsa_study_buddy_github_token_v1')`
  );

  // Forget-token button clears it and the input.
  await evalJs(`document.querySelector('#export-forget-token-btn').click()`);
  await new Promise((r) => setTimeout(r, 100));
  results.tokenAfterForget = await evalJs(`localStorage.getItem('dsa_study_buddy_github_token_v1')`);
  results.tokenInputAfterForget = await evalJs(`document.querySelector('#export-token').value`);

  results.pass = {
    startsEmptyWithDisabledButton:
      typeof results.emptyStatePreview === "string" &&
      results.emptyStatePreview.includes("Solve a problem first") &&
      results.emptyStatePushDisabled === true,
    afterSeedButtonEnabled: results.solvedStatePushEnabled === true,
    pushHitRepoThenContentsThenPut:
      results.pushCalls.length >= 3 && results.pushCalls[0].url.endsWith("/repos/uiowner/uirepo"),
    statusShowsSuccessNoErrorClass:
      results.statusHasErrorClass === false && results.statusHtmlAfterPush.includes("all files succeeded"),
    statusListsBothFiles:
      results.statusHtmlAfterPush.includes("arrays/arr-subarray-sum-k.js") &&
      results.statusHtmlAfterPush.includes("README.md"),
    tokenPersistedThenForgettable:
      results.savedTokenInIsolatedStorage === "fake-token-never-real" &&
      results.tokenAfterForget === null &&
      results.tokenInputAfterForget === "",
  };
  results.allGreen = Object.values(results.pass).every(Boolean);

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.pass, null, 2));
  console.log("allGreen:", results.allGreen);

  await send("Target.disposeBrowserContext", { browserContextId });
  ws.close();
  process.exit(results.allGreen ? 0 : 1);
}

main().catch((err) => {
  console.error("VERIFY SCRIPT ERROR:", err);
  process.exit(1);
});
