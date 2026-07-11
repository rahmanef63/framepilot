// editor/frames.ts — frame CRUD. captureFrameFields snapshots the live rig + brief
// into a frame record. Depends on stopPlayback (playback), commit/schedule
// (history) and currentFrame (brief).

import { useCallback } from "react";
import { uid } from "@/lib/dataPrompt";
import {
  EditorFrame,
  defaultShotMeta,
  activeScene as findActiveScene,
  snapState,
  deepCopy,
  applyState,
} from "@/lib/editorModel";
import {
  getOrbit,
  angleLabel,
  shotLabel,
  focalLength,
  subjHeight,
} from "@/lib/editorMath";
import type { EditorCore } from "./core";

export interface FrameActions {
  addFrame: () => void;
  updateFrame: () => void;
  loadFrame: (id: string) => void;
  dupFrame: (id: string) => void;
  delFrame: (id: string) => void;
  moveFrame: (id: string, dir: -1 | 1) => void;
  renameFrame: (id: string, name: string) => void;
  setFrameNotes: (id: string, notes: string) => void;
}

export function useFrameActions(
  core: EditorCore,
  deps: {
    stopPlayback: () => void;
    commitHistory: (label?: string) => void;
    scheduleHistoryCommit: (label?: string, delay?: number) => void;
    currentFrame: () => EditorFrame | null;
  }
): FrameActions {
  const { projectRef, rigRef, currentFrameIdRef, draftMetaRef, engineRef, bump, syncRig } = core;
  const { stopPlayback, commitHistory, scheduleHistoryCommit, currentFrame } = deps;

  const captureFrameFields = useCallback((): Omit<EditorFrame, "id" | "name" | "notes"> => {
    const rig = rigRef.current;
    const o = getOrbit(rig.camPos, rig.target);
    return {
      thumb: engineRef.current?.captureThumb(projectRef.current.settings.aspectRatio) ?? null,
      angle: angleLabel(o.el, rig.roll),
      shot: shotLabel(o.dist, rig.fov, subjHeight(rig.subj)),
      lens: focalLength(rig.fov),
      az: Math.round(o.az),
      el: Math.round(o.el),
      dist: +o.dist.toFixed(1),
      s: snapState(rig),
      meta: { ...defaultShotMeta(), ...draftMetaRef.current },
    };
  }, [projectRef, rigRef, draftMetaRef, engineRef]);

  const addFrame = useCallback(() => {
    stopPlayback();
    const sc = findActiveScene(projectRef.current);
    const fields = captureFrameFields();
    const f: EditorFrame = {
      id: uid(),
      name: "Shot " + sc.frameSeq++,
      notes: "",
      ...fields,
    };
    sc.frames.push(f);
    currentFrameIdRef.current = f.id;
    commitHistory("Tambah frame");
    bump();
  }, [projectRef, currentFrameIdRef, stopPlayback, captureFrameFields, commitHistory, bump]);

  const updateFrame = useCallback(() => {
    const f = currentFrame();
    if (!f) return;
    stopPlayback();
    Object.assign(f, captureFrameFields());
    commitHistory("Perbarui frame");
    bump();
  }, [currentFrame, stopPlayback, captureFrameFields, commitHistory, bump]);

  const loadFrame = useCallback(
    (id: string) => {
      stopPlayback();
      let target: EditorFrame | null = null;
      for (const sc of projectRef.current.scenes) {
        const f = sc.frames.find((x) => x.id === id);
        if (f) {
          target = f;
          projectRef.current.activeSceneId = sc.id;
          break;
        }
      }
      if (!target) return;
      applyState(rigRef.current, target.s);
      currentFrameIdRef.current = target.id;
      draftMetaRef.current = { ...defaultShotMeta(), ...target.meta };
      syncRig();
      engineRef.current?.updateHud();
      bump();
    },
    [projectRef, rigRef, currentFrameIdRef, draftMetaRef, engineRef, stopPlayback, syncRig, bump]
  );

  const dupFrame = useCallback(
    (id: string) => {
      stopPlayback();
      for (const sc of projectRef.current.scenes) {
        const i = sc.frames.findIndex((x) => x.id === id);
        if (i >= 0) {
          const src = sc.frames[i];
          const copy: EditorFrame = {
            ...deepCopy(src),
            id: uid(),
            name: src.name + " (copy)",
          };
          sc.frames.splice(i + 1, 0, copy);
          currentFrameIdRef.current = copy.id;
          commitHistory("Gandakan frame");
          bump();
          return;
        }
      }
    },
    [projectRef, currentFrameIdRef, stopPlayback, commitHistory, bump]
  );

  const delFrame = useCallback(
    (id: string) => {
      stopPlayback();
      for (const sc of projectRef.current.scenes) {
        const i = sc.frames.findIndex((x) => x.id === id);
        if (i >= 0) {
          sc.frames.splice(i, 1);
          if (currentFrameIdRef.current === id) currentFrameIdRef.current = null;
          commitHistory("Hapus frame");
          bump();
          return;
        }
      }
    },
    [projectRef, currentFrameIdRef, stopPlayback, commitHistory, bump]
  );

  const moveFrame = useCallback(
    (id: string, dir: -1 | 1) => {
      stopPlayback();
      for (const sc of projectRef.current.scenes) {
        const i = sc.frames.findIndex((x) => x.id === id);
        if (i >= 0) {
          const j = i + dir;
          if (j < 0 || j >= sc.frames.length) return;
          [sc.frames[i], sc.frames[j]] = [sc.frames[j], sc.frames[i]];
          commitHistory("Pindahkan frame");
          bump();
          return;
        }
      }
    },
    [projectRef, stopPlayback, commitHistory, bump]
  );

  const renameFrame = useCallback(
    (id: string, name: string) => {
      const f = (() => {
        for (const sc of projectRef.current.scenes) {
          const hit = sc.frames.find((x) => x.id === id);
          if (hit) return hit;
        }
        return null;
      })();
      if (!f) return;
      f.name = name;
      scheduleHistoryCommit("Ganti nama frame");
      bump();
    },
    [projectRef, scheduleHistoryCommit, bump]
  );

  const setFrameNotes = useCallback(
    (id: string, notes: string) => {
      for (const sc of projectRef.current.scenes) {
        const f = sc.frames.find((x) => x.id === id);
        if (f) {
          f.notes = notes;
          scheduleHistoryCommit("Catatan frame");
          bump();
          return;
        }
      }
    },
    [projectRef, scheduleHistoryCommit, bump]
  );

  return {
    addFrame,
    updateFrame,
    loadFrame,
    dupFrame,
    delFrame,
    moveFrame,
    renameFrame,
    setFrameNotes,
  };
}
