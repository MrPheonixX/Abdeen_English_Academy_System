# Abdeen English Academy — GitHub Pages build fix v4 (patch)

This ZIP is a **file patch**, not the whole project. Extract it into the root of your repository and overwrite matching files.

## What changed
- Restores the TanStack Start Vite config instead of a plain React-only Vite config.
- Adds an explicit custom client entry at `src/client.tsx` using TanStack Start's documented `client.entry` option.
- Restores the Pages workflow that collects `.vercel/output/static` (the output produced by this project's Nitro/Vercel preset), rather than uploading `./dist`.
- Includes static manifest/service worker/icons and base-aware app-shell metadata.

## After copying these files
Commit and push to `main`, then inspect Actions → Deploy to GitHub Pages. This patch has been source-checked, but a full npm production build could not be executed in this environment because the npm registry was unreachable. The GitHub Actions run is the required end-to-end confirmation.
