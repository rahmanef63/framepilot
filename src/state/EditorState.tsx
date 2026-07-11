"use client";
// EditorState.tsx — the CAG Editor context (plan §4.3). Separate from AppState.
// Owns the v2 document, a mutable rig ref, ui/playback/history — all non-3D logic.
// The 3D engine is injected via a ref typed EditorEngineHandle (null before mount).
//
// This file is now a thin composition layer: the shared state + heartbeat live in
// editor/core.ts, and each action GROUP (history, playback, rig, ui, frames,
// scenes, io, brief) is a factory hook under editor/*. The public API —
// useEditor(), EditorStateProvider, EditorContextValue, EditorUi — is unchanged.

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { ViewId } from "@/components/editor/viewport/engineApi";
import { loadAutosave } from "@/lib/editorStorage";
import type { EditorProject } from "@/lib/editorModel";

import type { EditorContextValue } from "./editor/types";
import { useEditorCore } from "./editor/core";
import { useHistoryActions } from "./editor/history";
import { useBriefActions } from "./editor/brief";
import { usePlaybackActions } from "./editor/playback";
import { useRigActions } from "./editor/rig";
import { useUiActions } from "./editor/ui";
import { useFrameActions } from "./editor/frames";
import { useSceneActions } from "./editor/scenes";
import { useIoActions, swapProject } from "./editor/io";

// Re-export the value-shape types so consumers keep importing them from here.
export type { EditorContextValue, EditorUi, EditorPlayback } from "./editor/types";

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorStateProvider");
  return ctx;
}

