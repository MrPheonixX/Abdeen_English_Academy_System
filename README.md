# Abdeen English Academy

A browser-first English practice workspace with daily tasks, a study plan, levels, phrase review, reading, pronunciation work, speaking prompts, recordings, notes, and progress tracking.

## Run locally

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (the project defaults to port `8080`). To make a production build locally:

```bash
npm run build
```

The build uses the committed `.grok/app-env.json` defaults and skips server database migrations when `DATABASE_URL` is not set.

## Publish to GitHub Pages

This repository includes `.github/workflows/pages.yml`. It builds a static app and deploys the result from GitHub Actions.

1. Push the project to the `main` or `master` branch.
2. On GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Open the **Actions** tab and check the **Deploy to GitHub Pages** workflow. Future pushes to `main`/`master` deploy automatically; the workflow can also be started manually.

The workflow detects the repository name and builds with the correct base path, so a project site such as `https://USERNAME.github.io/Abdeen_English_Academy_System/` works without manual path edits. It also checks that the static shell, manifest, service worker, and asset paths are present before deployment.

## Data and hosting notes

- This is a static, browser-first deployment. Study progress and preferences remain in that browser on that device; they are not synchronized to a server or across devices.
- GitHub Pages does not run Node.js server routes. Features that require an API, server-side authentication, WebRTC signaling, or a database need a separate backend host. The included Pages workflow is intended for the offline-capable learning workspace.
- The service worker caches the app shell and same-origin static assets for repeat/offline visits. It deliberately skips API paths and cross-origin requests.
- The app's local saved data can be cleared by the browser's site-data controls. Export/backup should be added before relying on the site as the sole copy of important notes or recordings.

## Checks

```bash
npm run typecheck
npm test
npm run lint
```
