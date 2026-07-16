// editor/ui.ts — view toggles + the output-frame settings (aspect / fps / name).
// toggleTrackSubject reuses the rig group's afterRigMutate; the output-frame
// setters lean on pushAutosave + commitHistory.

import { useCallback } from "react";
import { tr } from "@/i18n";
import type { DragMode, FocusView, MainTab } from "@/lib/editor/engineApi";
import type { EditorCore } from "./core";
import type { EditorUi } from "./types";

export interface UiActions {
  setMainTab: (t: MainTab) => void;
  setPanelTab: (t: EditorUi["panelTab"]) => void;
  setDragMode: (m: DragMode) => void;
  setFocusView: (v: FocusView) => void;
  toggleThirds: () => void;
  toggleFrustum: () => void;
  toggleTrackSubject: () => void;
  setAspect: (a: string) => void;
  setFps: (n: number) => void;
  setProjectName: (name: string) => void;
  setProjectCamera: (id: string) => void;
  setGlobalCamera: (on: boolean) => void;
}

export function useUiActions(
  core: EditorCore,
  deps: {
    afterRigMutate: (label: string) => void;
    commitHistory: (label?: string) => void;
  }
): UiActions {
  const { projectRef, rigRef, uiRef, engineRef, bump, pushAutosave } = core;
  const { afterRigMutate, commitHistory } = deps;

  const setMainTab = useCallback(
    (t: MainTab) => {
      uiRef.current.mainTab = t;
      engineRef.current?.setActiveTab(t);
      // Preview forces the single POV; returning to Editor restores the tracked
      // quad/focus state so the engine's focusView never gets stuck on "cam".
      engineRef.current?.applyFocus(t === "preview" ? "cam" : uiRef.current.focusView);
      bump();
    },
    [uiRef, engineRef, bump]
  );
  const setPanelTab = useCallback(
    (t: EditorUi["panelTab"]) => {
      uiRef.current.panelTab = t;
      bump();
    },
    [uiRef, bump]
  );
  const setDragMode = useCallback(
    (m: DragMode) => {
      uiRef.current.dragToolMode = m;
      engineRef.current?.setDragMode(m);
      bump();
    },
    [uiRef, engineRef, bump]
  );
  const setFocusView = useCallback(
    (v: FocusView) => {
      uiRef.current.focusView = v;
      engineRef.current?.applyFocus(v);
      bump();
    },
    [uiRef, engineRef, bump]
  );
  const toggleThirds = useCallback(() => {
    // thirds overlay is React-driven (Hud reads ui.thirdsOn) — no engine seam.
    uiRef.current.thirdsOn = !uiRef.current.thirdsOn;
    bump();
  }, [uiRef, bump]);
  const toggleFrustum = useCallback(() => {
    uiRef.current.frustumOn = !uiRef.current.frustumOn;
    engineRef.current?.setFrustum(uiRef.current.frustumOn);
    bump();
  }, [uiRef, engineRef, bump]);
  const toggleTrackSubject = useCallback(() => {
    const rig = rigRef.current;
    rig.trackSubject = !rig.trackSubject;
    if (rig.trackSubject) {
      rig.target.x = rig.subjPos.x;
      rig.target.z = rig.subjPos.z;
    }
    afterRigMutate(tr("state.hist.targetLock"));
  }, [rigRef, afterRigMutate]);

  const setAspect = useCallback(
    (a: string) => {
      projectRef.current.settings.aspectRatio = a;
      engineRef.current?.setAspect(a);
      engineRef.current?.updateHud();
      pushAutosave();
      commitHistory(tr("state.hist.changeAspect"));
      bump();
    },
    [projectRef, engineRef, pushAutosave, commitHistory, bump]
  );
  const setFps = useCallback(
    (n: number) => {
      projectRef.current.settings.fps = n;
      engineRef.current?.updateHud();
      pushAutosave();
      commitHistory(tr("state.hist.changeFps"));
      bump();
    },
    [projectRef, engineRef, pushAutosave, commitHistory, bump]
  );
  const setProjectName = useCallback(
    (name: string) => {
      projectRef.current.name = name;
      pushAutosave();
      bump();
    },
    [projectRef, pushAutosave, bump]
  );
  // Camera is a prompt-only look tag — no engine call (unlike aspect/fps which move
  // the 3D frustum/HUD). setProjectCamera = the global camera id; setGlobalCamera =
  // the toggle deciding global-vs-per-frame.
  const setProjectCamera = useCallback(
    (id: string) => {
      projectRef.current.settings.camera = id;
      pushAutosave();
      commitHistory(tr("state.hist.globalCamera"));
      bump();
    },
    [projectRef, pushAutosave, commitHistory, bump]
  );
  const setGlobalCamera = useCallback(
    (on: boolean) => {
      projectRef.current.settings.globalCamera = on;
      pushAutosave();
      commitHistory(tr("state.hist.globalCameraMode"));
      bump();
    },
    [projectRef, pushAutosave, commitHistory, bump]
  );

  return {
    setMainTab,
    setPanelTab,
    setDragMode,
    setFocusView,
    toggleThirds,
    toggleFrustum,
    toggleTrackSubject,
    setAspect,
    setFps,
    setProjectName,
    setProjectCamera,
    setGlobalCamera,
  };
}
