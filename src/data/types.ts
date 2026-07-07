// ─── Curriculum data model ────────────────────────────────────────────────
// One data file describes the whole 16-pattern curriculum. Adding a new
// problem to a seeded pattern (or seeding a currently-stubbed pattern) is
// just pushing a Problem object into a SubPattern's `problems` array — see
// README.md "How to add a problem".

export interface TestCase {
  /** Arguments passed positionally to the candidate function. */
  input: unknown[];
  /** Expected return value. */
  expected: unknown;
}

export interface SolutionApproach {
  /** e.g. "Brute force", "HashMap + Doubly Linked List". */
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  /** Why this approach works, and its tradeoff vs. the others. */
  explanation: string;
  /** Must define `fnName` on its own — shown standalone, not merged with other approaches. */
  code: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Plain-English problem statement. */
  description: string;
  /** Name of the function the runner extracts and calls. */
  fnName: string;
  /** Starter code shown in the editor — a stub signature, not a solution. */
  starterCode: string;
  testCases: TestCase[];
  /** Reference solution source, revealed on demand. Must define `fnName`. */
  solution: string;
  /**
   * Multiple conceptual approaches to the same problem, ordered fastest-to-slowest
   * by time complexity. When present, the UI shows this list instead of the single
   * `solution` above — `solution` still must be set (use the fastest approach's code)
   * since older tooling reads it directly.
   */
  solutions?: SolutionApproach[];
  /**
   * Optional canonicalizer applied to BOTH the actual return value and the
   * expected value before comparing. Use this when a correct solution may
   * legally return results in a different order than `expected` (e.g.
   * Two Sum's index order, Group Anagrams' group/element order).
   */
  normalize?: (value: unknown) => unknown;
}

export interface SubPattern {
  id: string;
  name: string;
  /** Short plain-English explanation of the technique. */
  explanation: string;
  problems: Problem[];
}

export interface Pattern {
  id: string;
  name: string;
  subpatterns: SubPattern[];
}
