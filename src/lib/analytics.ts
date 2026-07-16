// First-party, privacy-clean analytics helpers. Pure client utilities — no PII, no IP,
// just an anonymous random sessionId in localStorage. Safe to import from client components.
// See convex/analytics.ts for the matching backend contract.

const SID_KEY = "cag.sid";

// Master off-switch: set NEXT_PUBLIC_ANALYTICS_DISABLED="1" to make the whole beacon a no-op.
export const ANALYTICS_ON = process.env.NEXT_PUBLIC_ANALYTICS_DISABLED !== "1";

/**
 * Whether the beacon should actually send this request. Off via the env flag, off during
 * SSR, and ALWAYS off on localhost/dev/preview hosts — so local dev, the standalone
 * smoke test, and CI never pollute production analytics. (NEXT_PUBLIC_* is baked at build
 * time, so this runtime host check is what reliably keeps non-prod traffic out.)
 */
export function beaconEnabled(): boolean {
  if (!ANALYTICS_ON || typeof window === "undefined") return false;
  const h = window.location.hostname;
  return !(h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h.endsWith(".local"));
}

// Math-free-ish UUID fallback for the rare browser without crypto.randomUUID.
// (crypto.getRandomValues is available essentially everywhere; Math.random is the last resort.)
function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    /* fall through */
  }
  // Last-resort fallback (non-crypto): still just an opaque anonymous id.
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}`;
}

/**
 * Stable per-browser anonymous session id. Reads/writes localStorage "cag.sid".
 * SSR-safe: returns an ephemeral id (never persisted) when there is no window.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const existing = window.localStorage.getItem(SID_KEY);
    if (existing) return existing;
    const fresh = randomId();
    window.localStorage.setItem(SID_KEY, fresh);
    return fresh;
  } catch {
    // localStorage blocked (private mode / disabled) — degrade to a per-call id.
    return randomId();
  }
}

/** Coarse form factor. "mobile" for small/touch screens, "desktop" otherwise. SSR → "desktop". */
export function getDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  try {
    if (window.matchMedia && window.matchMedia("(max-width:820px)").matches) return "mobile";
    if ("ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0) return "mobile";
  } catch {
    /* ignore */
  }
  return "desktop";
}
