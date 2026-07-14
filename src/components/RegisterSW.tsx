"use client";
// RegisterSW — registers the PWA service worker (/sw.js) after load. Mounted once in
// the root layout. No-op where service workers are unavailable (SSR, old browsers).
// Updates are handled by the SW's skipWaiting/clients.claim; the hard escape hatch is
// the "Muat ulang versi" button (forceFreshReload → unregister + cache purge).
import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}
