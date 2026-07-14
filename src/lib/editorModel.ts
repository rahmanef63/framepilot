// editorModel.ts — camera-angle-guide/v2 document model for the CAG Editor.
// Types (plan §3.1), constructors + sanitizer (concept ~972-1015), snap/apply,
// durations, and the one-way converters (plan §3.3). NO React, NO three.

import {
  Meta,
  DEF,
  Entry,
  RawFrame,
  ProjectScene,
  SourceKind,
  raw,
  uid,
  projFrame,
  entryProject,
} from "./dataPrompt";
import { clamp, setOrbit } from "./editorMath";
import { CAMERA_IDS } from "./cameras";

// ============================================================
// Types — camera-angle-guide/v2 (plan §3.1)
// ============================================================
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RigSnapshot {
  camPos: Vec3;
  target: Vec3;
  subjPos: { x: number; z: number }; // NO y
  fov: number;
  roll: number;
  subj: "person" | "object";
  subjRot: number;
  trackSubject: boolean;
}

export interface EditorFrame {
  id: string;
  name: string;
  notes: string;
  thumb: string | null;
  angle: string;
  shot: string;
  lens: number;
  // Per-frame camera preset id (a prompt "shot on <brand>" look tag, sibling of
  // angle/shot/lens — NOT a rig field). Absent/"" = inherit-or-none. Ignored when
  // settings.globalCamera is on (the project camera wins). Optional for back-compat.
  camera?: string;
  az: number;
  el: number;
  dist: number;
  s: RigSnapshot;
  meta: Meta;
}

export interface EditorScene {
  id: string;
  name: string;
  notes: string;
  frames: EditorFrame[];
  frameSeq: number;
  collapsed: boolean;
  notesOpen: boolean;
}

// --- reconfigurable quad (Goal B) ---
// A quad slot is one of the three reconfigurable cells (cam stays locked to the
// pov shot camera). Each slot resolves to a ViewKind: a fixed ortho preset, or a
// custom saved orbit ("custom:<savedViewId>").
export type SlotId = "top" | "left" | "right";
export type OrthoId = "top" | "bottom" | "left" | "right" | "front" | "back" | "iso";
export type ViewKind = OrthoId | `custom:${string}`;

// A named custom camera orbit the user snapshotted from the pov camera.
export interface SavedView {
  id: string;
  name: string;
  az: number;
  el: number;
  dist: number;
}

export interface EditorProject {
  schema: "camera-angle-guide/v2";
  name: string;
  settings: { aspectRatio: string; fps: number; sensor: "Full Frame"; globalCamera: boolean; camera: string };
  scenes: EditorScene[];
  activeSceneId: string | null;
  // Optional origin tag — set by the create-from-image / import flow so the
  // Pustaka can label + filter it ("photo", "youtube", …). Absent for docs
  // authored in Studio 3D, which the Pustaka treats as source "studio".
  // Round-trips through save/load (JSON + deepCopy preserve it).
  source?: SourceKind;
  // Reconfigurable quad (Goal B) — both optional for back-compat with older v2
  // docs; sanitized/defaulted in ensureProjectShape. deepCopy carries them.
  savedViews?: SavedView[]; // custom orbits, per-project authoring data
  quadSlots?: Record<SlotId, ViewKind>; // which view each reconfigurable cell shows
}

// Live rig — mutated in place, pushed to the engine imperatively (plan §3.1).
export interface RigState {
  camPos: Vec3;
  target: Vec3;
  fov: number;
  roll: number;
  subj: "person" | "object";
  subjRot: number;
  subjPos: { x: number; z: number };
  trackSubject: boolean;
}

// ============================================================
// Utilities
// ============================================================
export const deepCopy = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

const ASPECTS = ["16:9", "9:16", "4:5", "1:1", "2.39:1"];
const FPS_ENUM = [24, 25, 30, 60];

