// editorModel/types — camera-angle-guide/v2 document types (plan §3.1) + deepCopy.
// Pure types, NO React, NO three. Split out of the former editorModel.ts monolith;
// the @/lib/editorModel barrel re-exports everything, so import sites are unchanged.

import type { Meta } from "../dataPrompt";

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
  source?: import("../dataPrompt").SourceKind;
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

export const deepCopy = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
