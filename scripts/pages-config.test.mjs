import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");

test("GitHub Pages workflow repairs the stale lockfile before building", () => {
  const workflow = read(".github/workflows/pages.yml");
  assert.match(workflow, /npm install --no-audit --no-fund/);
  assert.doesNotMatch(workflow, /run: npm ci/);
  assert.match(workflow, /PAGES_BASE: \$\{\{ steps\.base\.outputs\.path \}\}/);
  assert.match(workflow, /touch pages-out\/\.nojekyll/);
  assert.match(workflow, /Static PWA manifest or service worker is missing/);
  assert.match(workflow, /root-relative asset URLs that break on GitHub Pages project sites/);
});

test("the static web manifest uses paths relative to the repository subpath", () => {
  const manifest = JSON.parse(read("public/manifest.webmanifest"));
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  for (const icon of manifest.icons) {
    assert.ok(existsSync(join(ROOT, "public", icon.src.replace(/^\.\//, ""))), `${icon.src} exists`);
  }
  assert.ok(existsSync(join(ROOT, "public/sw.js")));
  assert.ok(existsSync(join(ROOT, "public/.nojekyll")));
});

test("Pages builds use base-aware PWA links and skip Grok-only head injection", () => {
  const root = read("src/routes/__root.tsx");
  const vite = read("vite.config.ts");
  const plugin = read("scripts/grok-pwa-plugin.mjs");
  assert.match(vite, /__PAGES_BASE__: JSON\.stringify\(process\.env\.PAGES_BASE \|\| ""\)/);
  assert.match(root, /__PAGES_BASE__[\s\S]*?manifest\.webmanifest/);
  assert.match(root, /navigator\.serviceWorker\.register\(`\$\{base\}sw\.js`/);
  assert.match(plugin, /if \(process\.env\.PAGES_BASE\) return html/);
});