// ============================================================
// Constructors (concept ~977-1018)
// ============================================================
export function defaultProjectSettings(): EditorProject["settings"] {
  return { aspectRatio: "16:9", fps: 24, sensor: "Full Frame", globalCamera: false, camera: "" };
}

export function defaultShotMeta(): Meta {
  return { ...DEF };
}

export function newScene(name?: string, seqBase = 1): EditorScene {
  return {
    id: uid(),
    name: name || "Scene " + seqBase,
    notes: "",
    frames: [],
    frameSeq: 1,
    collapsed: false,
    notesOpen: false,
  };
}

export function newProject(): EditorProject {
  const s = newScene("Scene 1");
  return {
    schema: "camera-angle-guide/v2",
    name: "",
    settings: defaultProjectSettings(),
    scenes: [s],
    activeSceneId: s.id,
  };
}

// Default live rig — az30/el4/dist3, fov40, roll0, targetY1.35, person (plan §3.1).
export function defaultRigState(): RigState {
  const target: Vec3 = { x: 0, y: 1.35, z: 0 };
  const camPos = setOrbit(30, 4, 3, target);
  return {
    camPos,
    target,
    fov: 40,
    roll: 0,
    subj: "person",
    subjRot: 0,
    subjPos: { x: 0, z: 0 },
    trackSubject: false,
  };
}

// ============================================================
// Sanitizer (concept ensureProjectShape ~992-1015) — plan §3.2 clamps
// ============================================================
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

export function activeScene(project: EditorProject): EditorScene {
  let s = project.scenes.find((x) => x.id === project.activeSceneId);
  if (!s) {
    s = project.scenes[0];
    project.activeSceneId = s.id;
  }
  return s;
}

// Locate a frame by id across all scenes — shared by every scene-walk site
// (brief.currentFrame + frames CRUD). Null when no scene holds the id.
export function findFrame(
  project: EditorProject,
  id: string
): { scene: EditorScene; frame: EditorFrame; index: number } | null {
  for (const scene of project.scenes) {
    const index = scene.frames.findIndex((f) => f.id === id);
    if (index >= 0) return { scene, frame: scene.frames[index], index };
  }
  return null;
}

// ============================================================
// Snapshot <-> live rig (concept snapState/applyState ~1771-1785)
// ============================================================
export function snapState(rig: RigState): RigSnapshot {
  return {
    camPos: { ...rig.camPos },
    target: { ...rig.target },
    subjPos: { ...rig.subjPos },
    fov: rig.fov,
    roll: rig.roll,
    subj: rig.subj,
    subjRot: rig.subjRot,
    trackSubject: rig.trackSubject,
  };
}

// Mutates rig in place from a snapshot; false if snapshot is malformed.
export function applyState(rig: RigState, s: RigSnapshot | null | undefined): boolean {
  if (!s || !s.camPos || !s.target || !s.subjPos) return false;
  rig.camPos = { ...s.camPos };
  rig.target = { ...s.target };
  rig.subjPos = { ...s.subjPos };
  rig.fov = +s.fov || 40;
  rig.roll = +s.roll || 0;
  rig.subj = s.subj === "object" ? "object" : "person";
  rig.subjRot = +s.subjRot || 0;
  rig.trackSubject = !!s.trackSubject;
  return true;
}

// ============================================================
// Durations (concept ~1294-1296)
// ============================================================
export function frameDuration(f: EditorFrame | null | undefined): number {
  return Math.max(0.1, +(f?.meta?.duration || 2));
}

export function sceneDuration(sc: EditorScene | null | undefined): number {
  return (sc?.frames || []).reduce((sum, f) => sum + frameDuration(f), 0);
}

// ============================================================
// Converters (plan §3.3) — one-way, on demand
// ============================================================

