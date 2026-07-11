// editorStorage.ts — persistence for the CAG Editor (plan G22).
// Backend: window.storage -> localStorage -> in-memory. Quota-safe.

import { EditorProject, ensureProjectShape, newProject, deepCopy } from "./editorModel";

export const AUTOKEY = "camguide-pro-autosave";
export const LISTKEY = "camguide-pro-projects";

// Fired whenever the saved-projects list changes (save/delete). The Pustaka
// (AppState) listens for this so an anonymous Studio 3D save shows up live —
// AppStateProvider spans both "/" and "/editor" and never remounts, so it can't
// rely on a route change to re-read. Signed-in users get live updates from the
// reactive Convex query instead; this event is the localStorage counterpart.
export const PROJECTS_CHANGED = "framepilot:projects-changed";

function notifyProjectsChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(PROJECTS_CHANGED));
  } catch {
    /* ignore */
  }
}

// ---- backend selection ----
interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function pickBackend(): KV {
  try {
    const w = typeof window !== "undefined" ? (window as unknown as { storage?: KV }) : undefined;
    if (w && w.storage && typeof w.storage.getItem === "function") return w.storage;
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      // probe (private-mode Safari throws on setItem)
      const k = "__camguide_probe__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return localStorage as unknown as KV;
    }
  } catch {
    /* ignore */
  }
  const mem = new Map<string, string>();
  return {
    getItem: (k) => (mem.has(k) ? (mem.get(k) as string) : null),
    setItem: (k, v) => void mem.set(k, v),
    removeItem: (k) => void mem.delete(k),
  };
}

let _kv: KV | null = null;
function kv(): KV {
  if (!_kv) _kv = pickBackend();
  return _kv;
}

export interface SaveResult {
  ok: boolean;
  quota: boolean; // true if the write failed on QuotaExceededError
}

function safeWrite(key: string, value: string): SaveResult {
  try {
    kv().setItem(key, value);
    return { ok: true, quota: false };
  } catch (e) {
    const quota =
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22);
    return { ok: false, quota };
  }
}

// ============================================================
// Saved-projects list
// ============================================================
export interface SavedEntry {
  id: string;
  name: string;
  updated: number;
  project: EditorProject;
}

export function listProjects(): SavedEntry[] {
  try {
    const raw = kv().getItem(LISTKEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e) => e && e.id && e.project)
      .sort((a: SavedEntry, b: SavedEntry) => (b.updated || 0) - (a.updated || 0));
  } catch {
    return [];
  }
}

// Upsert (matched by id) — returns the write result + the id used.
export function saveProject(project: EditorProject): SaveResult & { id: string } {
  const id = project.activeSceneId ? "prj-" + project.scenes[0].id : "prj-" + Date.now().toString(36);
  const list = listProjects();
  const idx = list.findIndex((e) => e.name === (project.name || "Tanpa nama"));
  const entry: SavedEntry = {
    id: idx >= 0 ? list[idx].id : id,
    name: project.name || "Tanpa nama",
    updated: Date.now(),
    project: deepCopy(project),
  };
  if (idx >= 0) list[idx] = entry;
  else list.unshift(entry);
  const res = safeWrite(LISTKEY, JSON.stringify(list));
  if (res.ok) notifyProjectsChanged();
  return { ...res, id: entry.id };
}

export function loadProject(id: string): EditorProject | null {
  const entry = listProjects().find((e) => e.id === id);
  if (!entry) return null;
  return ensureProjectShape(deepCopy(entry.project));
}

export function deleteProject(id: string): SaveResult {
  const list = listProjects().filter((e) => e.id !== id);
  const res = safeWrite(LISTKEY, JSON.stringify(list));
  if (res.ok) notifyProjectsChanged();
  return res;
}

// ============================================================
// Autosave (debounced) + New Project
// ============================================================
let _autoTimer: ReturnType<typeof setTimeout> | null = null;

export function autosave(project: EditorProject, onResult?: (res: SaveResult) => void, delay = 600): void {
  if (_autoTimer) clearTimeout(_autoTimer);
  _autoTimer = setTimeout(() => {
    const res = safeWrite(AUTOKEY, JSON.stringify(project));
    if (onResult) onResult(res);
  }, delay);
}

export function loadAutosave(): EditorProject | null {
  try {
    const raw = kv().getItem(AUTOKEY);
    if (!raw) return null;
    return ensureProjectShape(JSON.parse(raw));
  } catch {
    return null;
  }
}

// Destructive: clears autosave and returns a fresh v2 project (plan G22, no confirm).
export function newProjectStorage(): EditorProject {
  try {
    kv().removeItem(AUTOKEY);
  } catch {
    /* ignore */
  }
  return newProject();
}
