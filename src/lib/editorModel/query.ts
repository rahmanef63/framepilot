// editorModel/query — scene/frame lookups, snapshot<->rig, and durations. Pure.

import type { EditorFrame, EditorProject, EditorScene, RigSnapshot, RigState } from "./types";

export function activeScene(project: EditorProject): EditorScene {
  let s = project.scenes.find((x) => x.id === project.activeSceneId);
  if (!s) {
    s = project.scenes[0];
    project.activeSceneId = s.id;
  }
  return s;
}

/** Playback transport label "cur/total · name" for a scene's frames ("—" when empty). */
export function frameIndicator(frames: EditorFrame[], idx: number): string {
  const total = frames.length;
  if (!total) return "—";
  const cur = Math.min(idx + 1, total);
  const name = frames[Math.min(idx, total - 1)]?.name || "";
  return `${cur}/${total} · ${name}`;
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
