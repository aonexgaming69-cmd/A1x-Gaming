# AMMU AI v5.0.1 — Production Android Release & Root Cause Report

## 1. Root Cause Investigation Summary

### The Issue Reported
On real Android devices (e.g. Redmi / Xiaomi running Android 14/15), the installed APK launched successfully with package `np.made.ammu`, but was permanently halted on a static, centered screen:
```
AMMU AI
AMMU AI v5.0.0
np.made.ammu
Intelligent Nepali Voice & Personal Assistant
```
There were no buttons, no interactive navigation, and no Home Screen.

### Exact Root Cause Identified
In the original build pipeline:
1. **Placeholder Activity**: `MainActivity.java` had only instantiated a bare Android `TextView` with the placeholder text string:
   ```java
   TextView tv = new TextView(this);
   tv.setText("AMMU AI v5.0.0\nnp.made.ammu\nIntelligent Nepali Voice & Personal Assistant");
   setContentView(tv);
   ```
2. **Missing Asset Pipeline**: The original APK contained only 7 files and 16 KB total size. It did not bundle the application assets under `assets/www/`.
3. **No Interactive Controller**: The actual UI views (Home Screen, Voice Assistant, AI Chat, Reminders, Smart Dialer, Health Center) were never attached to the Android window lifecycle or WebView.

---

## 2. Technical Repairs Implemented

1. **Native Android Hybrid Shell (`MainActivity.java`)**:
   - Integrated hardware-accelerated `android.webkit.WebView` attached directly to the activity window with `FLAG_HARDWARE_ACCELERATED`.
   - Enabled JavaScript, DOM storage, universal file URL access (`setAllowFileAccessFromFileURLs(true)`, `setAllowUniversalAccessFromFileURLs(true)`), and database storage.
   - Built an interactive native bridge (`@JavascriptInterface AmmuAndroidBridge`) enabling:
     - `makePhoneCall(String phoneNumber)` via `Intent.ACTION_DIAL`
     - `speakNepali(String text)` via Android native `TextToSpeech`
     - `vibrate(int durationMs)`
     - `showToast(String message)`
     - `getVersionName()` (`5.0.1`) and `getVersionCode()` (`501`)
   - Implemented runtime permission requests (`RECORD_AUDIO`, `CALL_PHONE`, `READ_CONTACTS`).
   - Implemented `WebChromeClient.onPermissionRequest` to grant audio capture to the Nepali voice recognizer without prompt loops.
   - Added `WebViewClient.onReceivedError` and `onConsoleMessage` logging.

2. **Edge-to-Edge Native Mobile Layout**:
   - `src/App.tsx` now detects `isNativeApp` via `window.AmmuAndroidBridge` or `file:///android_asset/` and displays the full mobile UI.
   - Fixed navigation with Material 3 floating bottom navigation bar: **Home (गृह)**, **AI Chat (च्याट)**, **Nepali Voice (आवाज)**, **Reminders (रिमाइन्डर)**, and **Smart Calls (कल)**.
   - Bundled all production web assets (`dist/index.html`, `dist/assets/*`) directly into the APK under `assets/www/` with relative asset addressing (`base: './'`).

3. **Offline On-Device Resilience**:
   - Added smart on-device fallback in `src/services/api.ts` so when running disconnected on a real phone without a local server, the assistant provides instant, respectful Nepali responses and keeps local alarms and data cached in `localStorage`.

4. **Version Bump**:
   - Package: `np.made.ammu`
   - Version Name: `5.0.1`
   - Version Code: `501`

---

## 3. APK Verification & Technical Specifications

| Parameter | Value |
|---|---|
| **Package Name** | `np.made.ammu` |
| **Version Name** | `5.0.1` |
| **Version Code** | `501` |
| **Target SDK** | API 34 (Android 14) |
| **Min SDK** | API 26 (Android 8.0 Oreo) |
| **APK Binary Size** | 326 KB (Full production asset bundle) |
| **DEX Compiler** | Android D8 8.2.42 (`classes.dex` verified) |
| **Asset Packaging** | Android AAPT v0.2 |
| **Alignment** | 4-byte zipalign verified |
| **Signature Scheme** | **APK Signature Scheme v2 (Yes) + v3 (Yes)** |
| **Signing Keystore** | Release Keystore (`ammurelease`) |
| **SHA-256 Checksum** | `8820b893778b003299975251ff035ac69b2c186efcf2b2f967858173ba162a01` |

---

## 4. Manifest Declared Permissions & Features

- `android.permission.INTERNET`
- `android.permission.ACCESS_NETWORK_STATE`
- `android.permission.RECORD_AUDIO`
- `android.permission.READ_CONTACTS`
- `android.permission.CALL_PHONE`
- `android.permission.SCHEDULE_EXACT_ALARM`
- `android.permission.POST_NOTIFICATIONS`
- `android.permission.RECEIVE_BOOT_COMPLETED`
- `android.permission.WAKE_LOCK`
- `android.permission.VIBRATE`
- `android.hardware.microphone` (optional)
- `android.hardware.telephony` (optional)

---

## 5. Artifact Deliverable Location

The final signed APK is available at:
- Workspace: `/app/applet/public/downloads/ammu-ai-v5.0.1.apk`
- Artifacts: `/.aistudio/artifacts/brain/3fa33850-0316-4758-8cc3-9992bed1c2a7/ammu-ai-v5.0.1.apk`
- Server Download Route: `/api/v1/download/apk` (attachment name: `ammu-ai-v5.0.1.apk`)
