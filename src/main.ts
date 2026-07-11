import "./style.css";
import { Logger } from "./logger";

// Install crash-visibility logging FIRST, before anything else runs, so
// nothing can throw before it's wired up.
Logger.install();

// PWA offline shell. PROD-only: registering during `npm run dev` would let
// the service worker's cached responses fight with Vite's HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.error("Service worker registration failed", err);
    });
  });
}

import { PATTERNS, findProblem } from "./data/curriculum";
import { ARCHITECTURE_CATEGORIES, ARCHITECTURE_CONCEPT_COUNT } from "./data/architecture";
import { findDeepDive } from "./data/deepdives";
import { LANGUAGE_REFS, REFERENCE_ITEM_COUNT, referenceItemCount, type RefLevel } from "./data/reference";
import { findReferenceDeepDive } from "./data/referenceDeepDives";
import type { Pattern } from "./data/types";
import { runTests, formatValue, type RunResult } from "./runner";
import { isSolved, markSolved, countSolved } from "./progress";
import { saveSolutionCode } from "./solutions";
import { ingestText, getAllChunks, clearBrain, retrieveRelevant, type BrainChunk } from "./brain";
import { buildExportPayload } from "./export";
import { pushExportToGitHub, type PushSummary } from "./export-github";
import { getToken, saveToken, clearToken } from "./github-token";

// ─── Routing ───────────────────────────────────────────────────────────────

type Route =
  | { view: "list" }
  | { view: "concepts" }
  | { view: "deepDive"; id: string }
  | { view: "reference" }
  | { view: "referenceLang"; langId: string }
  | { view: "refDeepDive"; id: string }
  | { view: "brain" }
  | { view: "export" }
  | { view: "pattern"; patternId: string }
  | { view: "subpattern"; patternId: string; subId: string }
  | { view: "problem"; problemId: string };

function parseRoute(): Route {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "concepts" && parts[1]) {
    return { view: "deepDive", id: parts[1] };
  }
  if (parts[0] === "concepts") {
    return { view: "concepts" };
  }
  if (parts[0] === "reference" && parts[1] === "deepdive" && parts[2]) {
    return { view: "refDeepDive", id: parts[2] };
  }
  if (parts[0] === "reference" && parts[1]) {
    return { view: "referenceLang", langId: parts[1] };
  }
  if (parts[0] === "reference") {
    return { view: "reference" };
  }
  if (parts[0] === "brain") {
    return { view: "brain" };
  }
  if (parts[0] === "export") {
    return { view: "export" };
  }
  if (parts[0] === "pattern" && parts[1] && parts[2] === "sub" && parts[3]) {
    return { view: "subpattern", patternId: parts[1], subId: parts[3] };
  }
  if (parts[0] === "pattern" && parts[1]) {
    return { view: "pattern", patternId: parts[1] };
  }
  if (parts[0] === "problem" && parts[1]) {
    return { view: "problem", problemId: parts[1] };
  }
  return { view: "list" };
}

// ─── Run-state kept across a Run Tests click (but reset on navigation) ────

let currentRunResult: RunResult | null = null;
let currentCode: string | null = null;
let currentProblemId: string | null = null;

// In-memory mirror of the brain's IndexedDB store. IndexedDB is async but
// this app's render functions are synchronous (same pattern as localStorage
// progress), so we cache chunks here and refresh+re-render after any write.
let brainChunks: BrainChunk[] = [];

async function refreshBrainChunks(): Promise<void> {
  brainChunks = await getAllChunks();
}

// ─── Buddy panel (v2: local LLM via Ollama) ────────────────────────────────

const OLLAMA_CHAT_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "qwen2.5-coder:7b";

// Kept short deliberately: this ships on every request to a 7B model running
// on CPU/GPU locally, so a bloated prompt is pure added latency here, same
// principle as capping a hosted system prompt to control cost.
const BUDDY_SYSTEM_PROMPT =
  "You are an offline coding study buddy inside a DSA practice app. Be concise: a " +
  "few sentences or a short snippet, not an essay. Prefer a nudge/hint over the full " +
  "solution unless the user clearly asks for the answer. Use the given problem " +
  "context; if none is given, answer generally. If a message includes a section " +
  "labeled 'Notes from the user's brain', those are the user's own saved notes " +
  "(not general knowledge you were trained on) — they take priority over the " +
  "'currently open problem' section below them. If the question is about " +
  "something in the notes, answer from the notes directly, even if it describes " +
  "something you don't otherwise recognize and even if it's unrelated to " +
  "whatever problem happens to be open right now.";

function buddyContextForRoute(route: Route): string {
  if (route.view !== "problem") {
    return "The user is browsing the pattern list and isn't looking at a specific problem right now.";
  }
  const found = findProblem(route.problemId);
  if (!found) return "The user is viewing an unknown/removed problem.";
  const { pattern, subpattern, problem } = found;
  const code = currentProblemId === problem.id && currentCode !== null ? currentCode : problem.starterCode;
  return [
    `Pattern: ${pattern.name} > ${subpattern.name}`,
    `Problem: ${problem.title} (${problem.difficulty})`,
    `Description: ${problem.description}`,
    `User's current code:\n${code}`,
  ].join("\n\n");
}

