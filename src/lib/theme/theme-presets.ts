// Theme preset loader (vanilla, no framework) — sources theme definitions
// from `/r/registry.json` (verbatim copy of the tweakcn theme registry).
//
// Ported from Rahman Resources (lib/theme/theme-presets.ts), adapted for
// framepilot: NO Convex, NO next-themes. localStorage only. The dark block
// is emitted under `:root[data-theme="dark"]` (framepilot's dark selector),
// NOT `.dark`. Values pass through verbatim — full `oklch(L C H)` strings
// are valid CSS colors, and framepilot use-sites read `var(--token)`, so
// they keep working. framepilot's Rupa palette in globals.css stays the
// DEFAULT: no preset selected → no <style> tag → base tokens win.

const STORAGE_KEY = "framepilot:theme-preset";
const STYLE_ID = "theme-preset-vars";
const REGISTRY_URL = "/r/registry.json";
const DARK_SELECTOR = ':root[data-theme="dark"]';

export interface ThemePresetItem {
  name: string;
  title: string;
  type?: string;
  description?: string;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
}

export interface ThemeRegistry {
  name: string;
  items: ThemePresetItem[];
}

const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

const PASSTHROUGH_TOKENS = [
  "radius",
  "spacing",
  "letter-spacing",
  "shadow-color",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "shadow-2xs",
  "shadow-xs",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
  "font-sans",
  "font-serif",
  "font-mono",
] as const;

function buildBlock(selector: string, vars: Record<string, string>): string | null {
  const lines: string[] = [];
  for (const key of COLOR_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${v};`);
  }
  for (const key of PASSTHROUGH_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${v};`);
  }
  if (!lines.length) return null;
  return `${selector} {\n${lines.join("\n")}\n}`;
}

let registryCache: ThemeRegistry | null = null;
let registryPromise: Promise<ThemeRegistry> | null = null;

export async function loadRegistry(): Promise<ThemeRegistry> {
  if (registryCache) return registryCache;
  if (registryPromise) return registryPromise;
  registryPromise = fetch(REGISTRY_URL, { cache: "force-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(`registry.json ${r.status}`);
      return r.json() as Promise<ThemeRegistry>;
    })
    .then((data) => {
      const items = (data.items ?? []).filter(
        (i) => i.cssVars?.light && i.cssVars?.dark,
      );
      registryCache = { ...data, items };
      return registryCache;
    })
    .catch(() => {
      registryCache = { name: "framepilot-empty", items: [] };
      return registryCache;
    });
  return registryPromise;
}

export function findPreset(
  registry: ThemeRegistry,
  name: string,
): ThemePresetItem | undefined {
  return registry.items.find((i) => i.name === name);
}

export function presetSwatches(preset: ThemePresetItem): string[] {
  const v = preset.cssVars?.light ?? preset.cssVars?.dark ?? {};
  return [
    v.background ?? "oklch(1 0 0)",
    v.primary ?? "oklch(0.5 0.1 259)",
    v.accent ?? "oklch(0.5 0.1 200)",
  ];
}

function injectStyleTag(css: string): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function removeStyleTag(): void {
  if (typeof document === "undefined") return;
  document.getElementById(STYLE_ID)?.remove();
}

async function writeVars(name: string): Promise<void> {
  const reg = await loadRegistry();
  const preset = findPreset(reg, name);
  if (!preset) return;
  const blocks: string[] = [];
  const theme = preset.cssVars?.theme;
  const light = preset.cssVars?.light;
  const dark = preset.cssVars?.dark;
  if (theme) {
    const b = buildBlock(":root", theme);
    if (b) blocks.push(b);
  }
  if (light) {
    const b = buildBlock(":root", light);
    if (b) blocks.push(b);
  }
  if (dark) {
    const b = buildBlock(DARK_SELECTOR, dark);
    if (b) blocks.push(b);
  }
  injectStyleTag(blocks.join("\n\n"));
}

/** Commit a preset (inject + persist). null / "" → back to base Rupa. */
export async function applyPreset(name: string | null): Promise<void> {
  if (!name) {
    removeStyleTag();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  await writeVars(name);
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // ignore
  }
}

/** Inject without persisting — for hover preview. */
export async function previewPreset(name: string | null): Promise<void> {
  if (!name) {
    removeStyleTag();
    return;
  }
  await writeVars(name);
}

/** Re-inject whatever is persisted (used on preview mouse-leave). */
export async function restoreSavedPreset(): Promise<void> {
  const saved = getSavedPreset();
  if (!saved) {
    removeStyleTag();
    return;
  }
  await writeVars(saved);
}

export function getSavedPreset(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Apply the saved preset once on app load. No-op if none saved. */
export async function bootPreset(): Promise<void> {
  const saved = getSavedPreset();
  if (!saved) return;
  await writeVars(saved);
}
