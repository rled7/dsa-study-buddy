// GitHub push layer for the export feature (task #39). Consumes
// buildExportPayload()'s pure output (export.ts) and pushes it to a real
// GitHub repo via the REST Contents API — one commit per file. Simplest
// correct approach for a personal export tool; a single multi-file commit
// via the Git Data API is a possible future upgrade, not needed for v1.
import type { ExportFile, ExportPayload } from "./export";

export interface PushFileResult {
  path: string;
  status: "created" | "updated" | "failed";
  error?: string;
}

export interface PushSummary {
  repoUrl: string;
  branch: string;
  results: PushFileResult[];
}

export interface PushOptions {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// btoa() only handles Latin1; solution code/comments can contain arbitrary
// UTF-8, so encode through raw bytes instead of calling btoa() on the string.
function toBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function resolveDefaultBranch(owner: string, repo: string, token: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `Repo "${owner}/${repo}" not found (or this token can't see it).`
        : `Couldn't reach repo "${owner}/${repo}": ${res.status} ${res.statusText}`
    );
  }
  const data = await res.json();
  return data.default_branch;
}

async function getExistingSha(
  owner: string,
  repo: string,
  path: string,
  branch: string,
  token: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    { headers: authHeaders(token) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Couldn't check "${path}": ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.sha ?? null;
}

async function putFile(
  owner: string,
  repo: string,
  file: ExportFile,
  branch: string,
  token: string,
  sha: string | null
): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: sha ? `Update ${file.path} via DSA Study Buddy` : `Add ${file.path} via DSA Study Buddy`,
      content: toBase64Utf8(file.content),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string });
    throw new Error(body.message || `${res.status} ${res.statusText}`);
  }
}

/**
 * Push every file in the payload to the given repo, one commit per file.
 * A single file failing (bad path, transient API error) doesn't abort the
 * rest — every file gets its own result so partial success is visible.
 */
export async function pushExportToGitHub(payload: ExportPayload, opts: PushOptions): Promise<PushSummary> {
  const branch = opts.branch || (await resolveDefaultBranch(opts.owner, opts.repo, opts.token));
  const results: PushFileResult[] = [];

  for (const file of payload.files) {
    try {
      const sha = await getExistingSha(opts.owner, opts.repo, file.path, branch, opts.token);
      await putFile(opts.owner, opts.repo, file, branch, opts.token, sha);
      results.push({ path: file.path, status: sha ? "updated" : "created" });
    } catch (err) {
      results.push({ path: file.path, status: "failed", error: err instanceof Error ? err.message : String(err) });
    }
  }

  return {
    repoUrl: `https://github.com/${opts.owner}/${opts.repo}`,
    branch,
    results,
  };
}
