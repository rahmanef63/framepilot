// editorModel.ts — camera-angle-guide/v2 document model for the CAG Editor.
// Types (plan §3.1), constructors + sanitizer (concept ~972-1015), snap/apply,
// durations, and the one-way converters (plan §3.3). NO React, NO three.

import {
  Meta,
  DEF,
  Entry,
  ProjectScene,
  uid,
  projFrame,
  entryProject,
} from "./dataPrompt";
import { clamp, setOrbit } from "./editorMath";

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

export interface EditorProject {
  schema: "camera-angle-guide/v2";
  name: string;
  settings: { aspectRatio: string; fps: number; sensor: "Full Frame" };
  scenes: EditorScene[];
  activeSceneId: string | null;
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
  return { aspectRatio: "16:9", fps: 24, sensor: "Full Frame" };
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
    });
  });

  if (!scenes.some((s) => s.id === p.activeSceneId)) p.activeSceneId = scenes[0].id;
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
