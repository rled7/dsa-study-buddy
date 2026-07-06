import "./style.css";
import { Logger } from "./logger";

// Install crash-visibility logging FIRST, before anything else runs, so
// nothing can throw before it's wired up.
Logger.install();

import { PATTERNS, findProblem } from "./data/curriculum";
import { ARCHITECTURE_CATEGORIES, ARCHITECTURE_CONCEPT_COUNT } from "./data/architecture";
import type { Pattern } from "./data/types";
import { runTests, formatValue, type RunResult } from "./runner";
import { isSolved, markSolved, countSolved } from "./progress";

// ─── Routing ───────────────────────────────────────────────────────────────

type Route =
  | { view: "list" }
  | { view: "concepts" }
  | { view: "pattern"; patternId: string }
  | { view: "subpattern"; patternId: string; subId: string }
  | { view: "problem"; problemId: string };

function parseRoute(): Route {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "concepts") {
    return { view: "concepts" };
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
  wireBuddyPanelEvents();
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
  `;
}

function renderContent(route: Route): string {
  if (route.view === "list") return renderPatternList();
  if (route.view === "concepts") return renderConceptsPage();
  if (route.view === "pattern") return renderPatternDetail(route.patternId);
  if (route.view === "subpattern") return renderSubpatternDetail(route.patternId, route.subId);
  return renderProblemDetail(route.problemId);
}

function renderConceptsPage(): string {
  const groups = ARCHITECTURE_CATEGORIES.map((cat) => {
    const rows = cat.concepts
      .map(
        (c) => `
          <div class="concept-item">
            <span class="concept-term">${escapeHtml(c.term)}</span>
            <span class="concept-def">${escapeHtml(c.definition)}</span>
          </div>
        `
      )
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
    </p>
    <div class="concept-groups">${groups}</div>
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

function renderPatternDetail(patternId: string): string {
  const pattern = PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return renderNotFound("Pattern not found.");

  return `
    <p class="breadcrumb"><a href="#/">All patterns</a></p>
    <h1>${escapeHtml(pattern.name)}</h1>
    <p class="lead">Sub-patterns within ${escapeHtml(pattern.name)}:</p>
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
      <h3>Reference solution</h3>
      <pre id="solution-code"></pre>
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
  return `
    <h2>Ask the Buddy</h2>
    <p class="buddy-stub-note">
      Local AI arrives in v2 (Ollama) &mdash; this is where your offline coding buddy will answer.
    </p>
    <form id="buddy-form">
      <input type="text" id="buddy-input" placeholder="Ask about this problem..." autocomplete="off" />
      <button type="submit" class="primary-btn">Ask</button>
    </form>
    <div id="buddy-response" class="buddy-response"></div>
  `;
}

// ─── Event wiring ──────────────────────────────────────────────────────────

function wireContentEvents(route: Route): void {
  if (route.view !== "problem") return;
  const found = findProblem(route.problemId);
  if (!found) return;
  const { problem } = found;

  const editor = document.querySelector<HTMLTextAreaElement>("#code-editor")!;
  const runBtn = document.querySelector<HTMLButtonElement>("#run-tests-btn")!;
  const showSolutionBtn = document.querySelector<HTMLButtonElement>("#show-solution-btn")!;
  const solutionReveal = document.querySelector<HTMLDivElement>("#solution-reveal")!;
  const solutionCode = document.querySelector<HTMLPreElement>("#solution-code")!;

  runBtn.addEventListener("click", () => {
    currentCode = editor.value;
    currentRunResult = runTests(editor.value, problem);
    if (currentRunResult.allPassed) markSolved(problem.id);
    renderApp();
  });

  showSolutionBtn.addEventListener("click", () => {
    solutionCode.textContent = problem.solution;
    solutionReveal.hidden = !solutionReveal.hidden;
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

function wireBuddyPanelEvents(): void {
  const form = document.querySelector<HTMLFormElement>("#buddy-form")!;
  const input = document.querySelector<HTMLInputElement>("#buddy-input")!;
  const response = document.querySelector<HTMLDivElement>("#buddy-response")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = input.value.trim();
    response.textContent = question
      ? `Local AI arrives in v2 (Ollama) — this is where your offline coding buddy will answer. (You asked: "${question}")`
      : "Local AI arrives in v2 (Ollama) — this is where your offline coding buddy will answer.";
  });
}

// ─── Boot ──────────────────────────────────────────────────────────────────

window.addEventListener("hashchange", renderApp);
renderApp();