// Notes go BEFORE the current-problem context and are framed as taking priority over it.
// Verified empirically: with notes framed as merely "may be relevant" and placed after the
// problem context, this 7B model consistently ignored an injected fact unrelated to the open
// problem and answered about the problem instead. Reordering + explicit priority language fixed it.
async function askBuddy(question: string, route: Route, useRag: boolean): Promise<string> {
  let ragContext = "";
  if (useRag) {
    const relevant = await retrieveRelevant(question, 3);
    if (relevant.length > 0) {
      ragContext =
        "Notes from the user's brain (their own saved material, ground truth for this answer, " +
        "takes priority over the currently open problem below):\n" +
        relevant.map((r) => `[${r.sourceTitle}] ${r.text}`).join("\n\n") +
        "\n\n";
    }
  }

  const res = await fetch(OLLAMA_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: BUDDY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${ragContext}Currently open problem:\n${buddyContextForRoute(route)}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama responded ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const content = data?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Ollama returned an empty response");
  }
  return content.trim();
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function patternProblemIds(pattern: Pattern): string[] {
  return pattern.subpatterns.flatMap((sp) => sp.problems.map((p) => p.id));
}

function patternProblemCount(pattern: Pattern): number {
  return patternProblemIds(pattern).length;
}

// ─── Rendering ─────────────────────────────────────────────────────────────

const appEl = document.querySelector<HTMLDivElement>("#app")!;

function renderApp(): void {
  const route = parseRoute();
  appEl.innerHTML = `
    <div class="layout">
      <nav class="sidebar" id="sidebar">${renderSidebar(route)}</nav>
      <main class="content" id="content">${renderContent(route)}</main>
      <aside class="buddy-panel">${renderBuddyPanel()}</aside>
    </div>
    <footer class="app-footer">
      <span>DSA Study Buddy v1 &mdash; crash-visibility logging active</span>
      <button type="button" id="throw-test-error-btn" class="link-btn">Throw test error (debug)</button>
      <button type="button" id="export-logs-btn" class="link-btn">Export logs</button>
    </footer>
  `;
  wireContentEvents(route);
  wireFooterEvents();
  wireBuddyPanelEvents(route);
}

function renderSidebar(route: Route): string {
  const activePatternId = "patternId" in route ? route.patternId : undefined;
  const items = PATTERNS.map((pattern, i) => {
    const total = patternProblemCount(pattern);
    const solved = total > 0 ? countSolved(patternProblemIds(pattern)) : 0;
    const progressLabel = total > 0 ? `${solved}/${total}` : "soon";
    const active = pattern.id === activePatternId ? " active" : "";
    return `
      <a class="sidebar-item${active}" href="#/pattern/${pattern.id}">
        <span class="sidebar-index">${i + 1}</span>
        <span class="sidebar-name">${escapeHtml(pattern.name)}</span>
        <span class="sidebar-progress${total === 0 ? " sidebar-progress--stub" : ""}">${progressLabel}</span>
      </a>
    `;
  }).join("");

  const conceptsActive = route.view === "concepts" ? " active" : "";
  const referenceActive = route.view === "reference" || route.view === "referenceLang" || route.view === "refDeepDive" ? " active" : "";
  const brainActive = route.view === "brain" ? " active" : "";

  return `
    <a class="brand" href="#/">
      <span class="brand-mark">&lt;/&gt;</span>
      <span>DSA Study Buddy</span>
    </a>
    <div class="sidebar-list">${items}</div>
    <div class="sidebar-section-label">Reference</div>
    <a class="sidebar-item${conceptsActive}" href="#/concepts">
      <span class="sidebar-index">&#9733;</span>
      <span class="sidebar-name">System Design Concepts</span>
      <span class="sidebar-progress sidebar-progress--stub">${ARCHITECTURE_CONCEPT_COUNT}</span>
    </a>
    <a class="sidebar-item${referenceActive}" href="#/reference">
      <span class="sidebar-index">&#128218;</span>
      <span class="sidebar-name">Language &amp; Framework Reference</span>
      <span class="sidebar-progress sidebar-progress--stub">${REFERENCE_ITEM_COUNT}</span>
    </a>
    <a class="sidebar-item${brainActive}" href="#/brain">
      <span class="sidebar-index">&#129504;</span>
      <span class="sidebar-name">Feed the Brain</span>
      <span class="sidebar-progress${brainChunks.length === 0 ? " sidebar-progress--stub" : ""}">${brainChunks.length}</span>
    </a>
    <a class="sidebar-item${route.view === "export" ? " active" : ""}" href="#/export">
      <span class="sidebar-index">&#8593;</span>
      <span class="sidebar-name">Export to GitHub</span>
    </a>
  `;
}

function renderContent(route: Route): string {
  if (route.view === "list") return renderPatternList();
  if (route.view === "concepts") return renderConceptsPage();
  if (route.view === "deepDive") return renderDeepDivePage(route.id);
  if (route.view === "reference") return renderReferenceList();
  if (route.view === "referenceLang") return renderReferenceDetail(route.langId);
  if (route.view === "refDeepDive") return renderRefDeepDivePage(route.id);
  if (route.view === "brain") return renderBrainPage();
  if (route.view === "export") return renderExportPage();
  if (route.view === "pattern") return renderPatternDetail(route.patternId);
  if (route.view === "subpattern") return renderSubpatternDetail(route.patternId, route.subId);
  return renderProblemDetail(route.problemId);
}

function renderBrainPage(): string {
  const totalChars = brainChunks.reduce((sum, c) => sum + c.text.length, 0);
  const sourceCount = new Set(brainChunks.map((c) => c.sourceTitle)).size;

  const chunkList =
    brainChunks.length === 0
      ? `<p class="coming-soon">Nothing ingested yet.</p>`
      : `<div class="brain-chunk-list">
          ${brainChunks
            .map(
              (c) => `
                <div class="brain-chunk">
                  <strong>${escapeHtml(c.sourceTitle)}</strong> &mdash;
                  ${escapeHtml(c.text.slice(0, 160))}${c.text.length > 160 ? "…" : ""}
                </div>
              `
            )
            .join("")}
        </div>`;

  return `
    <h1>Feed the Brain</h1>
    <p class="lead">
      Paste in notes or textbook excerpts you want the buddy to remember. Text is chunked and
      embedded locally (via Ollama's <code>nomic-embed-text</code>) and stored in this browser's
      IndexedDB &mdash; nothing leaves your machine. When you ask a question with "Use the brain"
      checked, the most relevant chunks are retrieved and handed to the model before it answers.
      The model's own weights never change &mdash; only this retrieval library grows.
    </p>
    <form id="ingest-form">
      <input
        type="text"
        id="ingest-title"
        class="ingest-title-input"
        placeholder="Source title (e.g. 'CLRS ch.14 - Segment Trees')"
        autocomplete="off"
      />
      <textarea id="ingest-text" class="code-editor" placeholder="Paste text to learn..." rows="8"></textarea>
      <div class="editor-actions">
        <button type="submit" class="primary-btn" id="ingest-btn">Ingest</button>
        <button type="button" class="secondary-btn" id="clear-brain-btn">Clear brain</button>
      </div>
    </form>
    <div id="ingest-status" class="buddy-response"></div>
    <h2>What the brain knows (${brainChunks.length} chunks, ${sourceCount} source${sourceCount === 1 ? "" : "s"}, ${totalChars.toLocaleString()} chars)</h2>
    ${chunkList}
  `;
}

function renderExportPage(): string {
  const payload = buildExportPayload();
  const savedToken = getToken();

  const preview =
    payload.solvedCount === 0
      ? `<p class="coming-soon">Solve a problem first — nothing to export yet.</p>`
      : `<p class="lead">
          ${payload.solvedCount} problem${payload.solvedCount === 1 ? "" : "s"} solved, ready to push
          as ${payload.files.length} file${payload.files.length === 1 ? "" : "s"}
          (code files + a generated README index).
        </p>`;

  return `
    <h1>Export to GitHub</h1>
    <p class="lead">
      Push your solved solutions straight to a GitHub repo you own, organized by pattern with a
      generated README. Needs a
      <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">
        fine-grained personal access token
      </a>
      scoped to just that repo's Contents (read + write).
    </p>
    ${preview}
    <form id="export-form">
      <label class="export-field">
        <span>Personal access token</span>
        <input
          type="password"
          id="export-token"
          placeholder="github_pat_..."
          autocomplete="off"
          value="${savedToken ? escapeHtml(savedToken) : ""}"
        />
      </label>
      <div class="export-field-row">
        <label class="export-field">
          <span>Repo owner</span>
          <input type="text" id="export-owner" placeholder="rled7" autocomplete="off" />
        </label>
        <label class="export-field">
          <span>Repo name</span>
          <input type="text" id="export-repo" placeholder="my-dsa-solutions" autocomplete="off" />
        </label>
        <label class="export-field">
          <span>Branch (optional)</span>
          <input type="text" id="export-branch" placeholder="default branch" autocomplete="off" />
        </label>
      </div>
      <div class="editor-actions">
        <button type="submit" class="primary-btn" id="export-push-btn" ${payload.solvedCount === 0 ? "disabled" : ""}>
          Push to GitHub
        </button>
        <button type="button" class="secondary-btn" id="export-forget-token-btn">Forget saved token</button>
      </div>
    </form>
    <div id="export-status" class="buddy-response"></div>
  `;
}

function renderConceptsPage(): string {
  const groups = ARCHITECTURE_CATEGORIES.map((cat) => {
    const rows = cat.concepts
      .map((c) => {
        const term = c.deepDiveId
          ? `<a class="concept-term concept-term--linked" href="#/concepts/${c.deepDiveId}">${escapeHtml(c.term)} &rarr;</a>`
          : `<span class="concept-term">${escapeHtml(c.term)}</span>`;
        return `
          <div class="concept-item">
            ${term}
            <span class="concept-def">${escapeHtml(c.definition)}</span>
          </div>
        `;
      })
      .join("");
    return `
      <section class="concept-group">
        <h3 class="concept-group-title">${escapeHtml(cat.name)}</h3>
        <div class="concept-item-list">${rows}</div>
      </section>
    `;
  }).join("");

  return `
    <h1>System Design Concepts</h1>
    <p class="lead">
      Architecture-level concepts to know before building any scalable application. Coding interviews test the
      16 patterns; system-design interviews test these. A quick-reference glossary &mdash; ${ARCHITECTURE_CONCEPT_COUNT}
      terms across ${ARCHITECTURE_CATEGORIES.length} areas. You don't need them all today &mdash; keep learning, keep building.
      Terms with a &rarr; link to a deeper breakdown with named strategies, code, and diagrams.
    </p>
    <div class="concept-groups">${groups}</div>
  `;
}

/** Hand-drawn SVG visual for a specific deep-dive strategy. Empty string = no visual yet, fall back to ASCII. */
function renderStrategyVisual(strategyName: string): string {
  const wrap = (inner: string, caption: string): string => `
    <div class="strategy-diagram-wrap">
      <svg class="strategy-diagram" viewBox="0 0 300 128" xmlns="http://www.w3.org/2000/svg">${inner}</svg>
      <p class="strategy-diagram-caption">${escapeHtml(caption)}</p>
    </div>
  `;

  switch (strategyName) {
    case "Fixed Window Counter":
      return wrap(
        `
          <rect x="6" y="20" width="88" height="80" class="sd-box"></rect>
          <rect x="106" y="20" width="88" height="80" class="sd-box"></rect>
          <rect x="206" y="20" width="88" height="80" class="sd-box"></rect>
          <text x="50" y="114" text-anchor="middle" class="sd-label">0&ndash;60s</text>
          <text x="150" y="114" text-anchor="middle" class="sd-label">60&ndash;120s</text>
          <text x="250" y="114" text-anchor="middle" class="sd-label">120&ndash;180s</text>
          <polyline points="14,94 94,28 106,94 194,28 206,94 286,28" class="sd-line"></polyline>
          <circle cx="94" cy="28" r="4" class="sd-warn-dot"></circle>
          <circle cx="106" cy="94" r="4" class="sd-warn-dot"></circle>
          <text x="150" y="10" text-anchor="middle" class="sd-warn-label">boundary burst: up to 2&times; limit</text>
        `,
        "The counter resets hard at each window edge — a burst right before and right after the boundary can slip through at close to 2× the limit."
      );
    case "Sliding Window Log":
      return wrap(
        `
          <rect x="14" y="50" width="272" height="20" class="sd-window"></rect>
          <line x1="14" y1="60" x2="286" y2="60" class="sd-timeline"></line>
          <circle cx="40" cy="60" r="4" class="sd-dot"></circle>
          <circle cx="115" cy="60" r="4" class="sd-dot"></circle>
          <circle cx="200" cy="60" r="4" class="sd-dot"></circle>
          <circle cx="255" cy="60" r="4" class="sd-dot"></circle>
          <text x="14" y="40" class="sd-label">t&minus;60s</text>
          <text x="286" y="40" text-anchor="end" class="sd-label">now</text>
          <text x="150" y="90" text-anchor="middle" class="sd-note">each dot = one request timestamp, kept until it ages out</text>
          <text x="150" y="108" text-anchor="middle" class="sd-note">log.length &lt; limit &rarr; allow</text>
        `,
        "Every request is timestamped and logged; drop anything older than the window, then compare the log's length to the limit. Exact, but memory grows with request volume."
      );
    case "Sliding Window Counter":
      return wrap(
        `
          <rect x="10" y="24" width="130" height="60" class="sd-box-dim"></rect>
          <rect x="150" y="24" width="130" height="60" class="sd-box"></rect>
          <rect x="100" y="24" width="50" height="60" class="sd-overlap"></rect>
          <text x="75" y="18" text-anchor="middle" class="sd-label">prev window</text>
          <text x="215" y="18" text-anchor="middle" class="sd-label">current window</text>
          <text x="125" y="102" text-anchor="middle" class="sd-note">overlap weighted into the count</text>
          <text x="150" y="118" text-anchor="middle" class="sd-note">weighted = prevCount&times;overlap + currCount</text>
        `,
        "Only two fixed counters are kept — the previous window's count is weighted by how much it still overlaps the sliding window, approximating the log without storing every timestamp."
      );
    case "Token Bucket":
      return wrap(
        `
          <text x="150" y="10" text-anchor="middle" class="sd-note">refill: 10 tokens/sec</text>
          <line x1="150" y1="14" x2="150" y2="20" class="sd-arrow-line"></line>
          <polygon points="146,14 154,14 150,20" class="sd-arrowhead"></polygon>
          <path d="M110,24 L190,24 L178,92 L122,92 Z" class="sd-bucket"></path>
          <circle cx="136" cy="46" r="5" class="sd-token"></circle>
          <circle cx="157" cy="43" r="5" class="sd-token"></circle>
          <circle cx="146" cy="62" r="5" class="sd-token"></circle>
          <circle cx="165" cy="60" r="5" class="sd-token"></circle>
          <circle cx="132" cy="76" r="5" class="sd-token-empty"></circle>
          <circle cx="160" cy="78" r="5" class="sd-token-empty"></circle>
          <line x1="150" y1="94" x2="150" y2="108" class="sd-arrow-line"></line>
          <polygon points="146,102 154,102 150,108" class="sd-arrowhead"></polygon>
          <text x="150" y="122" text-anchor="middle" class="sd-note">&minus;1 token / request, reject if empty</text>
        `,
        "Tokens refill at a steady rate; a request is allowed only if the bucket still has a token. Bursts up to the bucket's size pass through, while the long-run rate stays capped."
      );
    case "Leaky Bucket":
      return wrap(
        `
          <text x="150" y="10" text-anchor="middle" class="sd-note">requests queue in</text>
          <line x1="130" y1="14" x2="130" y2="20" class="sd-arrow-line"></line>
          <polygon points="126,14 134,14 130,20" class="sd-arrowhead"></polygon>
          <line x1="170" y1="14" x2="170" y2="20" class="sd-arrow-line"></line>
          <polygon points="166,14 174,14 170,20" class="sd-arrowhead"></polygon>
          <path d="M110,24 L190,24 L178,92 L122,92 Z" class="sd-bucket"></path>
          <circle cx="216" cy="30" r="4" class="sd-warn-dot"></circle>
          <text x="228" y="34" class="sd-note-warn">full &rarr; reject</text>
          <line x1="150" y1="94" x2="150" y2="108" class="sd-arrow-line"></line>
          <polygon points="146,102 154,102 150,108" class="sd-arrowhead"></polygon>
          <text x="150" y="122" text-anchor="middle" class="sd-note">leaks out at one fixed rate</text>
        `,
        "Requests queue into a fixed-size bucket that drains at a constant rate. New requests are dropped once the bucket is full — this smooths bursts into one steady output rate instead of letting them through."
      );
    default:
      return "";
  }
}

function renderDeepDivePage(id: string): string {
  const dive = findDeepDive(id);
  if (!dive) return renderNotFound("Deep dive not found.");

  const strategies = dive.strategies
    .map((s) => {
      const visual = renderStrategyVisual(s.name);
      return `
        <section class="deepdive-strategy">
          <h3 class="deepdive-strategy-name">${escapeHtml(s.name)}</h3>
          <p class="deepdive-strategy-desc">${escapeHtml(s.description)}</p>
          <div class="deepdive-panels">
            <div class="deepdive-panel">
              <span class="deepdive-panel-label">Flow</span>
              ${
                visual
                  ? visual
                  : `<pre class="deepdive-diagram">${escapeHtml(s.diagram)}</pre>`
              }
            </div>
            <div class="deepdive-panel">
              <span class="deepdive-panel-label">Code</span>
              <pre class="deepdive-code"><code>${escapeHtml(s.code)}</code></pre>
            </div>
          </div>
        </section>
      `;
    })
    .join("");

  const practiceCta = dive.practiceSubId
    ? `
      <a class="deepdive-practice-cta" href="#/pattern/system-design/sub/${dive.practiceSubId}">
        Practice this &rarr; solve the graded problems for ${escapeHtml(dive.title)}
      </a>
    `
    : "";

  return `
    <p class="breadcrumb"><a href="#/concepts">System Design Concepts</a></p>
    <h1>${escapeHtml(dive.title)}</h1>
    <p class="lead">${escapeHtml(dive.intro)}</p>
    ${practiceCta}
    <div class="deepdive-strategy-list">${strategies}</div>
  `;
}

const LEVEL_LABEL: Record<RefLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function renderReferenceList(): string {
  return `
    <h1>Language &amp; Framework Reference</h1>
    <p class="lead">
      Curated core methods and concepts, leveled beginner &rarr; advanced, per language and framework.
      This is a hand-picked reference, not an exhaustive dump &mdash; for anything not listed here, ask
      the buddy panel on the right; the local model can answer arbitrary method questions on demand.
    </p>
    <div class="pattern-grid">
      ${LANGUAGE_REFS.map((lang) => {
        const count = referenceItemCount(lang.id);
        return `
          <a class="pattern-card${count === 0 ? " pattern-card--stub" : ""}" href="#/reference/${lang.id}">
            <h3>${escapeHtml(lang.name)}</h3>
            <p>${escapeHtml(lang.tagline)}</p>
            <span class="badge">${count > 0 ? `${count} entries` : "coming soon"}</span>
          </a>
        `;
      }).join("")}
    </div>
  `;
}

function renderReferenceDetail(langId: string): string {
  const lang = LANGUAGE_REFS.find((l) => l.id === langId);
  if (!lang) return renderNotFound("Language reference not found.");

  if (lang.categories.length === 0) {
    return `
      <p class="breadcrumb"><a href="#/reference">Language &amp; Framework Reference</a></p>
      <h1>${escapeHtml(lang.name)}</h1>
      <p class="lead">${escapeHtml(lang.tagline)}</p>
      <p class="coming-soon">
        Curated reference for ${escapeHtml(lang.name)} is coming soon. In the meantime, ask the buddy
        panel on the right &mdash; it can answer method/syntax questions for ${escapeHtml(lang.name)} directly.
      </p>
    `;
  }

  const groups = lang.categories
    .map((cat) => {
      const rows = cat.items
        .map((item) => {
          const name = item.deepDiveId
            ? `<a class="ref-item-name ref-item-name--linked" href="#/reference/deepdive/${item.deepDiveId}">${escapeHtml(item.name)} &rarr;</a>`
            : `<span class="ref-item-name">${escapeHtml(item.name)}</span>`;
          return `
            <div class="ref-item">
              <div class="ref-item-head">
                ${name}
                <span class="ref-level-badge ref-level-badge--${item.level}">${LEVEL_LABEL[item.level]}</span>
              </div>
              <p class="ref-item-summary">${escapeHtml(item.summary)}</p>
              ${item.example ? `<code class="ref-item-example">${escapeHtml(item.example)}</code>` : ""}
            </div>
          `;
        })
        .join("");
      return `
        <section class="concept-group">
          <h3 class="concept-group-title">${escapeHtml(cat.name)}</h3>
          <div class="ref-item-list">${rows}</div>
        </section>
      `;
    })
    .join("");

  return `
    <p class="breadcrumb"><a href="#/reference">Language &amp; Framework Reference</a></p>
    <h1>${escapeHtml(lang.name)}</h1>
    <p class="lead">
      ${escapeHtml(lang.tagline)} &mdash; ${referenceItemCount(lang.id)} curated entries across
      ${lang.categories.length} categories, ordered beginner &rarr; advanced within each. Anything not
      listed here? Ask the buddy panel.
    </p>
    <div class="concept-groups">${groups}</div>
  `;
}

function renderRefDeepDivePage(id: string): string {
  const dive = findReferenceDeepDive(id);
  if (!dive) return renderNotFound("Reference deep dive not found.");

  const lang = LANGUAGE_REFS.find((l) => l.id === dive.langId);
  const gotchas = dive.gotchas.map((g) => `<li>${escapeHtml(g)}</li>`).join("");
  const related = dive.related?.length
    ? `
      <p class="refdive-related">
        <span class="deepdive-panel-label">Related</span>
        ${dive.related.map((r) => `<code class="ref-item-example">${escapeHtml(r)}</code>`).join(" &middot; ")}
      </p>
    `
    : "";

  return `
    <p class="breadcrumb"><a href="#/reference/${dive.langId}">${escapeHtml(lang?.name ?? dive.langId)}</a></p>
    <h1>${escapeHtml(dive.title)}</h1>
    <p class="lead">${escapeHtml(dive.intro)}</p>
    <div class="deepdive-panels">
      <div class="deepdive-panel refdive-gotchas-panel">
        <span class="deepdive-panel-label">Gotchas</span>
        <ul class="refdive-gotchas">${gotchas}</ul>
      </div>
      <div class="deepdive-panel">
        <span class="deepdive-panel-label">Code</span>
        <pre class="deepdive-code"><code>${escapeHtml(dive.code)}</code></pre>
      </div>
    </div>
    ${related}
  `;
}

function renderPatternList(): string {
  const totalProblems = PATTERNS.reduce((sum, p) => sum + patternProblemCount(p), 0);
  const totalSolved = countSolved(PATTERNS.flatMap(patternProblemIds));
  return `
    <h1>The 16 DSA Patterns</h1>
    <p class="lead">
      Every technical interview question is a remix of a small set of patterns. Pick a pattern to see its
      sub-patterns, then pick a sub-pattern to see a plain-English explanation and practice problems.
    </p>
    <p class="overall-progress">Overall progress: <strong>${totalSolved}/${totalProblems}</strong> seeded problems solved.</p>
    <div class="pattern-grid">
      ${PATTERNS.map((pattern) => {
        const total = patternProblemCount(pattern);
        const solved = total > 0 ? countSolved(patternProblemIds(pattern)) : 0;
        return `
          <a class="pattern-card${total === 0 ? " pattern-card--stub" : ""}" href="#/pattern/${pattern.id}">
            <h3>${escapeHtml(pattern.name)}</h3>
            <p>${pattern.subpatterns.length} sub-patterns</p>
            <span class="badge">${total > 0 ? `${solved}/${total} solved` : "structure only"}</span>
          </a>
        `;
      }).join("")}
    </div>
  `;
}

function renderSystemDesignDiagram(): string {
  const box = (x: number, y: number, w: number, h: number, label: string, sub: string, subId?: string): string => {
    const cx = x + w / 2;
    const content = `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"></rect>
      <text x="${cx}" y="${y + h / 2 - 4}" text-anchor="middle">${escapeHtml(label)}</text>
      <text class="sysdes-diagram-sub" x="${cx}" y="${y + h / 2 + 12}" text-anchor="middle">${escapeHtml(sub)}</text>
    `;
    return subId
      ? `<a href="#/pattern/system-design/sub/${subId}" class="sysdes-diagram-box">${content}</a>`
      : `<g class="sysdes-diagram-box">${content}</g>`;
  };
  const edge = (path: string): string =>
    `<path class="sysdes-diagram-edge" d="${path}" marker-end="url(#sysdes-arrow)"></path>`;

  return `
    <div class="sysdes-diagram-wrap">
      <p class="sysdes-diagram-caption">
        Where these building blocks sit in a typical request path — click any box to jump to that sub-pattern.
      </p>
      <svg class="sysdes-diagram" viewBox="0 0 860 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="sysdes-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="sysdes-diagram-arrowhead" d="M0,0 L10,5 L0,10 z"></path>
          </marker>
        </defs>
        ${edge("M112,150 L148,150")}
        ${edge("M280,150 L316,150")}
        ${edge("M428,150 L464,46")}
        ${edge("M428,150 L464,150")}
        ${edge("M428,150 L464,254")}
        ${edge("M614,46 L650,150")}
        ${edge("M614,150 L650,150")}
        ${edge("M614,254 L650,150")}
        ${box(8, 122, 104, 56, "Client", "issues a request")}
        ${box(148, 122, 132, 56, "Traffic Control", "rate limit / idempotency", "sysdes-traffic-control")}
        ${box(316, 122, 112, 56, "Caching", "LRU / LFU eviction", "sysdes-caching")}
        ${box(464, 18, 150, 56, "Search & Indexing", "trie / inverted index", "sysdes-search")}
        ${box(464, 122, 150, 56, "Coordination", "leader election", "sysdes-distributed-coordination")}
        ${box(464, 226, 150, 56, "Probabilistic", "bloom / count-min", "sysdes-probabilistic")}
        ${box(650, 122, 140, 56, "Observability", "metrics & dashboards", "sysdes-observability")}
      </svg>
    </div>
  `;
}

function renderPatternDetail(patternId: string): string {
  const pattern = PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return renderNotFound("Pattern not found.");

  return `
    <p class="breadcrumb"><a href="#/">All patterns</a></p>
    <h1>${escapeHtml(pattern.name)}</h1>
    <p class="lead">Sub-patterns within ${escapeHtml(pattern.name)}:</p>
    ${pattern.id === "system-design" ? renderSystemDesignDiagram() : ""}
    <div class="subpattern-list">
      ${pattern.subpatterns
        .map((sp) => {
          const solved = countSolved(sp.problems.map((p) => p.id));
          return `
            <a class="subpattern-card" href="#/pattern/${pattern.id}/sub/${sp.id}">
              <h3>${escapeHtml(sp.name)}</h3>
              <p>${escapeHtml(sp.explanation)}</p>
              <span class="badge">${
                sp.problems.length > 0 ? `${solved}/${sp.problems.length} solved` : "problems coming soon"
              }</span>
            </a>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderSubpatternDetail(patternId: string, subId: string): string {
  const pattern = PATTERNS.find((p) => p.id === patternId);
  const sub = pattern?.subpatterns.find((s) => s.id === subId);
  if (!pattern || !sub) return renderNotFound("Sub-pattern not found.");

  return `
    <p class="breadcrumb"><a href="#/">All patterns</a> &rsaquo; <a href="#/pattern/${pattern.id}">${escapeHtml(
      pattern.name
    )}</a></p>
    <h1>${escapeHtml(sub.name)}</h1>
    <p class="lead">${escapeHtml(sub.explanation)}</p>
    ${
      sub.problems.length === 0
        ? `<p class="coming-soon">Problems coming soon for this sub-pattern.</p>`
        : `<div class="problem-list">
            ${sub.problems
              .map((prob) => {
                const solved = isSolved(prob.id);
                return `
                  <a class="problem-card" href="#/problem/${prob.id}">
                    <h3>${escapeHtml(prob.title)} ${solved ? '<span class="solved-check">&check; Solved</span>' : ""}</h3>
                    <span class="badge badge--${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
                  </a>
                `;
              })
              .join("")}
          </div>`
    }
  `;
}

function renderProblemDetail(problemId: string): string {
  const found = findProblem(problemId);
  if (!found) return renderNotFound("Problem not found.");
  const { pattern, subpattern, problem } = found;

  if (currentProblemId !== problem.id) {
    currentProblemId = problem.id;
    currentRunResult = null;
    currentCode = null;
  }
  const code = currentCode ?? problem.starterCode;
  const solved = isSolved(problem.id);

  return `
    <p class="breadcrumb">
      <a href="#/">All patterns</a> &rsaquo;
      <a href="#/pattern/${pattern.id}">${escapeHtml(pattern.name)}</a> &rsaquo;
      <a href="#/pattern/${pattern.id}/sub/${subpattern.id}">${escapeHtml(subpattern.name)}</a>
    </p>
    <h1>${escapeHtml(problem.title)} ${solved ? '<span class="solved-check">&check; Solved</span>' : ""}</h1>
    <span class="badge badge--${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
    <div class="description">${escapeHtml(problem.description)
      .split("\n\n")
      .map((para) => `<p>${para}</p>`)
      .join("")}</div>

    <h2>Your solution</h2>
    <textarea id="code-editor" class="code-editor" spellcheck="false">${escapeHtml(code)}</textarea>
    <div class="editor-actions">
      <button type="button" id="run-tests-btn" class="primary-btn">Run tests</button>
      <button type="button" id="show-solution-btn" class="secondary-btn">Show solution</button>
    </div>

    <div id="solution-reveal" class="solution-reveal" hidden>
      ${
        problem.solutions && problem.solutions.length > 0
          ? `<h3>Reference solutions (fastest &rarr; slowest)</h3>
             <div class="solutions-list">
               ${problem.solutions
                 .map(
                   (sol, i) => `
                 <div class="solution-approach">
                   <h4>${i + 1}. ${escapeHtml(sol.approach)}</h4>
                   <p class="solution-complexity"><strong>Time:</strong> ${escapeHtml(sol.timeComplexity)} &middot; <strong>Space:</strong> ${escapeHtml(sol.spaceComplexity)}</p>
                   <p class="solution-explanation">${escapeHtml(sol.explanation)}</p>
                   <pre class="solution-code-block">${escapeHtml(sol.code)}</pre>
                 </div>`,
                 )
                 .join("")}
             </div>`
          : `<h3>Reference solution</h3>
             <pre id="solution-code"></pre>`
      }
    </div>

    <div id="test-results">${currentRunResult ? renderTestResults(currentRunResult) : ""}</div>
  `;
}

function renderTestResults(result: RunResult): string {
  if (result.compileError) {
    return `
      <div class="run-summary run-summary--fail">Could not run your code: ${escapeHtml(result.compileError)}</div>
    `;
  }

  const summary = result.allPassed
    ? `<div class="run-summary run-summary--pass">All ${result.results.length} test cases passed.</div>`
    : `<div class="run-summary run-summary--fail">${result.results.filter((r) => r.pass).length}/${
        result.results.length
      } test cases passed.</div>`;

  const rows = result.results
    .map(
      (r) => `
        <div class="test-case test-case--${r.pass ? "pass" : "fail"}">
          <span class="test-case-label">${r.pass ? "PASS" : "FAIL"} #${r.index + 1}</span>
          <span class="test-case-field"><strong>input:</strong> ${escapeHtml(formatValue(r.input))}</span>
          <span class="test-case-field"><strong>expected:</strong> ${escapeHtml(formatValue(r.expected))}</span>
          <span class="test-case-field"><strong>got:</strong> ${
            r.error ? `threw: ${escapeHtml(r.error)}` : escapeHtml(formatValue(r.got))
          }</span>
        </div>
      `
    )
    .join("");

  return `${summary}<div class="test-case-list">${rows}</div>`;
}

function renderNotFound(msg: string): string {
  return `<p class="breadcrumb"><a href="#/">All patterns</a></p><h1>Not found</h1><p>${escapeHtml(msg)}</p>`;
}

function renderBuddyPanel(): string {
  const hasBrain = brainChunks.length > 0;
  return `
    <h2>Ask the Buddy</h2>
    <p class="buddy-stub-note">
      Answered locally by ${escapeHtml(OLLAMA_MODEL)} via Ollama &mdash; offline, no API key.
    </p>
    <label class="buddy-rag-toggle">
      <input type="checkbox" id="buddy-rag-toggle" ${hasBrain ? "checked" : "disabled"} />
      Use the brain (${brainChunks.length} chunk${brainChunks.length === 1 ? "" : "s"} learned)
    </label>
    <form id="buddy-form">
      <input type="text" id="buddy-input" placeholder="Ask about this problem..." autocomplete="off" />
      <button type="submit" class="primary-btn">Ask</button>
    </form>
    <div id="buddy-response" class="buddy-response"></div>
  `;
}

// ─── Event wiring ──────────────────────────────────────────────────────────

function wireContentEvents(route: Route): void {
  if (route.view === "brain") {
    wireBrainPageEvents();
    return;
  }
  if (route.view === "export") {
    wireExportPageEvents();
    return;
  }
  if (route.view !== "problem") return;
  const found = findProblem(route.problemId);
  if (!found) return;
  const { problem } = found;

  const editor = document.querySelector<HTMLTextAreaElement>("#code-editor")!;
  const runBtn = document.querySelector<HTMLButtonElement>("#run-tests-btn")!;
  const showSolutionBtn = document.querySelector<HTMLButtonElement>("#show-solution-btn")!;
  const solutionReveal = document.querySelector<HTMLDivElement>("#solution-reveal")!;
  const solutionCode = document.querySelector<HTMLPreElement>("#solution-code");

  runBtn.addEventListener("click", () => {
    currentCode = editor.value;
    currentRunResult = runTests(editor.value, problem);
    if (currentRunResult.allPassed) {
      markSolved(problem.id);
      saveSolutionCode(problem.id, editor.value);
    }
    renderApp();
  });

  showSolutionBtn.addEventListener("click", () => {
    if (solutionCode) solutionCode.textContent = problem.solution;
    solutionReveal.hidden = !solutionReveal.hidden;
  });
}

function wireBrainPageEvents(): void {
  const form = document.querySelector<HTMLFormElement>("#ingest-form")!;
  const titleInput = document.querySelector<HTMLInputElement>("#ingest-title")!;
  const textInput = document.querySelector<HTMLTextAreaElement>("#ingest-text")!;
  const ingestBtn = document.querySelector<HTMLButtonElement>("#ingest-btn")!;
  const clearBtn = document.querySelector<HTMLButtonElement>("#clear-brain-btn")!;
  const status = document.querySelector<HTMLDivElement>("#ingest-status")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim() || "Untitled";
    const text = textInput.value.trim();
    if (!text) return;

    ingestBtn.disabled = true;
    status.classList.remove("buddy-response--error");
    status.textContent = "Ingesting (chunking + embedding locally)…";

    ingestText(title, text)
      .then(({ chunksAdded }) => refreshBrainChunks().then(() => ({ chunksAdded })))
      .then(({ chunksAdded }) => {
        titleInput.value = "";
        textInput.value = "";
        renderApp();
        const newStatus = document.querySelector<HTMLDivElement>("#ingest-status")!;
        newStatus.textContent = `Learned ${chunksAdded} chunk(s) from "${title}".`;
      })
      .catch((err) => {
        console.error("Ingest failed:", err);
        status.classList.add("buddy-response--error");
        status.textContent =
          "Couldn't ingest. Make sure Ollama is running (\"brew services start ollama\") and " +
          '"nomic-embed-text" is pulled ("ollama pull nomic-embed-text").';
        ingestBtn.disabled = false;
      });
  });

  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear everything the brain has learned? This can't be undone.")) return;
    clearBrain()
      .then(() => refreshBrainChunks())
      .then(renderApp);
  });
}

