# Build Android APK with Capacitor

This project packages the web app from `client/` into a native Android app using Capacitor.

## Prerequisites
- Node.js 18+ and npm
- Android Studio (SDK, platform tools)
- Java 17 (via Android Studio or your JDK)
- A public backend URL (HTTPS + WSS). Configure in `client/config.js`:
  - `WS_URL: "wss://ff.ru"`
  - `TURN_SERVERS: [{ urls: "turn:ff.ru:3478", username: "turnuser", credential: "turnpass" }]`

## 1) Initialize and add Android (one-time)
From the project root:
```bash
chmod +x setup-capacitor.sh
./setup-capacitor.sh
```
This installs Capacitor, initializes `capacitor.config.ts` (already included), adds Android, and copies the web assets.

If you add/remove files in `client/`, run:
```bash
npx cap copy
```

## 2) Set Android permissions
After `npx cap add android`, ensure `android/app/src/main/AndroidManifest.xml` contains:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<!-- Optional for headsets -->
<uses-permission android:name="android.permission.BLUETOOTH" />

<uses-feature android:name="android.hardware.camera.any" android:required="false" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```
You can also run the helper once after Android project is created:
```bash
chmod +x android-permissions.sh
./android-permissions.sh
```

## 3) Open in Android Studio and build APK/AAB
```bash
npx cap open android
```
In Android Studio:
- Build → Generate Signed Bundle / APK → Android App Bundle (.aab) or APK
- Provide a keystore for release builds

For a quick debug build: Build → Build APK(s)

## 4) Runtime notes (WebRTC)
- Use HTTPS/WSS only. The app loads local `client/` files, but signaling/media endpoints must be `https://` and `wss://`.
- TURN is recommended for mobile networks. Make sure port 3478/udp is open on the VPS.
- The app will request camera/mic permissions at first use.

## 5) Updating the app
When you change the web app in `client/`:
```bash
npx cap copy
```
Then re-build in Android Studio.

## 6) Troubleshooting
- No camera/mic: ensure permissions were granted in Android, and your domain is HTTPS.
- Signaling fails: set `WS_URL: "wss://ff.ru"` in `client/config.js`, check Nginx proxy for WebSocket Upgrade.
- ICE fails: verify `coturn` running, credentials match, and `3478/udp` open.
