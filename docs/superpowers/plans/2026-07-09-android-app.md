# Kanji Learn Android App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an installable Android app that wraps the live Kanji Learn site (`https://kanji-learn-three.vercel.app`) in a Capacitor shell with native-feeling chrome (splash, status bar, back button, no browser UI), built and signed entirely via GitHub Actions since this machine has no local Android SDK.

**Architecture:** A new `android-app/` Capacitor project (no bundled web content — `server.url` loads the live site at runtime). Native customizations (back button, overscroll, status bar/splash color) live as override files in `android-app/native-overrides/` that a GitHub Actions workflow copies into the platform project it generates fresh on every build. The main Next.js site gets one small, defensive addition: a client component that hides the native splash screen once the page has mounted, but no-ops entirely on regular web visits.

**Tech Stack:** Capacitor 6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/splash-screen`), GitHub Actions (`setup-java`, `android-actions/setup-android`, `setup-node`), Gradle (via the generated wrapper), Next.js/React (existing site).

Spec reference: `docs/superpowers/specs/2026-07-09-android-app-design.md`

**Note on colors:** the spec's draft mentioned `#111827`-family for the splash/status-bar color. Inspecting `app/globals.css` shows the actual site background is `--bg: #FAFAFA` (light) and `#111827` is `--text-primary` (dark text color). This plan uses the correct value: `#FAFAFA` background, dark status bar icons/text.

---

### Task 1: Scaffold the Capacitor project

**Files:**
- Create: `android-app/package.json`
- Create: `android-app/capacitor.config.ts`
- Create: `android-app/www/index.html`
- Create: `android-app/.gitignore`

- [ ] **Step 1: Create the android-app directory and package.json**

```bash
mkdir -p /x/CC/kanji-learn/android-app/www
```

Create `android-app/package.json`:

```json
{
  "name": "kanji-learn-android",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "sync": "cap sync android"
  },
  "dependencies": {
    "@capacitor/android": "^6.2.0",
    "@capacitor/core": "^6.2.0",
    "@capacitor/splash-screen": "^6.0.3"
  },
  "devDependencies": {
    "@capacitor/assets": "^3.0.5",
    "@capacitor/cli": "^6.2.0"
  }
}
```

