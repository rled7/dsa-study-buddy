// ─── Logger — client-side error visibility ───────────────────────────────
// The whole point of this app: it should never crash silently or leave you
// guessing. A sessionStorage ring buffer that, once install()ed,
// AUTOMATICALLY captures:
//   - uncaught errors              (window 'error')
//   - unhandled promise rejections (window 'unhandledrejection')
//   - console.error / console.warn (mirrored, not silenced)
// Nothing has to remember to call it (other than the one install() line in
// main.ts, which runs before anything else). Export the buffer any time
// with exportLogs(), or read it straight out of sessionStorage.

export type LogEntry = {
  ts: string;
  type: "error" | "warn";
  msg: string;
  where?: string;
};

const STORAGE_KEY = "dsa_study_buddy_log";
const MAX_ENTRIES = 100;

export class Logger {
  private static installed = false;

  private static buf(): LogEntry[] {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  private static save(buf: LogEntry[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buf));
    } catch {
      // sessionStorage can throw in private-browsing / quota-exceeded cases;
      // logging must never itself crash the app.
    }
  }

  private static push(type: "error" | "warn", msg: unknown, where?: string): void {
    const buf = this.buf();
    buf.push({
      ts: new Date().toISOString(),
      type,
      msg: String(msg).slice(0, 2000),
      ...(where ? { where } : {}),
    });
    if (buf.length > MAX_ENTRIES) buf.splice(0, buf.length - MAX_ENTRIES);
    this.save(buf);
  }

  /** Explicit logging entry point, kept for call sites that want to log deliberately. */
  static log(msg: unknown, type: "error" | "warn" = "error"): void {
    this.push(type, msg);
  }

  /** Wire up global capture. Call once, as early as possible (see src/main.ts). */
  static install(): void {
    if (this.installed || typeof window === "undefined") return;
    this.installed = true;

    window.addEventListener("error", (e: ErrorEvent) => {
      // e.error is present for JS errors; resource-load errors only have a target.
      const target = e.target as (EventTarget & { src?: string; href?: string }) | null;
      const msg = e.error?.stack || e.message || `resource error: ${target?.src || target?.href || "unknown"}`;
      this.push("error", `[uncaught] ${msg}`, e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : undefined);
    });

    window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
      const r = e.reason;
      this.push(
        "error",
        `[unhandledrejection] ${r?.stack || r?.message || (typeof r === "object" ? safeJson(r) : String(r))}`
      );
    });

    // Mirror console.error/warn into the buffer WITHOUT silencing the console.
    for (const level of ["error", "warn"] as const) {
      const orig = console[level].bind(console);
      console[level] = (...args: unknown[]) => {
        try {
          this.push(level, args.map(fmtArg).join(" "));
        } catch {
          // never let logging break the console
        }
        orig(...args);
      };
    }
  }

  static getLogs(): LogEntry[] {
    return this.buf();
  }

  static clear(): void {
    this.save([]);
  }

  static exportLogs(): void {
    const blob = new Blob([JSON.stringify(this.buf(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dsa-study-buddy-errors-${Date.now()}.json`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 1000);
  }
}

function fmtArg(a: unknown): string {
  if (a instanceof Error) return a.stack || a.message;
  if (typeof a === "object" && a !== null) return safeJson(a);
  return String(a);
}

function safeJson(o: unknown): string {
  try {
    return JSON.stringify(o);
  } catch {
    return String(o);
  }
}
