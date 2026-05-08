# HireQuest Mobile (Capacitor)

This folder wraps the existing Next.js web app into iOS/Android store apps using Capacitor.

## Prereqs
- Node.js + npm
- Android Studio (for Android)
- Xcode (for iOS, on macOS)

## Install
From the repo root:

```bash
cd apps/mobile
npm install
```

## Point the app at your web deployment
This wrapper is designed to load the hosted Next.js app (recommended for fast updates).

Set an environment variable before syncing/running:
- `HQ_MOBILE_SERVER_URL`: e.g. `https://your-domain.com`

## First-time platform setup

```bash
npm run cap:add:android
npm run cap:add:ios
```

## Run

```bash
npm run cap:run:android
npm run cap:run:ios
```

