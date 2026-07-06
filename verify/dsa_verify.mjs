// Minimal CDP driver to verify dsa-study-buddy v1 end-to-end in real headless Chrome.
import fs from "fs";

const CHROME_PORT = 9333;
const APP_URL = "http://localhost:4321/";

async function newTab() {
  const res = await fetch(`http://localhost:${CHROME_PORT}/json/new?${encodeURIComponent(APP_URL)}`, {
    method: "PUT",
  });
  return res.json();
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result);
      pending.delete(m.id);
    }
    if (m.method) events.push(m);
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const thisId = ++id;
      pending.set(thisId, resolve);
      ws.send(JSON.stringify({ id: thisId, method, params }));
    });
  return { ws, send, events };
}

function waitOpen(ws) {
  return new Promise((resolve) => {
    if (ws.readyState === 1) return resolve();
    ws.addEventListener("open", () => resolve());
  });
}

async function main() {
  const tab = await newTab();
  const { ws, send, events } = connect(tab.webSocketDebuggerUrl);
  await waitOpen(ws);

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Log.enable");

  const consoleErrors = [];
  events.length = 0;
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      consoleErrors.push(m.params.args.map((a) => a.value || a.description || "").join(" "));
    }
    if (m.method === "Runtime.exceptionThrown") {
      consoleErrors.push(
        "EXC: " + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text)
      );
    }
  });

  const evalJs = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      throw new Error("Eval error: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    }
    return r.result.value;
  };

  const results = {};

  // ─── Navigate to the app ────────────────────────────────────────────────
  await send("Page.navigate", { url: APP_URL });
  await new Promise((r) => setTimeout(r, 800));

  const title = await evalJs("document.title");
  results.pageTitle = title;

  // ─── Step 1: navigate to Two Sum problem ──────────────────────────────
  await evalJs(`location.hash = '#/problem/hash-two-sum'`);
  await new Promise((r) => setTimeout(r, 300));
  const heading = await evalJs(
    `document.querySelector('.content h1') ? document.querySelector('.content h1').textContent : null`
  );
  results.problemHeading = heading;

  // ─── Step 2: inject CORRECT solution, run tests, expect PASS ──────────
  const correctSolution =
    "function twoSum(nums, target) {\n" +
    "  const seen = new Map();\n" +
    "  for (let i = 0; i < nums.length; i++) {\n" +
    "    const complement = target - nums[i];\n" +
    "    if (seen.has(complement)) return [seen.get(complement), i];\n" +
    "    seen.set(nums[i], i);\n" +
    "  }\n" +
    "  return [];\n" +
    "}";

  await evalJs(`(() => {
    const editor = document.querySelector('#code-editor');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(editor, ${JSON.stringify(correctSolution)});
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await evalJs(`document.querySelector('#run-tests-btn').click()`);
  await new Promise((r) => setTimeout(r, 300));

  results.correctRunSummary = await evalJs(
    `document.querySelector('.run-summary') ? document.querySelector('.run-summary').textContent : null`
  );
  results.correctRunClass = await evalJs(
    `document.querySelector('.run-summary') ? document.querySelector('.run-summary').className : null`
  );
  results.correctSolvedBadgePresent = await evalJs(
    `!!document.querySelector('.solved-check')`
  );

  // ─── Step 3: inject WRONG solution, run tests, expect FAIL w/ detail ──
  const wrongSolution = "function twoSum(nums, target) {\n  return [0, 0];\n}";
  await evalJs(`(() => {
    const editor = document.querySelector('#code-editor');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(editor, ${JSON.stringify(wrongSolution)});
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await evalJs(`document.querySelector('#run-tests-btn').click()`);
  await new Promise((r) => setTimeout(r, 300));

  results.wrongRunSummary = await evalJs(
    `document.querySelector('.run-summary') ? document.querySelector('.run-summary').textContent : null`
  );
  results.wrongRunClass = await evalJs(
    `document.querySelector('.run-summary') ? document.querySelector('.run-summary').className : null`
  );
  results.wrongTestCaseDetail = await evalJs(`
    [...document.querySelectorAll('.test-case')].map(el => el.textContent.trim().replace(/\\s+/g, ' ')).slice(0, 2)
  `);
  results.wrongFailCount = await evalJs(
    `document.querySelectorAll('.test-case--fail').length`
  );

  // ─── Step 4: check localStorage progress was persisted from step 2 ────
  results.progressBeforeReload = await evalJs(`localStorage.getItem('dsa_study_buddy_progress_v1')`);

  await send("Page.navigate", { url: APP_URL + "#/problem/hash-two-sum" });
  await new Promise((r) => setTimeout(r, 800));

  results.progressAfterReload = await evalJs(`localStorage.getItem('dsa_study_buddy_progress_v1')`);
  results.solvedBadgeAfterReload = await evalJs(`!!document.querySelector('.solved-check')`);

  // ─── Step 5: crash logger — deliberately throw, confirm captured ──────
  results.sessionLogBefore = await evalJs(`sessionStorage.getItem('dsa_study_buddy_log')`);
  await evalJs(`document.querySelector('#throw-test-error-btn').click()`);
  await new Promise((r) => setTimeout(r, 400));
  const sessionLogAfter = await evalJs(`sessionStorage.getItem('dsa_study_buddy_log')`);
  results.sessionLogAfter = sessionLogAfter;
  results.loggerCapturedError =
    typeof sessionLogAfter === "string" && sessionLogAfter.includes("Deliberate test error");

  // ─── Extra: buddy panel stub check ─────────────────────────────────────
  results.buddyStubText = await evalJs(
    `document.querySelector('.buddy-stub-note') ? document.querySelector('.buddy-stub-note').textContent.trim() : null`
  );

  results.consoleErrors = consoleErrors;

  fs.writeFileSync(
    "/private/tmp/claude-501/-Users-user/8d7b6144-0da2-4993-91b2-8f51667d6519/scratchpad/dsa_verify_results.json",
    JSON.stringify(results, null, 2)
  );
  console.log(JSON.stringify(results, null, 2));

  await send("Page.close");
  ws.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("VERIFY SCRIPT ERROR:", err);
  process.exit(1);
});
