# Mobile Approaches Note

Working notes for turning the web-only DSA Study Buddy into Android + iOS apps, as a
learning exercise. Two independent axes, kept separate on purpose: **how it gets packaged**
(Axis A) and **how the AI features behave without a Mac on localhost** (Axis B).

## Axis A — Packaging / distribution

| Approach | What it actually is | Tooling needed | Effort | What it teaches |
|---|---|---|---|---|
| **PWA** | Add `manifest.json` + a service worker to the existing Vite app. Installs to the home screen on Android and iOS, works offline via cached assets. Still "a website" under the hood — no App/Play Store listing. | None beyond the existing Vite/TS toolchain. | Lowest | Web app manifests, service worker lifecycle (install/activate/fetch), cache strategies, what "installable" actually means on each OS. |
| **Capacitor** | Ionic's native wrapper: takes the built `dist/` output and drops it into a real native WebView shell per platform. Produces an actual Android APK / iOS app you can run on a device or emulator, and could eventually ship to the stores. Native plugins (camera, filesystem, etc.) are available if ever needed, though this app doesn't need them yet. | Full **Xcode.app** (not just CLI tools) + CocoaPods for iOS; **Android Studio/SDK** + a JDK for Android. Confirmed **none of these are installed** on this machine as of 2026-07-06. | Medium | Native app packaging/signing, the Gradle/Xcode build pipelines, how a WebView-hosted app differs from a browser tab (permissions, lifecycle, native bridge). |
| **React Native** | A genuine UI rewrite in RN — not a wrap. Reuses none of `src/main.ts`'s DOM code, though data/logic (curriculum data, runner eval logic) ports over conceptually. | Node (have it) + Xcode + Android Studio/SDK, same native deps as Capacitor plus RN's own CLI/Metro bundler. | High | Already known by the user — this pass is mostly a refresher/port exercise, not new learning. |
| **Flutter** | A genuine UI rewrite in Dart/Flutter. New framework for the user. | Flutter SDK + Xcode + Android Studio/SDK. | High | New language (Dart), new widget-tree UI model, genuinely different mental model from the DOM — the most novel of the four for this user specifically. |

**Decision (2026-07-06):** going through all four, in this order: **PWA → Capacitor →
React Native → Flutter**. Rationale: PWA needs zero installs and teaches real concepts
immediately; Capacitor is the technique the user has never heard of and wants explained;
RN is a refresher (already known); Flutter is saved for last as the biggest genuinely-new
skill. Native toolchain installs (Xcode.app, Android Studio/SDK, Java, CocoaPods, Flutter
SDK) are confirmed with the user before each one actually runs, since they're multi-GB,
semi-heavy local environment changes.

## Axis B — AI features (buddy + brain) on a real device

