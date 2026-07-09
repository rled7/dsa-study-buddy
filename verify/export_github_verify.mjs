// CDP-driven verification of pushExportToGitHub() (task #39). Never touches
// the real GitHub API and never uses a real token — that would mean this
// script handling a live credential, which it must not do. Instead it stubs
// window.fetch inside an isolated CDP browser context and asserts the
// request sequence/bodies pushExportToGitHub() produces are correct:
// default-branch resolution, existing-file sha lookup -> update vs create,
// partial-failure isolation, and UTF-8-safe base64 content encoding.
import fs from "fs";

const CHROME_PORT = process.env.CHROME_PORT || 9339;
const APP_URL = process.env.APP_URL || "http://localhost:4328/";
const OUT =
  "/private/tmp/claude-501/-Users-user/52e30a5d-f8f8-496f-8983-52769836bbb4/scratchpad/export_github_verify_results.json";

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

  // ─── Scenario A: brand-new repo, every file created, branch auto-resolved ──
  results.scenarioA = await evalJs(`
    (async () => {
      const calls = [];
      window.fetch = async (url, init) => {
        calls.push({ url, method: init?.method || 'GET' });
        if (url.endsWith('/repos/testowner/testrepo')) {
          return new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 });
        }
        if (init?.method === 'PUT') {
          return new Response(JSON.stringify({ content: {} }), { status: 201 });
        }
        return new Response('Not Found', { status: 404 }); // contents GET -> no existing file
      };
      const mod = await import('/src/export-github.ts');
      const payload = {
        files: [
          { path: 'arrays/a.js', content: 'console.log(1);' },
          { path: 'README.md', content: '# hi' },
        ],
        solvedCount: 1,
      };
      const summary = await mod.pushExportToGitHub(payload, { token: 'fake', owner: 'testowner', repo: 'testrepo' });
      return { summary, callCount: calls.length, calls };
    })()
  `);

  // ─── Scenario B: one file already exists (sha) -> update, explicit branch ──
  results.scenarioB = await evalJs(`
    (async () => {
      const calls = [];
      window.fetch = async (url, init) => {
        calls.push({ url, method: init?.method || 'GET', body: init?.body ? JSON.parse(init.body) : null });
        if (init?.method === 'PUT') {
          return new Response(JSON.stringify({ content: {} }), { status: 200 });
        }
        // contents GET
        if (url.includes('arrays/a.js')) {
          return new Response(JSON.stringify({ sha: 'existing-sha-123' }), { status: 200 });
        }
        return new Response('Not Found', { status: 404 });
      };
      const mod = await import('/src/export-github.ts');
      const payload = {
        files: [
          { path: 'arrays/a.js', content: 'console.log(1);' },
          { path: 'README.md', content: '# hi' },
        ],
        solvedCount: 1,
      };
      const summary = await mod.pushExportToGitHub(payload, {
        token: 'fake', owner: 'testowner', repo: 'testrepo', branch: 'dev',
      });
      const repoCallMade = calls.some((c) => c.url.endsWith('/repos/testowner/testrepo'));
      const updatePut = calls.find((c) => c.method === 'PUT' && c.url.includes('arrays/a.js'));
      return { summary, repoCallMade, updatePutIncludesSha: updatePut?.body?.sha === 'existing-sha-123' };
    })()
  `);

  // ─── Scenario C: one PUT fails (422), rest still succeed (no early abort) ──
  results.scenarioC = await evalJs(`
    (async () => {
      window.fetch = async (url, init) => {
        if (url.endsWith('/repos/testowner/testrepo')) {
          return new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 });
        }
        if (init?.method === 'PUT' && url.includes('arrays/a.js')) {
          return new Response(JSON.stringify({ message: 'Validation failed: bad path' }), { status: 422 });
        }
        if (init?.method === 'PUT') {
          return new Response(JSON.stringify({ content: {} }), { status: 201 });
        }
        return new Response('Not Found', { status: 404 });
      };
      const mod = await import('/src/export-github.ts');
      const payload = {
        files: [
          { path: 'arrays/a.js', content: 'console.log(1);' },
          { path: 'arrays/b.js', content: 'console.log(2);' },
          { path: 'README.md', content: '# hi' },
        ],
        solvedCount: 2,
      };
      const summary = await mod.pushExportToGitHub(payload, { token: 'fake', owner: 'testowner', repo: 'testrepo' });
      return { summary };
    })()
  `);

  // ─── Scenario D: repo itself not found -> whole push rejects, zero file calls ──
  results.scenarioD = await evalJs(`
    (async () => {
      const calls = [];
      window.fetch = async (url, init) => {
        calls.push({ url, method: init?.method || 'GET' });
        return new Response('Not Found', { status: 404 });
      };
      const mod = await import('/src/export-github.ts');
      const payload = { files: [{ path: 'arrays/a.js', content: 'x' }], solvedCount: 1 };
      try {
        await mod.pushExportToGitHub(payload, { token: 'fake', owner: 'ghost', repo: 'ghost' });
        return { threw: false };
      } catch (err) {
        return { threw: true, message: err.message, callCount: calls.length };
      }
    })()
  `);

  // ─── Scenario E: UTF-8 content survives the base64 round-trip ─────────────
  results.scenarioE = await evalJs(`
    (async () => {
      let sentContentB64 = null;
      window.fetch = async (url, init) => {
        if (url.endsWith('/repos/testowner/testrepo')) {
          return new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 });
        }
        if (init?.method === 'PUT') {
          sentContentB64 = JSON.parse(init.body).content;
          return new Response(JSON.stringify({ content: {} }), { status: 201 });
        }
        return new Response('Not Found', { status: 404 });
      };
      const mod = await import('/src/export-github.ts');
      const original = '// café ✓ — comment with unicode\\nfunction f() { return 1; }';
      const payload = { files: [{ path: 'arrays/utf8.js', content: original }], solvedCount: 1 };
      await mod.pushExportToGitHub(payload, { token: 'fake', owner: 'testowner', repo: 'testrepo' });
      return { sentContentB64, original };
    })()
  `);
  const decoded = Buffer.from(results.scenarioE.sentContentB64, "base64").toString("utf-8");

  results.pass = {
    A_allCreated:
      results.scenarioA.summary.results.every((r) => r.status === "created") &&
      results.scenarioA.summary.branch === "main" &&
      results.scenarioA.summary.results.length === 2,
    B_repoCallSkippedWithExplicitBranch: results.scenarioB.repoCallMade === false,
    B_existingFileUpdatedWithSha:
      results.scenarioB.updatePutIncludesSha === true &&
      results.scenarioB.summary.results.find((r) => r.path === "arrays/a.js")?.status === "updated",
    B_newFileStillCreated: results.scenarioB.summary.results.find((r) => r.path === "README.md")?.status === "created",
    C_partialFailureIsolated:
      results.scenarioC.summary.results.length === 3 &&
      results.scenarioC.summary.results.find((r) => r.path === "arrays/a.js")?.status === "failed" &&
      results.scenarioC.summary.results.find((r) => r.path === "arrays/a.js")?.error === "Validation failed: bad path" &&
      results.scenarioC.summary.results.find((r) => r.path === "arrays/b.js")?.status === "created" &&
      results.scenarioC.summary.results.find((r) => r.path === "README.md")?.status === "created",
    D_missingRepoThrowsBeforeAnyFileCall: results.scenarioD.threw === true && results.scenarioD.callCount === 1,
    E_utf8RoundTrips: decoded === results.scenarioE.original,
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
