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
