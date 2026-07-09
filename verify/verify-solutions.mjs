// Consolidated curriculum verification. Runs every problem's `solution` and every
// `solutions[].code` block against its real testCases via the app's own runner.ts,
// independent of the UI, plus structural checks on the data itself:
//   - `solution` must equal `solutions[0].code` (UI shows solutions[] when present,
//     but older tooling reads `solution` directly — they must never diverge)
//   - no two `solutions[]` entries on the same problem may share a `timeComplexity`
//     string (the whole point of the array is genuinely different approaches)
//   - a per-subpattern problem-count report, so curriculum coverage gaps are visible
//     at a glance instead of requiring a separate inventory script
// Run with:
//   npx tsx verify/verify-solutions.mjs
import { runTests } from "../src/runner.ts";
import { PATTERNS } from "../src/data/curriculum.ts";

let totalProblems = 0;
let totalCodeBlocks = 0;
const testFailures = [];
const solutionMismatches = [];
const duplicateComplexity = [];
const coverage = [];
let emptySubpatterns = 0;

for (const pattern of PATTERNS) {
  const patternRow = { pattern: pattern.id, subpatterns: [] };
  for (const sub of pattern.subpatterns) {
    patternRow.subpatterns.push({ id: sub.id, problems: sub.problems.length });
    if (sub.problems.length === 0) emptySubpatterns++;

    for (const problem of sub.problems) {
      totalProblems++;

      if (problem.solutions && problem.solutions.length > 0) {
        if (problem.solution !== problem.solutions[0].code) {
          solutionMismatches.push(problem.id);
        }
        const seen = new Map();
        for (const s of problem.solutions) {
          if (seen.has(s.timeComplexity)) {
            duplicateComplexity.push({
              problem: problem.id,
              timeComplexity: s.timeComplexity,
              approaches: [seen.get(s.timeComplexity), s.approach],
            });
          } else {
            seen.set(s.timeComplexity, s.approach);
          }
        }
      }

      const blocks = [{ label: "solution", code: problem.solution }];
      (problem.solutions || []).forEach((s, i) =>
        blocks.push({ label: `solutions[${i}] (${s.approach})`, code: s.code })
      );
      for (const { label, code } of blocks) {
        totalCodeBlocks++;
        const result = runTests(code, problem);
        if (!result.allPassed) {
          testFailures.push({
            problem: problem.id,
            block: label,
            compileError: result.compileError,
            failedCases: result.results.filter((r) => !r.pass),
          });
        }
      }
    }
  }
  coverage.push(patternRow);
}

console.log(`Checked ${totalProblems} problems, ${totalCodeBlocks} code blocks (solution + solutions[].code).`);
console.log(`Empty subpatterns remaining: ${emptySubpatterns}`);

const problems = [];
if (testFailures.length) {
  problems.push(`${testFailures.length} TEST FAILURE(S)`);
  for (const f of testFailures) console.log(JSON.stringify(f, null, 2));
}
if (solutionMismatches.length) {
  problems.push(`${solutionMismatches.length} solution/solutions[0] MISMATCH(ES): ${solutionMismatches.join(", ")}`);
}
if (duplicateComplexity.length) {
  problems.push(`${duplicateComplexity.length} DUPLICATE timeComplexity within a problem`);
  for (const d of duplicateComplexity) console.log(JSON.stringify(d, null, 2));
}

if (problems.length === 0) {
  console.log("ALL PASS");
} else {
  console.log(problems.join("\n"));
  process.exit(1);
}

if (process.argv.includes("--coverage")) {
  console.log("\n--- coverage ---");
  for (const row of coverage) {
    console.log(`${row.pattern}: ${row.subpatterns.map((s) => `${s.id}=${s.problems}`).join(", ")}`);
  }
}
