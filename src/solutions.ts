// Solved-problem *code* persisted to localStorage, alongside (not instead
// of) the solved/unsolved boolean in progress.ts. Without this, a problem's
// passing code only ever lived in an in-memory variable in main.ts and was
// wiped the moment you navigated away — nothing survived a reload, and
// there was nothing for the GitHub export feature to actually export.

const KEY = "dsa_study_buddy_solutions_v1";

function readAll(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(solutions: Record<string, string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(solutions));
  } catch {
    // localStorage can throw (quota / private mode); saved code just won't
    // persist across reloads in that case, but the app keeps working.
  }
}

/** Save the passing code for a problem. Call only once its tests all pass. */
export function saveSolutionCode(problemId: string, code: string): void {
  const solutions = readAll();
  solutions[problemId] = code;
  writeAll(solutions);
}

export function getSolutionCode(problemId: string): string | null {
  return readAll()[problemId] ?? null;
}

/** Every problem id with saved code, for the export feature to iterate. */
export function getAllSolvedIds(): string[] {
  return Object.keys(readAll());
}
