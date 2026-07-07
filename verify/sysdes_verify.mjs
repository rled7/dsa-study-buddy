// Bulk correctness check for the System Design Building Blocks pattern.
// Imports the REAL curriculum + the REAL runner (same code the browser runs)
// and, for every problem with `solutions`, runs every approach's code
// through runTests() against that problem's own testCases — confirming the
// legacy `solution` field and every `solutions[].code` entry actually agree
// with each other, not just with hand-simulation.
//
// Run: node --experimental-strip-types verify/sysdes_verify.mjs

import { PATTERNS } from "../src/data/curriculum.ts";
import { runTests } from "../src/runner.ts";

const sysdes = PATTERNS.find((p) => p.id === "system-design");
if (!sysdes) {
  console.error("FAIL: no pattern with id 'system-design' found in PATTERNS");
  process.exit(1);
}

let problemCount = 0;
let approachCount = 0;
let ok = true;

for (const sub of sysdes.subpatterns) {
  for (const problem of sub.problems) {
    problemCount++;

    // Legacy `solution` field must also pass — older UI paths read it directly.
    const legacy = runTests(problem.solution, problem);
    if (!legacy.allPassed) {
      ok = false;
      console.log(`FAIL [${problem.id}] legacy \`solution\` field did not pass its own testCases`);
      for (const r of legacy.results) if (!r.pass) console.log("  ", JSON.stringify(r));
    }

    if (!problem.solutions || problem.solutions.length === 0) {
      ok = false;
      console.log(`FAIL [${problem.id}] has no \`solutions\` array`);
      continue;
    }

    for (const sol of problem.solutions) {
      approachCount++;
      const result = runTests(sol.code, problem);
      if (!result.allPassed) {
        ok = false;
        console.log(`FAIL [${problem.id}] approach="${sol.approach}"`);
        if (result.compileError) console.log("  compile error:", result.compileError);
        for (const r of result.results) if (!r.pass) console.log("  ", JSON.stringify(r));
      }
    }
  }
}

console.log(`\nChecked ${problemCount} problems, ${approachCount} solution approaches.`);
console.log(ok ? "ALL PASS" : "SOME FAILED");
process.exit(ok ? 0 : 1);
