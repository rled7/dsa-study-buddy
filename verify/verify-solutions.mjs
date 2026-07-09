// Runs every problem's `solution` and every `solutions[].code` block against its
// real testCases via the app's own runner.ts, independent of the UI. Run with:
//   npx tsx verify/verify-solutions.mjs
import { runTests } from "../src/runner.ts";
import { PATTERNS } from "../src/data/curriculum.ts";

let totalProblems = 0;
let totalCodeBlocks = 0;
const failures = [];

for (const pattern of PATTERNS) {
  for (const sub of pattern.subpatterns) {
    for (const problem of sub.problems) {
      totalProblems++;
      const blocks = [{ label: "solution", code: problem.solution }];
      (problem.solutions || []).forEach((s, i) =>
        blocks.push({ label: `solutions[${i}] (${s.approach})`, code: s.code })
      );
      for (const { label, code } of blocks) {
        totalCodeBlocks++;
        const result = runTests(code, problem);
        if (!result.allPassed) {
          failures.push({
            problem: problem.id,
            block: label,
            compileError: result.compileError,
            failedCases: result.results.filter((r) => !r.pass),
          });
        }
      }
    }
  }
}

console.log(`Checked ${totalProblems} problems, ${totalCodeBlocks} code blocks (solution + solutions[].code).`);
if (failures.length === 0) {
  console.log("ALL PASS");
} else {
  console.log(`${failures.length} FAILURES:`);
  for (const f of failures) console.log(JSON.stringify(f, null, 2));
  process.exit(1);
}