- [ ] **Step 2: Create capacitor.config.ts**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kanjilearn.app',
  appName: 'Kanji Learn',
  webDir: 'www',
  server: {
    url: 'https://kanji-learn-three.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#FAFAFAFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
```

`launchAutoHide: false` means the splash stays up until the site itself calls
`SplashScreen.hide()` — implemented in Task 6 — instead of disappearing on a
fixed timer before the page has actually loaded.

- [ ] **Step 3: Create the offline/loading fallback page**

Create `android-app/www/index.html` (this is bundled into the app and only
briefly visible before the WebView redirects to `server.url`, or if the
device has no network):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kanji Learn</title>
  <style>
    html, body {
      margin: 0;
      height: 100%;
      background: #FAFAFA;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, Roboto, sans-serif;
      color: #111827;
    }
  </style>
</head>
<body>
  <p>Loading Kanji Learn…</p>
</body>
</html>
```

- [ ] **Step 4: Create android-app/.gitignore**

```
node_modules/
android/app/build/
android/build/
android/.gradle/
android/release.keystore
*.aab
*.apk
```

- [ ] **Step 5: Install dependencies and verify**

```bash
cd /x/CC/kanji-learn/android-app && npm install
```

Expected: installs without error (no Java/Android SDK required for this
step — it's a plain npm install).

- [ ] **Step 6: Commit**

```bash
cd /x/CC/kanji-learn && git add android-app/package.json android-app/package-lock.json android-app/capacitor.config.ts android-app/www/index.html android-app/.gitignore && git commit -m "Scaffold Capacitor project for Android app"
```

---

### Task 2: Add app icon and splash source images

**Files:**
- Create: `android-app/resources/icon.png`
- Create: `android-app/resources/splash.png`

- [ ] **Step 1: Copy the site's existing icon as the source icon**

```bash
mkdir -p /x/CC/kanji-learn/android-app/resources
cp /x/CC/kanji-learn/public/icon-512.png /x/CC/kanji-learn/android-app/resources/icon.png
```

`@capacitor/assets` (used in the CI workflow, Task 4) requires a source icon
of at least 1024x1024. `icon-512.png` is 512x512, which is below that
minimum.

- [ ] **Step 2: Upscale the icon to 1024x1024**

Node has no image library installed by default, and there's no local
ImageMagick/Java toolchain to rely on. Use the Node `sharp`-free approach via
a one-off npx call to a zero-dependency CLI:

```bash
cd /x/CC/kanji-learn/android-app && npx --yes sharp-cli resize 1024 1024 --input resources/icon.png --output resources/icon-1024.png
mv resources/icon-1024.png resources/icon.png
```

Expected: `resources/icon.png` is now 1024x1024. Verify:

```bash
node -e "const s=require('fs').statSync('/x/CC/kanji-learn/android-app/resources/icon.png'); console.log(s.size, 'bytes')"
```

If `npx sharp-cli` fails to install/run in this environment, fall back to
leaving `icon-512.png` in place and let the Task 4 CI step fail fast with a
clear error — the fix at that point is to run the same `sharp-cli` resize
step inside the GitHub Actions runner instead of locally, since it has full
network/npm access. Note this fallback in the workflow as a comment.

- [ ] **Step 3: Create a plain splash background image**

The splash background is a solid color (`#FAFAFA`) behind the centered icon,
which `@capacitor/assets` handles automatically when given just an icon and
a solid-color splash source. Create a 2732x2732 solid `#FAFAFA` PNG:

```bash
cd /x/CC/kanji-learn/android-app && npx --yes sharp-cli --input resources/icon.png -o resources/splash.png resize 2732 2732 --fit contain --background "#FAFAFA"
```

Expected: `resources/splash.png` exists, 2732x2732, `#FAFAFA` background with
the icon centered.

- [ ] **Step 4: Commit**

```bash
cd /x/CC/kanji-learn && git add android-app/resources/icon.png android-app/resources/splash.png && git commit -m "Add Android app icon and splash source images"
```

---

### Task 3: Write native override files (back button, overscroll, status bar)

**Files:**
- Create: `android-app/native-overrides/MainActivity.java`
- Create: `android-app/native-overrides/colors.xml`

These files are not part of a generated Android project yet (that happens in
CI, Task 4, via `npx cap add android`, which needs Java/Gradle this machine
doesn't have). They're written now and copied into the generated project by
the CI workflow on every build.

- [ ] **Step 1: Write MainActivity.java**

Create `android-app/native-overrides/MainActivity.java`. The package name
(`com.kanjilearn.app`) must match `appId` in `capacitor.config.ts` from
Task 1 — Capacitor's Android template puts `MainActivity.java` at
`android/app/src/main/java/com/kanjilearn/app/MainActivity.java`.

```java
package com.kanjilearn.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();
        WebView webView = this.bridge.getWebView();
        // Disable the rubber-band/glow overscroll effect so scrolling feels
        // like a native list rather than a browser page.
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
    }

    @Override
    public void onBackPressed() {
        WebView webView = this.bridge.getWebView();
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

- [ ] **Step 2: Write colors.xml override**

Create `android-app/native-overrides/colors.xml`. This overwrites the
generated project's `android/app/src/main/res/values/colors.xml`.
`colorPrimaryDark` controls the status bar background color in the default
Capacitor AppCompat theme.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#FAFAFA</color>
    <color name="colorPrimaryDark">#FAFAFA</color>
    <color name="colorAccent">#DC2626</color>
</resources>
```

`colorAccent` uses the site's `--red` accent color from `app/globals.css` for
consistency.

- [ ] **Step 3: Commit**

```bash
cd /x/CC/kanji-learn && git add android-app/native-overrides/ && git commit -m "Add native override files for Android back button, overscroll, and theme colors"
```

---

### Task 4: GitHub Actions build workflow

**Files:**
- Create: `.github/workflows/android-build.yml`

- [ ] **Step 1: Write the workflow file**

Create `.github/workflows/android-build.yml`:

```yaml
name: Android Build

on:
  push:
    branches: [main]
    paths:
      - 'android-app/**'
      - '.github/workflows/android-build.yml'
  workflow_dispatch: {}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: android-app
        run: npm ci

      - name: Add Android platform
        working-directory: android-app
        run: npx cap add android

      - name: Generate icons and splash screens
        working-directory: android-app
        run: npx @capacitor/assets generate --android

      - name: Apply native overrides
        working-directory: android-app
        run: |
          cp native-overrides/MainActivity.java android/app/src/main/java/com/kanjilearn/app/MainActivity.java
          cp native-overrides/colors.xml android/app/src/main/res/values/colors.xml

      - name: Sync Capacitor
        working-directory: android-app
        run: npx cap sync android

      - name: Decode signing keystore
        working-directory: android-app
        run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/release.keystore

      - name: Make gradlew executable
        working-directory: android-app/android
        run: chmod +x gradlew

      - name: Build signed release bundle
        working-directory: android-app/android
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          ./gradlew bundleRelease \
            -Pandroid.injected.signing.store.file=release.keystore \
            -Pandroid.injected.signing.store.password=$ANDROID_KEYSTORE_PASSWORD \
            -Pandroid.injected.signing.key.alias=$ANDROID_KEY_ALIAS \
            -Pandroid.injected.signing.key.password=$ANDROID_KEY_PASSWORD

      - name: Upload signed AAB
        uses: actions/upload-artifact@v4
        with:
          name: kanji-learn-release-aab
          path: android-app/android/app/build/outputs/bundle/release/app-release.aab
```

- [ ] **Step 2: Validate YAML syntax locally**

```bash
node -e "require('js-yaml')" 2>/dev/null || npm install -g js-yaml --silent
node -e "const yaml=require('js-yaml'); const fs=require('fs'); yaml.load(fs.readFileSync('/x/CC/kanji-learn/.github/workflows/android-build.yml','utf8')); console.log('valid yaml')"
```

Expected: `valid yaml`

- [ ] **Step 3: Commit**

```bash
cd /x/CC/kanji-learn && git add .github/workflows/android-build.yml && git commit -m "Add GitHub Actions workflow to build signed Android app bundle"
```

---

### Task 5: Generate the release keystore and configure GitHub secrets

This is a one-time manual setup step — the keystore is a secret credential
that must never be committed to git, so it's generated locally and only its
base64 encoding is stored as a GitHub Actions secret.

**Files:** none (this task produces a local keystore file and GitHub secrets,
not repo content)

- [ ] **Step 1: Generate the keystore**

Requires a local JDK (this machine doesn't have one). Run this step on any
machine with Java installed, or use an ephemeral cloud shell:

```bash
keytool -genkeypair -v \
  -keystore kanji-learn-release.keystore \
  -alias kanji-learn \
  -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for a keystore password, key password, and identity
details (name/org/etc — these are just metadata, any values work). **Save
the keystore password and key password somewhere durable (password
manager)** — they cannot be recovered, and losing them means you can never
publish an update to an app already live on the Play Store under this
signing key.

- [ ] **Step 2: Base64-encode the keystore**

```bash
base64 -w0 kanji-learn-release.keystore > kanji-learn-release.keystore.b64
```

(On Windows without `base64 -w0`, use: `certutil -encode kanji-learn-release.keystore keystore.b64` then strip the header/footer lines, or run the command above from Git Bash which supports `-w0`.)

- [ ] **Step 3: Add GitHub repository secrets**

```bash
gh secret set ANDROID_KEYSTORE_BASE64 --repo sshawn18/kanji-learn < kanji-learn-release.keystore.b64
gh secret set ANDROID_KEYSTORE_PASSWORD --repo sshawn18/kanji-learn --body "<your keystore password>"
gh secret set ANDROID_KEY_ALIAS --repo sshawn18/kanji-learn --body "kanji-learn"
gh secret set ANDROID_KEY_PASSWORD --repo sshawn18/kanji-learn --body "<your key password>"
```

- [ ] **Step 4: Delete the local plaintext keystore files from this working directory**

Once the secret is set, delete `kanji-learn-release.keystore.b64` (the raw
`.keystore` file should be kept in a password manager or secure backup, but
should not remain in any project working directory).

```bash
rm kanji-learn-release.keystore.b64
```

No commit for this task — nothing here touches the repository.

---

### Task 6: Hide the native splash screen once the site has loaded

**Files:**
- Create: `components/CapacitorSplashHide.tsx`
- Modify: `app/layout.tsx`
- Modify: `package.json` (add `@capacitor/splash-screen`, `@capacitor/core` as dependencies)

Since `launchAutoHide` is `false` (Task 1), the native splash stays visible
until the web page explicitly calls `SplashScreen.hide()`. This component
does that — and does nothing at all when the site is loaded in a normal
browser (`window.Capacitor` won't exist there).

- [ ] **Step 1: Add the Capacitor packages to the main site**

```bash
cd /x/CC/kanji-learn && npm install @capacitor/core @capacitor/splash-screen
```

Expected: adds both packages to `dependencies` in `package.json`.

- [ ] **Step 2: Create the client component**

Create `components/CapacitorSplashHide.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export function CapacitorSplashHide() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Capacitor" in window)) return;

    import("@capacitor/splash-screen")
      .then(({ SplashScreen }) => SplashScreen.hide())
      .catch(() => {
        // Not running inside the Capacitor shell, or the plugin isn't
        // available — nothing to do.
      });
  }, []);

  return null;
}
```

- [ ] **Step 3: Wire it into the root layout**

Modify `app/layout.tsx` — add the import and render the component inside
`<Providers>`:

```tsx
import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Providers } from "./providers";
import { CapacitorSplashHide } from "@/components/CapacitorSplashHide";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto", weight: ["400", "500", "700", "900"] });