The v2 "Ask the Buddy" and v3 "Feed the Brain" features call Ollama directly from the
browser at `http://localhost:11434`. On a phone, `localhost` resolves to the phone itself
— there is no Ollama there. This is **true regardless of which Axis A approach is used**
(PWA, Capacitor, RN, and Flutter all hit the same wall equally; packaging doesn't fix it).

Options considered:
- **Point at the Mac's LAN IP** — bind Ollama to `0.0.0.0`, add a configurable host setting,
  works only when the phone and Mac share a network. Lowest effort, but not "really mobile."
- **Desktop-only AI** — ship v1 (curriculum + runner) on mobile, hide buddy/brain there.
- **On-device LLM** — run a small model directly on the phone. No network dependency at
  all once set up; the real "mobile AI" answer, but meaningfully heavier R&D.

**Decision (2026-07-06):** exploring **on-device LLM**. This needs its own research pass
per packaging approach, since the mechanism differs:
- **PWA**: in-browser inference via WebGPU/WASM — e.g. **WebLLM** (MLC's browser runtime)
  or **transformers.js**. Runs in the existing Vite app almost unchanged; biggest question
  is model size vs. phone RAM/thermals.
- **Capacitor**: no browser WebGPU guarantee inside a WebView, so this likely needs a
  **native plugin** bridging to an on-device runtime — e.g. **MLC-LLM**'s native SDKs or
  **llama.cpp**'s mobile builds — invoked from JS via a custom Capacitor plugin.
  Also worth checking whether Capacitor's WebView actually supports WebGPU/WASM-SIMD well
  enough to just reuse the PWA approach here before reaching for a native plugin.
- **React Native**: native bindings such as **llama.rn** (llama.cpp binding) or similar.
- **Flutter**: native bindings such as **fllama** or **flutter_gemma**.

Not yet researched in depth — this is a placeholder for findings as each phase happens.

## Dev technique: testing a local server on a real phone (quick HTTPS tunnel)

Real-device testing (PWA install, service worker offline behavior, anything requiring a
"secure context") needs HTTPS — plain `http://<lan-ip>:port` doesn't qualify, only
`http://localhost` is exempted, which a phone can't reach. `cloudflared`'s **quick tunnel**
solves this without any account/signup:

```bash
brew install cloudflared          # ~40MB, one-time
cloudflared tunnel --url http://localhost:4322   # <- your local server's port
```

This prints a random `https://<random-words>.trycloudflare.com` URL that proxies straight to
your local server, valid for as long as the command keeps running, then gone. Two gotchas
hit while setting this up:

1. **Vite's preview/dev server rejects unrecognized `Host` headers by default** (DNS-rebinding
   protection) — the tunnel's `*.trycloudflare.com` Host gets a 403 until it's allowlisted.
   Fix in `vite.config.ts`:
   ```ts
   export default defineConfig({
     preview: { allowedHosts: [".trycloudflare.com"] },
   });
   ```
2. It's a **public** URL — anyone who has it can reach your local server for as long as the
   tunnel runs. Fine for a few minutes of manual device testing; kill the process (or just
   stop the machine) when done. Not something to leave running unattended.

Generalizes beyond this project: any time "does this work on a real phone/device" comes up
for something running locally, this is the fast way to get there — much lighter than deploying
somewhere real just to test.

## Capacitor vs React Native vs Flutter — engineering tradeoffs (deep dive)

The Axis A table above answers "what does each approach cost to set up." This section
answers the harder question: if this were a real product decision (not a learning tour
through all three), which one, and why — with the tradeoffs stated at the level you'd
want for an interview answer, not just a feature checklist.

### 1. What "cross-platform" actually means, mechanically

| | Capacitor | React Native | Flutter |
|---|---|---|---|
| **Runtime** | A real native WebView (WKWebView on iOS, Chromium WebView on Android) hosting the actual built web app. | JS thread talks to native UI components through the New Architecture's JSI (JavaScript Interface) — no bridge serialization anymore, direct synchronous calls. | Dart compiles to native ARM/x86 machine code (AOT in release builds); Flutter draws every pixel itself via Skia/Impeller — it never touches the platform's native UI toolkit at all. |
| **UI is** | DOM/CSS, exactly like the browser. | Real native views (`UIView`/`android.view.View`) — a `<Text>` becomes an actual native label. | Flutter's own widgets, rendered to a canvas — visually identical across platforms because nothing platform-native is used. |
| **What this means practically** | Native *chrome* (statusbar, permissions, app icon, store listing) around a web app. Scrolling, animation, and layout performance are bounded by WebView rendering, same as a browser tab. | Native performance ceiling for UI (it *is* native views), while app logic stays in JS. The old bridge-serialization tax (the historical RN performance complaint) is mostly gone post-New-Architecture. | Highest performance ceiling for custom/animated UI since there's no bridge at all and no platform-toolkit constraints — but you inherit zero platform look-and-feel for free; every control is hand-drawn to match. |

### 2. Developer experience & iteration speed

- **Capacitor**: iterate in the browser exactly as today (`npm run dev`), only rebuild/resync (`npx cap sync`) when testing native-only behavior (permissions, native plugins). Fastest inner loop of the three, because 95% of development never touches native tooling at all.
- **React Native**: Metro bundler + Fast Refresh gives near-instant reload for JS changes; native module changes still need a full native rebuild (Xcode/Gradle), which is slow. Debugging spans two worlds — JS stack traces via Chrome/Flipper, native crashes via Xcode/Android Studio.
- **Flutter**: hot reload is genuinely excellent — even widget-tree structural changes reload in under a second in most cases, arguably the best DX of the three for UI iteration. But you're writing an entirely new UI layer in a new language, so the *first* pass through has a steep learning curve regardless of reload speed.

### 3. Code reuse — this project's actual constraint, not generic advice

This is the one place generic framework comparisons don't apply directly, because DSA
Study Buddy isn't a React/Vue/Flutter app already — it's hand-rolled DOM string
templates (`renderX()` functions in `main.ts` returning HTML strings, no component
framework at all) plus a set of framework-agnostic data/logic modules
(`src/data/*.ts`, the runner eval logic).

- **Capacitor reuses 100% of the existing app, unchanged.** The exact same `dist/`
  output that ships to Cloudflare Pages today is what gets wrapped. Zero UI rewrite.
- **React Native reuses the *data*, not the *UI*.** Every `render*()` function in
  `main.ts` is DOM-string-building — none of it ports. The curriculum data, the pattern
  definitions, the runner's eval logic (`src/data/*.ts`, framework-agnostic TS) does port
  over conceptually, but every screen gets rebuilt as JSX/RN components from scratch.
- **Flutter reuses nothing directly.** Data models would need to be re-expressed in
  Dart (or served over an API instead of imported as TS modules), and the entire UI is a
  from-scratch build in a new language. Highest rewrite cost of the three, by a wide margin.

### 4. Native plugin ecosystem & platform escape hatches

- **Capacitor**: plugin ecosystem is smaller than RN's, but for this app the plugin
  surface needed is close to zero (no camera, no native storage beyond what a WebView
  already offers) — the one real candidate is a future on-device-LLM native plugin (see
  Axis B above), which would need to be hand-written either way.
- **React Native**: the deepest, most mature third-party plugin ecosystem of the three —
  almost anything native has an existing RN wrapper. Meta's own roadmap risk (the
  framework has been reorganized/rewritten more than once — Fabric, TurboModules, the New
  Architecture migration) is a real, if diminishing, maintenance tax.
