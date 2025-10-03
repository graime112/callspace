#!/usr/bin/env bash
set -euo pipefail

# Always run from the script's directory (project root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Setup Capacitor Android project for CallSpace
# Usage: chmod +x setup-capacitor.sh && npm run cap:setup (or run this script directly)

APP_ID="ru.ff.callspace"
APP_NAME="CallSpace"
WEB_DIR="client"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required" >&2
  exit 1
fi

# Install Capacitor deps
npm i -D @capacitor/cli
npm i @capacitor/core
npm i -D typescript

# Init if missing
if [ ! -f capacitor.config.ts ] && [ ! -f capacitor.config.json ]; then
  npx cap init "$APP_NAME" "$APP_ID" --web-dir "$WEB_DIR"
fi

# Add Android
npm i @capacitor/android
npx cap add android || true

# Copy web
npx cap copy

cat <<'INFO'
Done. Next steps:
1) Open Android Studio: npx cap open android
2) Ensure AndroidManifest has permissions: INTERNET, CAMERA, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
3) Build APK/AAB in Android Studio
INFO
