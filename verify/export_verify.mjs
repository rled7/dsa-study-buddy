// CDP-driven verification of buildExportPayload() (task #38) via direct API
// seeding (saveSolutionCode/markSolved) instead of clicking through the UI
// editor — the UI-click path hit an editor-clobbering race (see
// dsa-study-buddy-session-handoff.md). Runs in an isolated CDP browser
// context (Target.createBrowserContext) so the seeded fake solved-state
// never touches the real Chrome profile's actual localStorage progress.
import fs from "fs";

const CHROME_PORT = process.env.CHROME_PORT || 9339;
const APP_URL = process.env.APP_URL || "http://localhost:4328/";
const OUT =
  "/private/tmp/claude-501/-Users-user/52e30a5d-f8f8-496f-8983-52769836bbb4/scratchpad/export_verify_results.json";

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

  // Isolated context = its own storage partition, disposed at the end.
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

  results.isolatedProgressBefore = await evalJs("localStorage.getItem('dsa_study_buddy_progress_v1')");
  results.isolatedSolutionsBefore = await evalJs("localStorage.getItem('dsa_study_buddy_solutions_v1')");

  results.before = await evalJs(`
    (async () => {
      const exportMod = await import('/src/export.ts');
      return exportMod.buildExportPayload();
    })()
  `);

  await evalJs(`
    (async () => {
      const solutions = await import('/src/solutions.ts');
      const progress = await import('/src/progress.ts');
      solutions.saveSolutionCode('arr-subarray-sum-k', 'function subarraySumEqualsK(nums, k) {\\n  return 42;\\n}');
      progress.markSolved('arr-subarray-sum-k');
      solutions.saveSolutionCode('arr-max-sum-subarray-k', 'function maxSumSubarrayOfSizeK(nums, k) {\\n  return 7;\\n}');
      progress.markSolved('arr-max-sum-subarray-k');
    })()
  `);

  results.after = await evalJs(`
    (async () => {
      const exportMod = await import('/src/export.ts');
      return exportMod.buildExportPayload();
    })()
  `);

  // Stale id (solved but not in curriculum) must be skipped silently, per
  // export.ts's own "stale id ... skip silently" comment — not crash the export.
  await evalJs(`
    (async () => {
      const solutions = await import('/src/solutions.ts');
      const progress = await import('/src/progress.ts');
      solutions.saveSolutionCode('does-not-exist', 'function ghost() { return 1; }');
      progress.markSolved('does-not-exist');
    })()
  `);
  results.afterStale = await evalJs(`
    (async () => {
      const exportMod = await import('/src/export.ts');
      return exportMod.buildExportPayload();
    })()
  `);

  const readme = results.after.files.find((f) => f.path === "README.md");
  const codePaths = results.after.files
    .filter((f) => f.path.endsWith(".js"))
    .map((f) => f.path)
    .sort();

  results.pass = {
    startedEmpty:
      results.before.solvedCount === 0 &&
      results.before.files.length === 1 &&
      results.before.files[0].path === "README.md",
    countsAfterSeed: results.after.solvedCount === 2,
    fileCountAfterSeed: results.after.files.length === 3,
    codeFilePathsCorrect:
      JSON.stringify(codePaths) === JSON.stringify(["arrays/arr-max-sum-subarray-k.js", "arrays/arr-subarray-sum-k.js"]),
    readmeGroupsUnderArrays: readme.content.includes("## Arrays"),
    readmeListsBothTitles:
      readme.content.includes("Subarray Sum Equals K") && readme.content.includes("Maximum Sum Subarray of Size K"),
    staleIdSkippedSilently: results.afterStale.solvedCount === 2 && results.afterStale.files.length === 3,
  };
  results.allGreen = Object.values(results.pass).every(Boolean);

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));

  // Wipes the isolated context's storage too — zero trace in the real profile.
  await send("Target.disposeBrowserContext", { browserContextId });
  ws.close();
  process.exit(results.allGreen ? 0 : 1);
}

main().catch((err) => {
  console.error("VERIFY SCRIPT ERROR:", err);
  process.exit(1);
});
