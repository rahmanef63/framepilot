// Theme MODE layer (vanilla, no deps) — orthogonal to theme-presets.ts.
//
// theme-presets.ts injects a PALETTE (a <style> tag of --token values, with a
// dark block scoped to `:root[data-theme="dark"]`). But nothing ever toggles
// that attribute, so the dark block never wins. This module owns exactly that
// toggle: it sets/removes `data-theme="dark"` on <html> based on the chosen
// mode. Mode (light/dark/system) and preset (palette) compose: mode decides
// WHICH block applies, preset decides WHAT the block contains.

export type Mode = "light" | "dark" | "system";

const STORAGE_KEY = "framepilot:theme-mode";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Read the persisted mode. Defaults to "system". */
export function getMode(): Mode {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
}

/** True when the OS currently prefers dark. */
function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(DARK_QUERY).matches;
}

/** Resolve a mode to the concrete boolean "is dark right now". */
function resolveDark(m: Mode): boolean {
  return m === "dark" || (m === "system" && systemPrefersDark());
}

// Single OS-preference listener, active only while mode === "system".
let mql: MediaQueryList | null = null;
let mqlListener: ((e: MediaQueryListEvent) => void) | null = null;

function detachSystemListener(): void {
  if (mql && mqlListener) mql.removeEventListener("change", mqlListener);
  mqlListener = null;
}

function attachSystemListener(): void {
  if (typeof window === "undefined" || !window.matchMedia) return;
  detachSystemListener();
  mql = window.matchMedia(DARK_QUERY);
  mqlListener = () => {
    // Only re-apply while still in system mode.
    if (getMode() === "system") setDataTheme(systemPrefersDark());
  };
  mql.addEventListener("change", mqlListener);
}

/** Set/remove the `data-theme="dark"` attribute on <html>. */
function setDataTheme(dark: boolean): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (dark) el.dataset.theme = "dark";
  else el.dataset.theme = "light";
}

/** Apply a mode NOW (toggle attribute + manage the system listener). */
export function applyMode(m: Mode): void {
  setDataTheme(resolveDark(m));
  if (m === "system") attachSystemListener();
  else detachSystemListener();
}

/** Persist + apply a mode. */
export function setMode(m: Mode): void {
  try {
    localStorage.setItem(STORAGE_KEY, m);
  } catch {
    // ignore
  }
  applyMode(m);
}

/** Apply the saved (or default "system") mode on app load. */
export function bootMode(): void {
  applyMode(getMode());
}