- **Flutter**: strong and fast-growing plugin ecosystem (`pub.dev`), backed jointly by
  Google and a large community; less mature than RN's for long-tail native integrations,
  but the core (camera, storage, networking, on-device ML via `fllama`/`flutter_gemma`,
  directly relevant to Axis B here) is solid.

### 5. App size, startup time, long-term maintenance

- **Capacitor**: smallest binary of the three for a content-focused app like this one
  (it's just a thin native shell); startup time is WebView-init plus whatever the web
  app's own load time already is — no separate native startup cost to reason about.
- **React Native**: moderate app size (JS engine + bridge runtime bundled in); startup
  time includes JS bundle parse/execution, mitigated by Hermes' bytecode precompilation.
  Long-term maintenance means keeping pace with RN's own version upgrades, which have
  historically been more disruptive than a typical native SDK bump.
- **Flutter**: larger baseline binary size (ships its own rendering engine, Skia/Impeller,
  inside the app) but very fast, predictable startup since everything is AOT-compiled
  native code with no separate bridge/interpreter step. Flutter's own release cadence
  (stable channel) has been comparatively steady since 2.0.

### 6. Where this actually points, for this project specifically

The mobile-approaches decision log below already chose to walk through all four in order
(PWA → Capacitor → React Native → Flutter) as a *learning* exercise, not a
single-framework product decision — that sequencing stands, and this section doesn't
change it. But if the question ever becomes "if we had to ship ONE mobile app for this
product, which," the honest answer given the constraints above is **Capacitor**: this
app's differentiator is its curriculum content and local-LLM buddy feature, not
platform-native UI polish or animation, and Capacitor is the only one of the three that
doesn't force a full UI rewrite to get there. React Native would only make sense if this
were being rebuilt as a React app anyway (it isn't); Flutter would only make sense if
pixel-perfect custom UI/animation became the actual product differentiator (it isn't,
today) or as a deliberate Dart-learning exercise (which is exactly the role it already
has in the sequencing below).

## Decision log (append-only)

- **2026-07-06** — Chose to explore all four packaging approaches (PWA, Capacitor, RN,
  Flutter) rather than picking one, since the explicit goal is a learning exercise across
  techniques, not just the fastest working app. Chose on-device LLM (not LAN-IP or
  desktop-only) for the AI axis, also for the learning value, accepting it's the heaviest
  option. Sequencing: PWA first (zero install cost), then Capacitor (new technique to the
  user), then RN (refresher), then Flutter (newest skill) — installs confirmed individually
  before they happen.
- **2026-07-06** — PWA phase done. Added `public/manifest.json` + hand-written
  `public/sw.js` (stale-while-revalidate, same-origin GET only — Ollama's cross-origin POST
  traffic passes straight through untouched) + iOS meta tags + generated icon set from the
  existing favicon mark. Verified with headless Chrome/CDP: manifest parses, service worker
  reaches `activated`, and — the actual discriminating test — forcing the browser fully
  offline via `Network.emulateNetworkConditions` and reloading still renders the real app
  from cache. Crash logger showed zero errors throughout. Full writeup in the README's
  "v4 — Installable on Android + iOS (PWA)" and "Verification (v4)" sections. Next up:
  Capacitor (task #13/#14) — needs a go/no-go on installing Xcode.app + Android Studio/SDK
  + Java + CocoaPods first, none of which are on this machine yet.
- **2026-07-11** — Added the "Capacitor vs React Native vs Flutter — engineering
  tradeoffs" deep dive above (owed since 2026-07-07). Doesn't change the existing
  PWA→Capacitor→RN→Flutter sequencing decision — that's still the plan for the learning
  pass through all four. What it adds: the single-framework recommendation *if* this were
  a real product pick instead (Capacitor, because this app's differentiator is content +
  local-LLM buddy, not platform-native UI, and it's the only one of the three requiring
  zero UI rewrite of the hand-rolled `main.ts` DOM-string renderer), plus the specific
  reuse/rewrite cost breakdown per framework against this app's actual code shape.
