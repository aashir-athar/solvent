# Solvent: Zero to Deploy

Everything from a fresh machine to the App Store, Play Store, and over-the-air updates.
Solvent runs entirely on-device, so there are no server secrets to manage.

---

## 1. Install the toolchain

```bash
# Node 20 LTS or newer (nvm shown; or install from nodejs.org)
nvm install 20 && nvm use 20

# EAS CLI (latest stable)
npm install -g eas-cli

# Watchman (macOS, recommended)
brew install watchman
```

Native builds also need:

- iOS: macOS with Xcode 26.4+ (min iOS 16.4). Install Xcode from the App Store, open it once to accept the license, and install the iOS platform.
- Android: Android Studio with an SDK + an emulator, or a physical device with USB debugging.

---

## 2. Clone, install, run

```bash
git clone https://github.com/aashir-athar/solvent.git
cd solvent
npm install
npx expo start          # press i (iOS) or a (Android), or scan the QR
```

`npx expo start` runs Expo Go for the pure-JS surface. Solvent uses native modules
(`expo-sqlite`, `expo-glass-effect`, `react-native-svg`, `@noble` via the random polyfill),
so for the full app build a dev client (Section 4).

Verify the build is healthy before anything else:

```bash
npx tsc --noEmit        # strict type-check, must be clean
npx jest                # engine + crypto + parser tests, must pass
npx expo-doctor         # dependency health
```

---

## 3. One-time app.json metadata edits

`app.json` is owned by the Expo CLI; make only these deliberate edits before your first
production build. Each is verified against the Expo SDK 56 docs.

| Field | Set to | Why |
|---|---|---|
| `expo.name` | `Solvent` | The display name under the icon (currently lowercase `solvent`) |
| `expo.ios.bundleIdentifier` | e.g. `com.aashirathar.solvent` | Required for an iOS build |
| `expo.android.package` | e.g. `com.aashirathar.solvent` | Required for an Android build |
| `expo.splash` background + `expo.android.adaptiveIcon.backgroundColor` | `#2F5D50` (spruce) | On-brand splash and adaptive icon (currently the Expo blue defaults) |
| `expo.icon` / `expo.ios.icon` / `expo.android.adaptiveIcon.foregroundImage` | your generated PNGs | Replace the default Expo icon (generate from `assets/icon-prompts.md`) |
| `expo.plugins` | add `"expo-notifications"` | Android channel + notification icon for the weekly nudge |

New Architecture is on by default in SDK 56; no flag needed. Do not hand-pin any version
in `package.json`; add packages only with `npx expo install`.

---

## 4. Build a dev client

The dev client is what runs the native modules during development.

```bash
eas login
eas init                       # links the project, writes the EAS project id to app.json
eas build --profile development --platform ios       # or android, or all
# install the resulting build on a simulator/device, then:
npx expo start --dev-client
```

Profiles are defined in `eas.json` (development / preview / production), each wired to an
OTA channel of the same name.

---

## 5. Production builds and store submission

```bash
# Build signed binaries for both stores
eas build --profile production --platform all

# Submit (configure store credentials when prompted)
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

App Store Connect and Google Play Console need the usual one-time setup: app record,
listing copy, screenshots (capture from a device build), privacy questionnaire (answer
honestly: no data collected, nothing leaves the device), and age rating.

---

## 6. Over-the-air updates

```bash
# Ship a JS-only change to everyone on the production channel
eas update --channel production --message "Polish the date screen"
```

OTA updates cover JS and asset changes. Any change to native modules or `app.json` native
config requires a new store build.

---

## 7. Optional production add-ons (each needs a dev client)

These ship in the codebase as clean seams that degrade gracefully. Wire them when you want
the native capability.

### Live Pro billing (RevenueCat)

```bash
npx expo install react-native-purchases
```

Add your public SDK keys to `.env` (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`,
`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`). In `src/features/paywall/entitlement.ts`, replace the
bodies of `purchasePro` / `restore` with `Purchases.purchasePackage` / `restorePurchases`
and call `setPro` with the resulting entitlement. The store and every gated screen stay
unchanged.

### On-device LLM coach

The deterministic coach ships and works everywhere. To add warm on-device rephrasing,
register a rephraser at startup via `setLlmRephraser` (`src/features/coach/runtime.ts`):

- iOS 26+: Apple Foundation Models (Swift) through an Expo module.
- Android: ML Kit GenAI Prompt API / Gemini Nano (Kotlin) through AICore.

The rephraser's prompt must keep every number and date exactly as given. With none
registered, the deterministic coach is used, so the app is identical on every device.

### Photo statement scanning (OCR)

Pasting statement text already works through the same parser. For photo scanning, register a
text recognizer via `setTextRecognizer` (`src/features/ocr/recognizer.ts`), backed by a
native module (ML Kit text recognition, or a VisionCamera frame processor). Until then, the
scan screen guides the user to paste, which is the same on-device pipeline.

### Notifications

The weekly nudge is an OS-level scheduled local notification, so it fires while the app is
killed and needs no server. If you later add event-driven alerts, deliver them as real
remote push (APNs on iOS, FCM on Android) through a push service, with Android `priority:
high` + a channel and an iOS alert payload. Push requires a dev client or production build.

---

## 8. Localization review

The six bundled languages (English, Urdu, Hindi, Arabic, Indonesian, Portuguese) cover the
full UI and the coach. The non-English dictionaries in `src/i18n/translations/` are careful
first translations; have a native speaker review each before a localized store launch.
Missing keys fall back to English automatically, so nothing ever renders blank.

---

## 9. Pre-submission checklist

- [ ] `npx tsc --noEmit` clean, `npx jest` green, `npx expo-doctor` clean
- [ ] App icon + splash replaced with the generated spruce assets
- [ ] `app.json` name, bundle id, package, and brand colors set (Section 3)
- [ ] Tested on a real device with the app force-quit (theme persist, weekly nudge, backup)
- [ ] Store listings, screenshots, and the privacy questionnaire completed
