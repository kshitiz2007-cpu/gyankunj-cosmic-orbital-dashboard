# Gyankunj Android (Capacitor) — Phase 1

## Architecture

This repository currently runs a Next.js server application. The Android wrapper therefore loads the deployed HTTPS application:

- App ID: `com.gyankunj.academy`
- App name: `Gyankunj`
- Web origin: `https://upsc-compass.onrender.com`

This is a remote-web Capacitor wrapper, not a static Next.js export and not a React Native rewrite. Authentication, middleware, server routes, and Supabase remain hosted on the existing Next.js deployment.

## Build an APK without a local computer

1. Open the repository on GitHub.
2. Select the `feature/capacitor-android-wrapper` branch.
3. Open **Actions → Android APK (Capacitor)**.
4. Select **Run workflow** if the workflow has not run automatically.
5. Wait for the `Build Capacitor debug APK` job to finish.
6. Open the workflow run's **Artifacts** section and download `gyankunj-android-debug-apk`.
7. Extract the ZIP on the Android phone and tap `app-debug.apk`.
8. If Android asks, allow your browser or file manager to install unknown apps, then install.

The workflow creates the Android project during CI; generated Gradle files are intentionally not committed in this phase.

## Important limitations

- The wrapper needs an internet connection because the app is served from Render.
- The APK is a debug build for testing, not a signed Play Store release.
- Native push notifications, offline content, deep links, and secure release signing are not configured yet.
- The Render app must be reachable and its Supabase authentication configuration must be healthy.
- Do not add production secrets to this repository or commit signing keys.

## Device smoke test

After installing, verify:
- Login and logout
- Home and floating navigation
- Study/library routes
- Daily Drill start, answer, submit, and result
- Editorial open/save/progress
- Back button behavior
- Screen rotation and keyboard behavior
- Network loss/reconnect behavior

Report failures with device model, Android version, route, and a screenshot. Do not use real student data for QA.

## Next phase

Add native splash/icon assets, back-button/deep-link handling, Android status/navigation-bar styling, offline/error states, and a signed release pipeline after the debug APK passes on a physical phone.