// ============================================================
// Provider
// ============================================================
export function EditorStateProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: EditorProject;
}) {
  // shared refs + heartbeat + low-level helpers
  const core = useEditorCore(initial);
  const {
    projectRef,
    rigRef,
    uiRef,
    playbackRef,
    historyRef,
    currentFrameIdRef,
    draftMetaRef,
    engineRef,
    keysHeldRef,
    savedRef,
    autosaveOnRef,
    version,
    bump,
  } = core;

  // Forward ref breaks the history<->playback cycle: restoreHistory stops
  // playback, but playback is composed after history. Filled in below.
  const stopPlaybackRef = useRef<() => void>(() => {});

  // ---------- action groups (order matters: later groups consume earlier ones) ----------
  const { commitHistory, scheduleHistoryCommit, undo, redo } = useHistoryActions(core, stopPlaybackRef);

  const { setDraftMetaField, currentFrame, frameIsDirty } = useBriefActions(core);

  const {
    togglePlay,
    play,
    stopPlayback,
    nextFrame,
    prevFrame,
    setFrameDuration,
    setLoop,
    setSmooth,
    onPlaybackTick,
  } = usePlaybackActions(core, { currentFrame, scheduleHistoryCommit });
  stopPlaybackRef.current = stopPlayback;

  const {
    afterRigMutate,
    orbit,
    setFov,
    setRoll,
    setTargetY,
    setSubjRot,
    setSubjX,
    setSubjZ,
    setSubject,
    applyAnglePreset,
    applyShotPreset,
    applyLensPreset,
    focusOnSubject,
    resetRig,
    onRigChangedFromEngine,
  } = useRigActions(core, { stopPlayback, scheduleHistoryCommit });

  const {
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
  } = useUiActions(core, { afterRigMutate, commitHistory });

  const {
    addFrame,
    updateFrame,
    loadFrame,
    dupFrame,
    delFrame,
    moveFrame,
    renameFrame,
    setFrameNotes,
  } = useFrameActions(core, { stopPlayback, commitHistory, scheduleHistoryCommit, currentFrame });

  const {
    addScene,
    setActiveSceneId,
    renameScene,
    delScene,
    dupScene,
    moveScene,
    setSceneNotes,
    toggleSceneCollapsed,
    toggleSceneNotesOpen,
  } = useSceneActions(core, { stopPlayback, commitHistory, scheduleHistoryCommit, loadFrame });

  const {
    saveCurrentProject,
    newProjectAction,
    loadSavedProject,
    deleteSavedProject,
    refreshSaved,
    importProjectObject,
    exportProjectObject,
    importFromLibrary,
  } = useIoActions(core, { stopPlayback, commitHistory });

  // ---------- restore autosave on mount (concept: continue last session) ----------
  // React fires child effects before parent effects, so the viewport has already
  // registered the engine by the time this runs — setAspect/updateHud take effect.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const auto = loadAutosave();
    if (!auto) return;
    swapProject(core, auto, "Pulihkan autosave", commitHistory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- keyboard (concept ~1532-1564) ----------
  // Populates the shared keysHeld Set that the engine's rAF handleKeys() reads for
  // fly/orbit navigation, and dispatches the discrete shortcuts. typing() guards
  // form fields so shortcuts never fire while editing a brief.
  useEffect(() => {
    const typing = () => {
      const t = document.activeElement as HTMLElement | null;
      return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
    };
    const FLY = [
      "w", "a", "s", "d", "q", "e", "shift",
      "arrowup", "arrowdown", "arrowleft", "arrowright",
    ];
    const VIEW_KEYS: Record<string, ViewId> = {
      "1": "cam",
      "2": "top",
      "3": "left",
      "4": "right",
      "5": "iso",
    };
    const onDown = (e: KeyboardEvent) => {
      if (typing()) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && k === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (FLY.includes(k)) {
        keysHeldRef.current.add(k);
        e.preventDefault();
      }
      if (k === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (k === "f") focusOnSubject();
      if (k === "escape") setFocusView(null);
      if (k in VIEW_KEYS) {
        const v = VIEW_KEYS[k];
        setFocusView(uiRef.current.focusView === v ? null : v);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key.toLowerCase());
    };
    const onBlur = () => keysHeldRef.current.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [undo, redo, togglePlay, focusOnSubject, setFocusView, keysHeldRef, uiRef]);

  // ---------- value ----------
  const value = useMemo<EditorContextValue>(
    () => ({
      project: projectRef.current,
      ui: uiRef.current,
      playback: playbackRef.current,
      currentFrameId: currentFrameIdRef.current,
      draftMeta: draftMetaRef.current,
      savedList: savedRef.current,
      autosaveOn: autosaveOnRef.current,
      canUndo: historyRef.current.index > 0,
      canRedo:
        historyRef.current.index >= 0 && historyRef.current.index < historyRef.current.entries.length - 1,

      registerEngine: (handle) => {
        engineRef.current = handle;
        if (handle) {
          handle.setRig(rigRef.current);
          handle.setSubject(rigRef.current.subj);
          handle.setThirds(uiRef.current.thirdsOn);
          handle.setFrustum(uiRef.current.frustumOn);
          handle.setDragMode(uiRef.current.dragToolMode);
          handle.setAspect(projectRef.current.settings.aspectRatio);
          handle.applyFocus(uiRef.current.focusView);
          handle.setActiveTab(uiRef.current.mainTab);
          handle.updateHud();
        }
      },
      keysHeld: keysHeldRef.current,

      rigRef,
      orbit,
      setFov,
      setRoll,
      setTargetY,
      setSubjRot,
      setSubjX,
      setSubjZ,
      setSubject,
      applyAnglePreset,
      applyShotPreset,
      applyLensPreset,
      focusOnSubject,
      resetRig,
      onRigChangedFromEngine,

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

      setDraftMetaField,
      frameIsDirty,
      currentFrame,

      addFrame,
      updateFrame,
      loadFrame,
      dupFrame,
      delFrame,
      moveFrame,
      renameFrame,
      setFrameNotes,

      addScene,
      setActiveSceneId,
      renameScene,
      delScene,
      dupScene,
      moveScene,
      setSceneNotes,
      toggleSceneCollapsed,
      toggleSceneNotesOpen,

      togglePlay,
      play,
      stopPlayback,
      nextFrame,
      prevFrame,
      setFrameDuration,
      setLoop,
      setSmooth,
      onPlaybackTick,

      saveCurrentProject,
      newProjectAction,
      loadSavedProject,
      deleteSavedProject,
      refreshSaved,

      importProjectObject,
      exportProjectObject,
      importFromLibrary,

      undo,
      redo,
      commitHistory,
      scheduleHistoryCommit,
    }),
    // `version` is the sole freshness trigger: every mutation bumps it, and all
    // actions/refs listed in the value are stable useCallbacks/refs, so re-reading
    // the snapshot on each version change is both necessary and sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
