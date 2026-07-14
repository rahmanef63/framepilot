// editorModel/constructors — default factories for settings / meta / scene /
// project / rig (concept ~977-1018), plus the sanitizer's clamp enums. Pure.

import { DEF, uid, type Meta } from "../dataPrompt";
import { setOrbit } from "../editorMath";
import type { EditorProject, EditorScene, RigState, Vec3 } from "./types";

export const ASPECTS = ["16:9", "9:16", "4:5", "1:1", "2.39:1"];
export const FPS_ENUM = [24, 25, 30, 60];

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
