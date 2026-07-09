// GitHub PAT for the export push feature, persisted to localStorage per
// explicit choice (convenience over re-entering it every session). This is a
// single-user local app with no server — there is nowhere more secure to put
// it without adding a backend that doesn't otherwise exist, same trade-off as
// any locally-run dev CLI that caches a token on disk.

const KEY = "dsa_study_buddy_github_token_v1";

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // localStorage can throw (quota / private mode); token just won't persist.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