function renderPushSummary(summary: PushSummary): string {
  const rows = summary.results
    .map((r) => {
      const label = r.status === "failed" ? `failed — ${escapeHtml(r.error ?? "unknown error")}` : r.status;
      return `<li class="export-result export-result--${r.status}">${escapeHtml(r.path)}: ${label}</li>`;
    })
    .join("");
  const failCount = summary.results.filter((r) => r.status === "failed").length;
  return `
    <p>
      Pushed to <a href="${summary.repoUrl}/tree/${summary.branch}" target="_blank" rel="noopener">
        ${escapeHtml(summary.repoUrl.replace("https://github.com/", ""))}@${escapeHtml(summary.branch)}
      </a>${failCount > 0 ? ` — ${failCount} of ${summary.results.length} file(s) failed:` : ", all files succeeded:"}
    </p>
    <ul class="export-result-list">${rows}</ul>
  `;
}

function wireExportPageEvents(): void {
  const form = document.querySelector<HTMLFormElement>("#export-form")!;
  const tokenInput = document.querySelector<HTMLInputElement>("#export-token")!;
  const ownerInput = document.querySelector<HTMLInputElement>("#export-owner")!;
  const repoInput = document.querySelector<HTMLInputElement>("#export-repo")!;
  const branchInput = document.querySelector<HTMLInputElement>("#export-branch")!;
  const pushBtn = document.querySelector<HTMLButtonElement>("#export-push-btn")!;
  const forgetBtn = document.querySelector<HTMLButtonElement>("#export-forget-token-btn")!;
  const status = document.querySelector<HTMLDivElement>("#export-status")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    const owner = ownerInput.value.trim();
    const repo = repoInput.value.trim();
    const branch = branchInput.value.trim();
    if (!token || !owner || !repo) {
      status.classList.add("buddy-response--error");
      status.textContent = "Token, owner, and repo are all required.";
      return;
    }

    saveToken(token);
    pushBtn.disabled = true;
    status.classList.remove("buddy-response--error");
    status.textContent = "Pushing…";

    const payload = buildExportPayload();
    pushExportToGitHub(payload, { token, owner, repo, branch: branch || undefined })
      .then((summary) => {
        const failCount = summary.results.filter((r) => r.status === "failed").length;
        status.classList.toggle("buddy-response--error", failCount > 0);
        status.innerHTML = renderPushSummary(summary);
        pushBtn.disabled = false;
      })
      .catch((err) => {
        console.error("Export push failed:", err);
        status.classList.add("buddy-response--error");
        status.textContent = err instanceof Error ? err.message : "Push failed.";
        pushBtn.disabled = false;
      });
  });

  forgetBtn.addEventListener("click", () => {
    clearToken();
    tokenInput.value = "";
    status.classList.remove("buddy-response--error");
    status.textContent = "Saved token forgotten.";
  });
}

