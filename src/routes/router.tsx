import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { prefixRewrite, previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

/**
 * TanStack Start resets `basepath` to "" when the browser hydrates, so a Vite
 * `base` such as /Abdeen_English_Academy_System/ (GitHub Pages project site)
 * cannot be handled with `basepath`: no route would match and the page stays
 * blank. A location rewrite survives hydration, so it strips the base from the
 * URL on input and adds it back to generated links on output.
 */
function staticBaseRewrite() {
  if (typeof window === "undefined") return undefined;
  const raw = import.meta.env.BASE_URL ?? "/";
  if (raw === "/" || raw === "./" || raw === "") return undefined;
  return prefixRewrite(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite() ?? staticBaseRewrite(),
    defaultErrorComponent: AppErrorComponent,
  });
}