export const metadata: Metadata = {
  title: "KanjiLearn — Master Japanese Kanji",
  description: "Learn all JLPT N5-N1 kanji with spaced repetition. Track progress, create custom decks, and level up efficiently.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "KanjiLearn" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body>
        <Providers>
          <CapacitorSplashHide />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify the site still builds and runs normally in a browser**

```bash
cd /x/CC/kanji-learn && npm run dev
```

Open the dev URL in a regular browser and confirm the page loads with no
console errors related to `CapacitorSplashHide` (the `"Capacitor" in window`
check should make it a no-op — check the browser console for the absence of
any thrown error from this component). Stop the dev server after confirming
(Ctrl+C).

- [ ] **Step 5: Commit**

```bash
cd /x/CC/kanji-learn && git add components/CapacitorSplashHide.tsx app/layout.tsx package.json package-lock.json && git commit -m "Hide native splash screen once the site has loaded, no-op on regular web"
```

- [ ] **Step 6: Deploy the site change**

This modifies the live Next.js site (not just the android-app folder), so it
needs to be pushed and deployed through your normal Vercel deploy flow
(push to `main` triggers it, if Vercel's GitHub integration is already
connected — confirm this is the case before pushing, since this repo's
`homepageUrl` shows Vercel but the deploy trigger wasn't independently
verified during planning).

```bash
git push origin main
```

---

### Task 7: Reduce scroll bounce on the website itself

**Files:**
- Modify: `app/globals.css:19`

Disabling overscroll bounce/pull-to-refresh is best done in the site's own
CSS (benefits the PWA/mobile-web experience too), rather than only via native
WebView settings.

- [ ] **Step 1: Add overscroll-behavior to globals.css**

Modify `app/globals.css`, updating the `body` rule at line 19:

```css
body { background: var(--bg); color: var(--text-primary); font-family: 'Inter', sans-serif; margin: 0; overflow-x: hidden; overscroll-behavior-y: contain; }
html { overflow-x: hidden; overscroll-behavior-y: contain; }
```

- [ ] **Step 2: Verify visually**

```bash
cd /x/CC/kanji-learn && npm run dev
```

Open the dev URL, scroll to the top of a page with content taller than the
viewport, and continue scrolling/dragging upward past the top — the
pull-to-refresh/bounce-navigate gesture should no longer trigger. Stop the
dev server after confirming.

- [ ] **Step 3: Commit and push**

```bash
cd /x/CC/kanji-learn && git add app/globals.css && git commit -m "Disable overscroll bounce for a more app-like scroll feel" && git push origin main
```

---

### Task 8: Trigger the CI build and verify the signed artifact

**Files:** none — this task exercises Task 4's workflow end-to-end.

- [ ] **Step 1: Confirm android-app changes are pushed**

```bash
cd /x/CC/kanji-learn && git push origin main
```

(If Tasks 1-4 were already pushed as part of earlier commits, this may be a
no-op — confirm with `git status` and `git log origin/main..HEAD`.)

- [ ] **Step 2: Trigger the workflow**

The workflow runs automatically on push to `main` touching `android-app/**`.
If it didn't trigger (e.g., no matching path changed in the last push),
trigger it manually:

```bash
gh workflow run android-build.yml --repo sshawn18/kanji-learn
```

- [ ] **Step 3: Watch the run**

```bash
gh run watch --repo sshawn18/kanji-learn
```

Expected: the run completes with conclusion `success`. If it fails, read the
failing step's log via `gh run view --repo sshawn18/kanji-learn --log-failed`
and fix the underlying issue (common first-run failures: keystore secret
missing/malformed from Task 5, or the `sharp-cli` icon resize from Task 2
step 2 needing to run in-workflow instead of locally — add an equivalent
resize step to the workflow before `@capacitor/assets generate` if so).

- [ ] **Step 4: Download and sanity-check the artifact**

```bash
gh run download --repo sshawn18/kanji-learn -n kanji-learn-release-aab -D /tmp/kanji-learn-aab
ls -la /tmp/kanji-learn-aab
```

Expected: `app-release.aab` present and non-zero size.

- [ ] **Step 5: Manual verification on a device**

Since there's no local Android SDK/emulator on this machine, verify the app
on a physical Android device or via Play Console's internal testing track:
1. In Play Console, create an app entry (if not already done) for
   `com.kanjilearn.app`
2. Upload `app-release.aab` to the Internal testing track
3. Install it on a device via the internal testing opt-in link
4. Confirm: app icon shows correctly, splash screen shows the site's icon on
   a `#FAFAFA` background and disappears once the site loads (no white
   flash), status bar matches the light theme, scrolling has no
   bounce/pull-to-refresh, and the Android back button navigates within the
   site before exiting the app

This step has no further code changes — it's the acceptance check for the
whole plan.

---

## Deferred (explicitly out of scope, per spec)

- Offline caching / service worker strategy
- Push notifications
- Automated Play Store publishing from CI (Task 8 Step 5 stays a manual
  upload for v1)
