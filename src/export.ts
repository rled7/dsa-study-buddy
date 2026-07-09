// Pure export-payload builder: turns solved-problem code (solutions.ts) into a
// set of files ready to push to a GitHub repo, organized by pattern with a
// generated README index. No network/DOM here on purpose — the GitHub push
// layer (export-github.ts) consumes this, and it's independently testable.

import { findProblem, PATTERNS } from "./data/curriculum";
import { getAllSolvedIds, getSolutionCode } from "./solutions";

export interface ExportFile {
  path: string;
  content: string;
}

export interface ExportPayload {
  files: ExportFile[];
  solvedCount: number;
}

export function buildExportPayload(): ExportPayload {
  const solvedIds = getAllSolvedIds();
  const codeFiles: ExportFile[] = [];
  const byPattern = new Map<string, { patternName: string; entries: { title: string; difficulty: string; path: string }[] }>();

  for (const id of solvedIds) {
    const found = findProblem(id);
    const code = getSolutionCode(id);
    if (!found || !code) continue; // stale id (problem removed) or code missing; skip silently
    const { pattern, problem } = found;
    const path = `${pattern.id}/${problem.id}.js`;

    codeFiles.push({
      path,
      content:
        `// ${problem.title} (${problem.difficulty})\n` +
        `// Pattern: ${pattern.name}\n` +
        `// Solved via DSA Study Buddy: https://github.com/rled7/dsa-study-buddy\n\n` +
        `${code}\n`,
    });

    if (!byPattern.has(pattern.id)) byPattern.set(pattern.id, { patternName: pattern.name, entries: [] });
    byPattern.get(pattern.id)!.entries.push({ title: problem.title, difficulty: problem.difficulty, path });
  }

  const readmeLines: string[] = [
    "# My DSA Solutions",
    "",
    `${codeFiles.length} problem${codeFiles.length === 1 ? "" : "s"} solved, organized by pattern.`,
    "",
    "_Exported from [DSA Study Buddy](https://github.com/rled7/dsa-study-buddy)._",
    "",
  ];

  // Walk PATTERNS in curriculum order so the index reads top-to-bottom the
  // same way the app's sidebar does, not in solve-order.
  for (const pattern of PATTERNS) {
    const group = byPattern.get(pattern.id);
    if (!group || group.entries.length === 0) continue;
    readmeLines.push(`## ${group.patternName}`, "");
    for (const entry of group.entries) {
      readmeLines.push(`- [${entry.title}](./${entry.path}) — ${entry.difficulty}`);
    }
    readmeLines.push("");
  }

  return {
    files: [...codeFiles, { path: "README.md", content: readmeLines.join("\n") }],
    solvedCount: codeFiles.length,
  };
}
