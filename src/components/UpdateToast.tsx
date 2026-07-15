"use client";
// Auto-detect "new version available" toast. Polls /api/build-id (the running
// server's build id) and compares it to this bundle's baked id; when a deploy makes
// them diverge, it shows a dismissible toast whose "Muat ulang" runs forceFreshReload
// (unregister SW + purge caches + cache-busted reload). Checks on mount, every 5 min,
// and when the tab regains focus — so a user who left the tab open gets the new build.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { forceFreshReload } from "@/lib/forceFreshReload";
// Mounted in the root layout body OUTSIDE I18nProvider, so useT() has no context
// here — use the context-free tr() runtime, which mirrors the active locale.
import { tr } from "@/i18n";

const LOCAL_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown";
const POLL_MS = 5 * 60 * 1000;

export function UpdateToast() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    // no id baked (e.g. odd dev setup) → nothing to compare, stay silent
    if (LOCAL_ID === "unknown") return;
    let done = false; // once stale, stop polling — the toast is up

    const check = async () => {
      if (done) return;
      try {
        const r = await fetch("/api/build-id", { cache: "no-store" });
        if (!r.ok) return;
        const { buildId } = await r.json();
        if (buildId && buildId !== "unknown" && buildId !== LOCAL_ID) {
          done = true;
          setStale(true);
        }
      } catch {
        /* offline / transient — try again next tick */
      }
    };

    void check();
    const id = window.setInterval(check, POLL_MS);
    const onFocus = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      done = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  if (!stale) return null;
  return (
    <div className="fp-update-toast" role="status">
      <span className="fp-ut-msg">{tr("chrome.updateAvailable")}</span>
      <button className="fp-ut-reload" onClick={() => void forceFreshReload()}>
        {tr("chrome.reload")}
      </button>
      <button className="fp-ut-close" aria-label={tr("common.close")} onClick={() => setStale(false)}>
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
