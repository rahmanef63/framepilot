// editor/io.ts — persistence (save/load/delete/list) + import/export/library
// interop. All the "swap out the whole project" paths reset history and re-seed
// the engine's aspect/HUD.

import { useCallback } from "react";
import type { Project as AppProject } from "@/lib/dataPrompt";
import {
  EditorProject,
  defaultRigState,
  defaultShotMeta,
  deepCopy,
  toEditorProject,
  toAppProject,
} from "@/lib/editorModel";
import {
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
  newProjectStorage,
} from "@/lib/editorStorage";
import type { EditorCore } from "./core";

export interface IoActions {
  saveCurrentProject: () => void;
  newProjectAction: () => void;
  loadSavedProject: (id: string) => void;
  deleteSavedProject: (id: string) => void;
  refreshSaved: () => void;
  importProjectObject: (obj: unknown) => void;
  exportProjectObject: () => EditorProject;
  toAppProjectNow: () => AppProject;
  importFromLibrary: (appProject: AppProject) => void;
}

export function useIoActions(
  core: EditorCore,
  deps: {
    stopPlayback: () => void;
    commitHistory: (label?: string) => void;
  }
): IoActions {
  const {
    projectRef,
    rigRef,
    historyRef,
    currentFrameIdRef,
    draftMetaRef,
    engineRef,
    savedRef,
    autosaveOnRef,
    quotaWarnRef,
    bump,
    syncRig,
  } = core;
  const { stopPlayback, commitHistory } = deps;

  const refreshSaved = useCallback(() => {
    savedRef.current = listProjects();
    bump();
  }, [savedRef, bump]);

  const saveCurrentProject = useCallback(() => {
    const res = saveProject(projectRef.current);
    quotaWarnRef.current = res.quota;
    autosaveOnRef.current = res.ok;
    refreshSaved();
  }, [projectRef, quotaWarnRef, autosaveOnRef, refreshSaved]);

  const newProjectAction = useCallback(() => {
    stopPlayback();
    projectRef.current = newProjectStorage();
    rigRef.current = defaultRigState();
    currentFrameIdRef.current = null;
    draftMetaRef.current = defaultShotMeta();
    historyRef.current = { entries: [], index: -1, busy: false, max: 30 };
    syncRig();
    engineRef.current?.setAspect(projectRef.current.settings.aspectRatio);
    engineRef.current?.updateHud();
    commitHistory("Proyek baru");
    bump();
  }, [projectRef, rigRef, currentFrameIdRef, draftMetaRef, historyRef, engineRef, stopPlayback, syncRig, commitHistory, bump]);

  const loadSavedProject = useCallback(
    (id: string) => {
      stopPlayback();
      const p = loadProject(id);
      if (!p) return;
      projectRef.current = p;
      currentFrameIdRef.current = null;
      historyRef.current = { entries: [], index: -1, busy: false, max: 30 };
      engineRef.current?.setAspect(p.settings.aspectRatio);
      engineRef.current?.updateHud();
      commitHistory("Muat proyek");
      bump();
    },
    [projectRef, currentFrameIdRef, historyRef, engineRef, stopPlayback, commitHistory, bump]
  );

  const deleteSavedProject = useCallback(
    (id: string) => {
      deleteProject(id);
      refreshSaved();
    },
    [refreshSaved]
  );

  const importProjectObject = useCallback(
    (obj: unknown) => {
      stopPlayback();
      projectRef.current = toEditorProject(obj);
      currentFrameIdRef.current = null;
      historyRef.current = { entries: [], index: -1, busy: false, max: 30 };
      engineRef.current?.setAspect(projectRef.current.settings.aspectRatio);
      engineRef.current?.updateHud();
      commitHistory("Impor proyek");
      bump();
    },
    [projectRef, currentFrameIdRef, historyRef, engineRef, stopPlayback, commitHistory, bump]
  );

  const exportProjectObject = useCallback((): EditorProject => deepCopy(projectRef.current), [projectRef]);
  const toAppProjectNow = useCallback((): AppProject => toAppProject(projectRef.current), [projectRef]);
  const importFromLibrary = useCallback(
    (appProject: AppProject) => {
      importProjectObject(appProject);
    },
    [importProjectObject]
  );

  return {
    saveCurrentProject,
    newProjectAction,
    loadSavedProject,
    deleteSavedProject,
    refreshSaved,
    importProjectObject,
    exportProjectObject,
    toAppProjectNow,
    importFromLibrary,
  };
}
