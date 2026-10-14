import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "English Academy";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Build a steady English speaking habit with daily lessons, phrase practice, reading, sound work, notes, and progress tracking.",
      },
      { name: "theme-color", content: "#0e6b68" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content:
          "A practical English practice studio for speaking, phrases, reading, pronunciation, and daily progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${import.meta.env.BASE_URL}og.jpg` },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL}favicon.svg` },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800&display=swap",
      },
      {
        rel: "manifest",
        href: __PAGES_BASE__
          ? `${import.meta.env.BASE_URL}manifest.webmanifest`
          : "/__grok/manifest.webmanifest",
      },
      {
        rel: "apple-touch-icon",
        href: `${import.meta.env.BASE_URL}__grok/icon-180.png`,
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("eng-academy-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.dataset.theme="dark";}catch(e){}})();',
          }}
        />
      </head>
      <body>
        <PwaRegistration />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});


/** Register the static worker from the app's own base path (also on project Pages). */
function PwaRegistration() {
  useEffect(() => {
    // Keep Vite dev/HMR free of service-worker caching; register in static Pages builds.
    if (!__PAGES_BASE__ || !("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    const base = import.meta.env.BASE_URL || "/";
    void navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      // The app remains fully usable when a browser or host disables service workers.
    });
  }, []);

  return null;
}
