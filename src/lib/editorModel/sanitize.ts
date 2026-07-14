// editorModel/sanitize — ensureProjectShape: the ONE chokepoint every load path
// (localStorage / Convex / undo-redo) funnels through. Clamps settings, filters +
// defaults frames, and rebuilds savedViews/quadSlots. Migration-safe: new optional
// fields default here when absent (concept ensureProjectShape ~992-1015).

import { uid } from "../dataPrompt";
import { clamp } from "../editorMath";
import { CAMERA_IDS } from "../cameras";
import { ASPECTS, FPS_ENUM, defaultProjectSettings, defaultShotMeta, newProject } from "./constructors";
import type { EditorProject, SavedView, SlotId, ViewKind } from "./types";

function validVec(v: unknown, keys: string[]): boolean {
  const o = v as Record<string, unknown>;
  return !!o && keys.every((k) => Number.isFinite(+(o[k] as number)));
}

export function ensureProjectShape(input: unknown): EditorProject {
  const p = input as Record<string, unknown> | null;
  if (!p || !Array.isArray(p.scenes) || !p.scenes.length) return newProject();

  p.schema = "camera-angle-guide/v2";
  p.name = typeof p.name === "string" ? p.name : "";
  const settings = { ...defaultProjectSettings(), ...((p.settings as object) || {}) } as EditorProject["settings"];
  if (!ASPECTS.includes(settings.aspectRatio)) settings.aspectRatio = "16:9";
  settings.fps = FPS_ENUM.includes(+settings.fps) ? +settings.fps : 24;
  settings.sensor = "Full Frame";
  settings.globalCamera = !!settings.globalCamera;
  if (!CAMERA_IDS.has(settings.camera)) settings.camera = "";
  p.settings = settings;

  const scenes = p.scenes as Record<string, unknown>[];
  scenes.forEach((sc, si) => {
    sc.id ||= uid();
    sc.name ||= `Scene ${si + 1}`;
    sc.notes ||= "";
    let frames = Array.isArray(sc.frames) ? (sc.frames as Record<string, unknown>[]) : [];
    frames = frames.filter((f) => {
      const s = f && (f.s as Record<string, unknown>);
      return (
        !!s &&
        validVec(s.camPos, ["x", "y", "z"]) &&
        validVec(s.target, ["x", "y", "z"]) &&
        validVec(s.subjPos, ["x", "z"])
      );
    });
    sc.frames = frames;
    sc.frameSeq ||= frames.length + 1;
    sc.collapsed = !!sc.collapsed;
    sc.notesOpen = !!sc.notesOpen;
    frames.forEach((f, fi) => {
      f.id ||= uid();
      f.name ||= `Shot ${fi + 1}`;
      f.notes ||= "";
      const meta = { ...defaultShotMeta(), ...((f.meta as object) || {}) } as Record<string, unknown>;
      (["intent", "movement", "action", "lighting", "style", "audio", "transition"] as const).forEach(
        (k) => (meta[k] = String(meta[k] ?? (defaultShotMeta() as unknown as Record<string, unknown>)[k]).slice(0, 1200))
      );
      meta.duration = clamp(+(meta.duration as number) || 2, 0.5, 30);
      f.meta = meta;
      f.angle = String(f.angle || "EYE LEVEL").slice(0, 80);
      f.shot = String(f.shot || "MEDIUM SHOT").slice(0, 80);
      f.lens = Number.isFinite(+(f.lens as number)) ? Math.round(+(f.lens as number)) : 50;
      f.camera = CAMERA_IDS.has(f.camera as string) ? f.camera : "";
    });
  });

  if (!scenes.some((s) => s.id === p.activeSceneId)) p.activeSceneId = scenes[0].id;

  // --- reconfigurable quad (Goal B) — savedViews first, then quadSlots so a slot
  // pointing at a deleted custom view reverts to its default preset (never blanks). ---
  const rawViews = Array.isArray(p.savedViews) ? (p.savedViews as Record<string, unknown>[]) : [];
  const savedViews: SavedView[] = rawViews
    .filter((v) => v && typeof v.id === "string" && Number.isFinite(+(v.az as number)))
    .map((v) => ({
      id: String(v.id),
      name: String(v.name ?? "View").slice(0, 60),
      az: +(v.az as number) || 0,
      el: +(v.el as number) || 0,
      dist: clamp(+(v.dist as number) || 3, 0.3, 30),
    }));
  p.savedViews = savedViews;
  const viewIds = new Set(savedViews.map((v) => v.id));

  const ORTHO_KINDS = ["top", "bottom", "left", "right", "front", "back", "iso"];
  const SLOT_DEFAULTS: Record<SlotId, ViewKind> = { top: "top", left: "left", right: "right" };
  const rawSlots = (p.quadSlots as Record<string, unknown>) || {};
  const quadSlots: Record<SlotId, ViewKind> = { ...SLOT_DEFAULTS };
  (["top", "left", "right"] as SlotId[]).forEach((slot) => {
    const k = rawSlots[slot];
    if (typeof k === "string" && ORTHO_KINDS.includes(k)) quadSlots[slot] = k as ViewKind;
    else if (typeof k === "string" && k.startsWith("custom:") && viewIds.has(k.slice(7)))
      quadSlots[slot] = k as ViewKind;
    else quadSlots[slot] = SLOT_DEFAULTS[slot];
  });
  p.quadSlots = quadSlots;

  return p as unknown as EditorProject;
}