function wireFooterEvents(): void {
  document.querySelector<HTMLButtonElement>("#throw-test-error-btn")!.addEventListener("click", () => {
    // Deliberately throw, uncaught, to demonstrate the logger captures it.
    // Runs on a fresh task via setTimeout so it's a genuine uncaught error
    // (not swallowed by an enclosing try/catch from an event handler).
    setTimeout(() => {
      throw new Error("Deliberate test error from DSA Study Buddy — this proves the logger works.");
    }, 0);
  });

  document.querySelector<HTMLButtonElement>("#export-logs-btn")!.addEventListener("click", () => {
    Logger.exportLogs();
  });
}

function wireBuddyPanelEvents(route: Route): void {
  const form = document.querySelector<HTMLFormElement>("#buddy-form")!;
  const input = document.querySelector<HTMLInputElement>("#buddy-input")!;
  const response = document.querySelector<HTMLDivElement>("#buddy-response")!;
  const askBtn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
  const ragToggle = document.querySelector<HTMLInputElement>("#buddy-rag-toggle")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    askBtn.disabled = true;
    input.disabled = true;
    response.classList.remove("buddy-response--error");
    response.textContent = "Thinking…";

    askBuddy(question, route, ragToggle.checked)
      .then((answer) => {
        response.textContent = answer;
      })
      .catch((err) => {
        // Mirrors the crash-visibility standard the rest of this app follows:
        // a failed local-model call is a real error, not a silent no-op.
        console.error("Buddy panel request failed:", err);
        response.classList.add("buddy-response--error");
        response.textContent =
          "Couldn't reach the local model. Make sure Ollama is running " +
          `("brew services start ollama") and "${OLLAMA_MODEL}" is pulled ` +
          `("ollama pull ${OLLAMA_MODEL}").`;
      })
      .finally(() => {
        askBtn.disabled = false;
        input.disabled = false;
      });
  });
}

// ─── Boot ──────────────────────────────────────────────────────────────────

window.addEventListener("hashchange", renderApp);
renderApp();
refreshBrainChunks().then(renderApp);
