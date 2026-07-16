"use client";
// Beacon — first-party, privacy-clean analytics + client-error reporter. Renders null.
// Fires a pageview on every pathname change and reports uncaught errors, all to the
// existing Convex backend (convex/analytics.ts). No PII, no IP, no user identity — only
// the contract fields: an anonymous random sessionId + coarse device/locale.
//
// Every mutation call is .catch(()=>{}) so a Convex outage can never throw into the UI,
// and the whole component is a no-op when ANALYTICS_ON is false.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useT } from "@/i18n";
import { beaconEnabled, getDevice, getSessionId } from "@/lib/analytics";

// Cap error reports per page load so a render loop can't spam the backend.
const MAX_ERRORS = 5;

export function Beacon() {
  const { locale } = useT();
  const pathname = usePathname();
  // useMutation returns a stable fn; safe to depend on / call from listeners.
  const pageview = useMutation(api.analytics.pageview);
  const logError = useMutation(api.analytics.logError);

  const firstLoad = useRef(true);

  // Pageview on every pathname change (and once on mount).
  useEffect(() => {
    if (!beaconEnabled()) return;
    const referrer = firstLoad.current ? document.referrer || undefined : undefined;
    firstLoad.current = false;
    pageview({
      path: pathname || "/",
      referrer,
      locale,
      lang: navigator.language || undefined,
      device: getDevice(),
      sessionId: getSessionId(),
    }).catch(() => {});
  }, [pathname, locale, pageview]);

  // Global error + unhandledrejection listeners → logError. Deduped + capped per load.
  useEffect(() => {
    if (!beaconEnabled()) return;
    const seen = new Set<string>();
    let sent = 0;

    const report = (message: string, stack: string | undefined) => {
      const sig = message.slice(0, 200);
      if (seen.has(sig)) return;
      seen.add(sig);
      if (sent >= MAX_ERRORS) return;
      sent++;
      logError({
        message,
        stack,
        path: window.location.pathname,
        ua: navigator.userAgent || undefined,
        sessionId: getSessionId(),
      }).catch(() => {});
    };

    const onError = (e: ErrorEvent) => {
      report(e.message || "Unknown error", e.error?.stack);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      const message = r instanceof Error ? r.message : String(r ?? "Unhandled rejection");
      report(message, r instanceof Error ? r.stack : undefined);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [logError]);

  return null;
}
