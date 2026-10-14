# Abdeen English Academy

A browser-first English practice workspace: daily tasks, study plan, levels, phrase review, reading, pronunciation, speaking prompts, recordings, notes, a booth for work phrases, and progress tracking. A dashboard page lives at `/dashboard`.

## Run locally

Node.js 22+ and npm.

```
npm install
npm run dev
```

Open the local URL Vite prints (port 8080). Production build: `npm run build`.

## Publish to GitHub Pages

1. Push to `main` (or `master`). The workflow is `.github/workflows/pages.yml`.
2. On GitHub: Settings → Pages → Source: **GitHub Actions**.
3. Open the Actions tab and watch **Deploy to GitHub Pages**.

The workflow reads the repository name and sets the base path, so `https://USERNAME.github.io/Abdeen_English_Academy_System/` works with no path edits.

## How data is stored

The whole academy runs in the browser. Progress, words, notes and settings are saved in this browser on this device. Nothing goes to a server, so clearing site data erases it. Use **Notes → Back up your progress** to download a backup file, and **Restore backup** to load it on another browser or phone.

The project also contains sign-in, database and WebRTC code from the app builder. The academy does not use it, and GitHub Pages cannot run it.

## Checks

`npm run typecheck`, `npm test`, `npm run lint`
