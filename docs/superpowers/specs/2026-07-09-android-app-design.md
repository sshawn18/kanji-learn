# Kanji Learn Android App — Design

## Goal

Ship an installable Android app on the Play Store that gives users a native-feeling
entry point into the existing Kanji Learn web app, without duplicating or
re-implementing any product functionality.

## Non-goals (v1)

- Offline mode
- Push notifications
- Native rewrites of GSAP/Three.js animations (they run inside the WebView as-is)
- Automated Play Store publishing (upload is manual for v1)

## Approach

Wrap the live site (`https://kanji-learn-three.vercel.app`) in a **Capacitor**
shell rather than building a separate native (React Native/Flutter) app or a
bare Trusted Web Activity.

**Why Capacitor over a full native rewrite:** the site already has a complete
backend (NextAuth auth, Postgres via Prisma, a full REST API, spaced-repetition
logic). A native rewrite would mean re-implementing ~10 screens and the SRS study
flow in a second codebase, plus solving mobile-appropriate auth token storage
(NextAuth is cookie/session-oriented, not mobile-token-oriented out of the box).
That's weeks of work and a second codebase to maintain forever in lockstep with
the website. Not justified for the stated goal ("shouldn't feel like I am using
a website" — a UX/chrome concern, not a request for native screens).

**Why Capacitor over a bare TWA:** both hide browser chrome, but Capacitor gives
finer control over the things that make a wrapped site *feel* native — splash
timing, overscroll/bounce suppression, status bar theming, and back-button
handling — via config and lightweight plugins, without needing Digital Asset
Links verification that a TWA requires to fully hide the URL bar.

## Architecture

```
kanji-learn/                      (existing Next.js repo, unchanged)
└── android-app/                  (new: Capacitor project)
    ├── capacitor.config.ts       # server.url -> live Vercel URL
    ├── android/                  # native Android project (Gradle)
    ├── www/                      # minimal placeholder (required by Capacitor,
    │                             # never actually shown — server.url takes over)
    └── resources/                # icon-512.png, splash background derived from site
```

The app has **no bundled web content of its own**. `capacitor.config.ts` sets
`server.url` to the live Vercel deployment, so the WebView always loads
whatever is currently deployed — no separate release process to keep the app
in sync with the website.

## Native-feel details

- Full-screen WebView, no address bar / browser UI
- Native splash screen: `icon-512.png` centered on the site's dark background
  color (`#111827`-family, pulled from `app/globals.css`), shown until the
  page finishes loading — avoids a white flash
- Status bar color matched to the site theme
- Overscroll/bounce and pull-to-refresh disabled (native `WebView` settings)
  so scrolling reads as a native list, not a browser page
- Android hardware back button wired to WebView history via Capacitor's `App`
  plugin (back button navigates the SPA, only exits the app from the root)
- App icon generated from the existing `public/icon-512.png` / `icon-192.png`
  (already used for the site's PWA manifest)

## Build & release pipeline

This machine has no Java, Android SDK, or Android Studio installed. Rather than
a heavy local install, builds run in **GitHub Actions**:

1. Trigger: push to `android-app/**` on `main` (or manual workflow dispatch)
2. Steps: checkout → set up JDK 17 + Android SDK (`android-actions/setup-android`)
   → `npm ci` in `android-app/` → `npx cap sync android` → Gradle
   `bundleRelease`
3. Sign the resulting `.aab` using a release keystore. The keystore is
   generated once locally (or via CI) and stored as base64-encoded GitHub
   Actions secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) — never committed to the repo
4. Upload the signed `.aab` as a workflow run artifact

**Manual step (out of CI):** download the `.aab` from the Actions run and
upload it to Play Console (Internal testing track first, then production)
using the already-existing Play Console developer account. Auto-publish via a
Google Play service-account key is a natural v2 addition, deferred for now to
avoid granting CI publish access before the app has been manually verified
once.

## Testing

- Since there's no local Android SDK, initial verification happens via the
  signed `.aab`/`.apk` produced by CI: side-load the debug APK from a CI run
  onto a physical Android device (or install via Play Console's internal
  testing track) to confirm splash, icon, back-button, and scroll behavior.
- No new automated tests are needed — this project wraps existing,
  already-tested web functionality. CI's job is just "does it build and
  produce a signed artifact."

## Open items for later (explicitly deferred, not blocking v1)

- Offline caching / service worker strategy
- Push notifications (would need a native plugin + backend integration)
- Automated Play Store publishing from CI
