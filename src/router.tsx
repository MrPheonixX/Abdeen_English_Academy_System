import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

function routerBase() {
  const raw = import.meta.env.BASE_URL ?? "/";
  if (raw === "/" || raw === "./" || raw === "") return undefined;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function getRouter() {
  const basepath = routerBase();
  return createRouter({
    routeTree,
    ...(basepath ? { basepath } : {}),
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
  });
}
