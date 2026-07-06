// Solved-problem state persisted to localStorage, so progress survives
// reloads (unlike the Logger's sessionStorage ring buffer).

const KEY = "dsa_study_buddy_progress_v1";

function readSolved(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function writeSolved(solved: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...solved]));
  } catch {
    // localStorage can throw (quota / private mode); progress just won't
    // persist across reloads in that case, but the app keeps working.
  }
}

export function isSolved(problemId: string): boolean {
  return readSolved().has(problemId);
}

export function markSolved(problemId: string): void {
  const solved = readSolved();
  solved.add(problemId);
  writeSolved(solved);
}

export function countSolved(problemIds: string[]): number {
  const solved = readSolved();
  return problemIds.filter((id) => solved.has(id)).length;
}
