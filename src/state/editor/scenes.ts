// editor/scenes.ts — scene CRUD. setActiveSceneId can defer to loadFrame (frames)
// to jump straight to a scene's first frame.

import { useCallback } from "react";
import { uid } from "@/lib/dataPrompt";
import { EditorScene, newScene, deepCopy } from "@/lib/editorModel";
import type { EditorCore } from "./core";

export interface SceneActions {
  addScene: () => void;
  setActiveSceneId: (id: string, loadFirst?: boolean) => void;
  renameScene: (id: string, name: string) => void;
  delScene: (id: string) => void;
  dupScene: (id: string) => void;
  moveScene: (id: string, dir: -1 | 1) => void;
  setSceneNotes: (id: string, notes: string) => void;
  toggleSceneCollapsed: (id: string) => void;
  toggleSceneNotesOpen: (id: string) => void;
}

export function useSceneActions(
  core: EditorCore,
  deps: {
    stopPlayback: () => void;
    commitHistory: (label?: string) => void;
    scheduleHistoryCommit: (label?: string, delay?: number) => void;
    loadFrame: (id: string) => void;
  }
): SceneActions {
  const { projectRef, playbackRef, currentFrameIdRef, bump } = core;
  const { stopPlayback, commitHistory, scheduleHistoryCommit, loadFrame } = deps;

  const addScene = useCallback(() => {
    stopPlayback();
    const sc = newScene(undefined, projectRef.current.scenes.length + 1);
    projectRef.current.scenes.push(sc);
    projectRef.current.activeSceneId = sc.id;
    commitHistory("Tambah scene");
    bump();
  }, [projectRef, stopPlayback, commitHistory, bump]);

  const setActiveSceneId = useCallback(
    (id: string, loadFirst = false) => {
      stopPlayback();
      projectRef.current.activeSceneId = id;
      playbackRef.current.idx = 0;
      if (loadFirst) {
        const sc = projectRef.current.scenes.find((s) => s.id === id);
        if (sc && sc.frames.length) {
          loadFrame(sc.frames[0].id);
          return;
        }
        currentFrameIdRef.current = null;
      }
      bump();
    },
    [projectRef, playbackRef, currentFrameIdRef, stopPlayback, loadFrame, bump]
  );

  const renameScene = useCallback(
    (id: string, name: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.name = name;
      scheduleHistoryCommit("Ganti nama scene");
      bump();
    },
    [projectRef, scheduleHistoryCommit, bump]
  );

  const delScene = useCallback(
    (id: string) => {
      stopPlayback();
      const p = projectRef.current;
      p.scenes = p.scenes.filter((s) => s.id !== id);
      if (!p.scenes.length) {
        const s = newScene("Scene 1");
        p.scenes.push(s);
      }
      if (!p.scenes.some((s) => s.id === p.activeSceneId)) p.activeSceneId = p.scenes[0].id;
      commitHistory("Hapus scene");
      bump();
    },
    [projectRef, stopPlayback, commitHistory, bump]
  );

  const dupScene = useCallback(
    (id: string) => {
      stopPlayback();
      const p = projectRef.current;
      const i = p.scenes.findIndex((s) => s.id === id);
      if (i < 0) return;
      const src = p.scenes[i];
      const copy: EditorScene = {
        ...deepCopy(src),
        id: uid(),
        name: src.name + " (copy)",
        frames: src.frames.map((f) => ({ ...deepCopy(f), id: uid() })),
      };
      p.scenes.splice(i + 1, 0, copy);
      p.activeSceneId = copy.id;
      commitHistory("Gandakan scene");
      bump();
    },
    [projectRef, stopPlayback, commitHistory, bump]
  );

  const moveScene = useCallback(
    (id: string, dir: -1 | 1) => {
      stopPlayback();
      const scenes = projectRef.current.scenes;
      const i = scenes.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= scenes.length) return;
      [scenes[i], scenes[j]] = [scenes[j], scenes[i]];
      commitHistory("Pindahkan scene");
      bump();
    },
    [projectRef, stopPlayback, commitHistory, bump]
  );

  const setSceneNotes = useCallback(
    (id: string, notes: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.notes = notes;
      scheduleHistoryCommit("Catatan scene");
      bump();
    },
    [projectRef, scheduleHistoryCommit, bump]
  );

  const toggleSceneCollapsed = useCallback(
    (id: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.collapsed = !sc.collapsed;
      bump();
    },
    [projectRef, bump]
  );
  const toggleSceneNotesOpen = useCallback(
    (id: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.notesOpen = !sc.notesOpen;
      bump();
    },
    [projectRef, bump]
  );

  return {
    addScene,
    setActiveSceneId,
    renameScene,
    delScene,
    dupScene,
    moveScene,
    setSceneNotes,
    toggleSceneCollapsed,
    toggleSceneNotesOpen,
  };
}