// Accepts: v2 JSON | library Entry | AppState Project (lightweight).
export function toEditorProject(src: unknown): EditorProject {
  const o = src as Record<string, unknown> | null;
  if (!o || typeof o !== "object") return newProject();

  // 1) already v2 (schema/settings present)
  if (o.schema === "camera-angle-guide/v2" || (o.settings && Array.isArray(o.scenes))) {
    return ensureProjectShape(deepCopy(o));
  }

  // 2) library Entry -> entryProject (already v2)
  if (o.data && Array.isArray((o.data as Record<string, unknown>).scenes)) {
    return ensureProjectShape(entryProject(o as unknown as Entry));
  }

  // 3) AppState Project: { scenes:[{id,name,frames:RawFrame[]}] } — wrap.
  if (Array.isArray(o.scenes)) {
    const scenes = (o.scenes as ProjectScene[]).map((sc) => ({
      id: sc.id || uid(),
      name: sc.name || "Scene",
      notes: "",
      frameSeq: sc.frames.length + 1,
      collapsed: false,
      notesOpen: false,
      frames: sc.frames.map((fr) => {
        const pf = projFrame(fr) as unknown as EditorFrame;
        // object frames come from synth at ty 1.35 — normalize to 1.0 (plan §3.3)
        if (pf.s.subj === "object") pf.s.target.y = 1.0;
        return pf;
      }),
    }));
    const ep = {
      schema: "camera-angle-guide/v2",
      name: typeof o.name === "string" ? (o.name as string) : "",
      settings: defaultProjectSettings(),
      scenes,
      activeSceneId: scenes[0]?.id || null,
    };
    return ensureProjectShape(ep);
  }

  return newProject();
}

// EditorFrame -> RawFrame (the AppState/library frame shape). Reverse of the
// projFrame + synth path in toEditorProject: pulls roll/fov/subj back out of the
// rig snapshot so a round-trip preserves the visible fields.
function editorFrameToRaw(f: EditorFrame): RawFrame {
  const s = f.s || ({} as RigSnapshot);
  const num = (v: unknown, d: number) => (Number.isFinite(+(v as number)) ? +(v as number) : d);
  return {
    name: f.name || "Shot",
    angle: f.angle || "EYE LEVEL",
    shot: f.shot || "MEDIUM SHOT",
    lens: num(f.lens, 50),
    az: num(f.az, 30),
    el: num(f.el, 4),
    dist: num(f.dist, 3),
    roll: num(s.roll, 0),
    fov: num(s.fov, 40),
    subj: s.subj || "person",
    meta: { ...DEF, ...(f.meta || {}) },
  };
}

export interface ProjectEntryMeta {
  id: string; // the stable Pustaka entry id (e.g. "local:<id>" / "cloud:<_id>")
  source?: SourceKind; // defaults to "studio" (a Studio-3D-authored doc)
  created?: number; // defaults to Date.now()
  ref?: string;
  en?: string;
}

// The MISSING direction (plan §3.3 was one-way editor<-library): EditorProject
// (or a stored SavedEntry.project) -> AppState library Entry, so the Pustaka can
// render the persistent projects store as Entry cards. Reuses editorFrameToRaw
// for the frame shape; guarantees at least one scene with one frame so the
// Pustaka's derived view (scenes[0].frames[0]) is always safe.
export function projectToEntry(project: EditorProject, meta: ProjectEntryMeta): Entry {
  const scenes = (project.scenes || [])
    .map((sc) => ({ name: sc.name || "Scene", frames: (sc.frames || []).map(editorFrameToRaw) }))
    .filter((sc) => sc.frames.length);
  return {
    id: meta.id,
    name: project.name || "Tanpa nama",
    en: meta.en || "",
    source: meta.source || project.source || "studio",
    ref: meta.ref || "",
    created: meta.created ?? Date.now(),
    data: { scenes: scenes.length ? scenes : [{ name: "Scene 1", frames: [raw()] }] },
  };
}

// True when a project has at least one real frame — used to hide empty (freshly
// created, no-shot) projects from the Pustaka.
export function projectHasFrames(project: EditorProject): boolean {
  return (project.scenes || []).some((sc) => (sc.frames || []).length > 0);
}
