// Non-React translation accessor for plain .ts logic files (engine, exporters,
// data seeds) that can't call the useT() hook. The provider mirrors the active
// locale here on every change via setActiveLocale(), so tr() stays in sync.
import { MESSAGES } from "./messages";
import type { Locale } from "./types";

let active: Locale = "id";

export function setActiveLocale(l: Locale): void {
  active = l;
}

/** Translate a key in the active locale, falling back to Indonesian, then the raw key. */
export function tr(key: string, vars?: Record<string, string | number>): string {
  const raw = MESSAGES[active][key] ?? MESSAGES.id[key] ?? key;
  return vars ? interpolate(raw, vars) : raw;
}

export function interpolate(raw: string, vars: Record<string, string | number>): string {
  return raw.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
