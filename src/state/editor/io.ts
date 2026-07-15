// editor/io.ts — persistence (save/load/delete/list) + import/export/library
// interop. All the "swap out the whole project" paths reset history and re-seed
// the engine's aspect/HUD — see swapProject, the one place that block lives.

import { useCallback } from "react";
import type { Project as AppProject } from "@/lib/dataPrompt";
import { tr } from "@/i18n";
import {
  EditorProject,
  defaultRigState,
  defaultShotMeta,
  deepCopy,
  toEditorProject,
} from "@/lib/editorModel";
import type { SlotId } from "@/lib/editorModel";
import {
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
  newProjectStorage,
} from "@/lib/editorStorage";
import { EditorCore, newHistoryState } from "./core";

// Swap the whole document: point projectRef at `project`, clear the current
// frame + undo stack, re-seed the engine aspect/HUD, seed history, re-render.
// Shared by every load/import/new/hydrate path so the reset block lives once.
export function swapProject(
  core: EditorCore,
  project: EditorProject,
  label: string,
  commitHistory: (label?: string) => void
) {
  core.projectRef.current = project;
  core.currentFrameIdRef.current = null;
  core.historyRef.current = newHistoryState();
  core.engineRef.current?.setAspect(project.settings.aspectRatio);
  core.engineRef.current?.updateHud();
  // reconfigurable quad (Goal B): re-seed custom views + slot assignments so a
  // loaded/imported/new doc's quad renders its saved configuration.
  core.engineRef.current?.setSavedViews(project.savedViews ?? []);
  (["top", "left", "right"] as SlotId[]).forEach((s) =>
    core.engineRef.current?.setCellView(s, project.quadSlots?.[s] ?? s)
  );
  commitHistory(label);
  core.bump();
}

export interface IoActions {
  saveCurrentProject: () => void;
  newProjectAction: () => void;
  loadSavedProject: (id: string) => void;
  deleteSavedProject: (id: string) => void;
  refreshSaved: () => void;
  importProjectObject: (obj: unknown) => void;
  exportProjectObject: () => EditorProject;
  importFromLibrary: (appProject: AppProject) => void;
}

export function useIoActions(
  core: EditorCore,
  deps: {
    stopPlayback: () => void;
    commitHistory: (label?: string) => void;
  }
): IoActions {
  const { projectRef, rigRef, draftMetaRef, savedRef, autosaveOnRef, bump, syncRig } = core;
  const { stopPlayback, commitHistory } = deps;

  const refreshSaved = useCallback(() => {
    savedRef.current = listProjects();
    bump();
  }, [savedRef, bump]);

  const saveCurrentProject = useCallback(() => {
    const res = saveProject(projectRef.current);
    autosaveOnRef.current = res.ok;
    refreshSaved();
  }, [projectRef, autosaveOnRef, refreshSaved]);

  const newProjectAction = useCallback(() => {
    stopPlayback();
    rigRef.current = defaultRigState();
    draftMetaRef.current = defaultShotMeta();
    syncRig();
    swapProject(core, newProjectStorage(), tr("state.hist.newProject"), commitHistory);
  }, [core, rigRef, draftMetaRef, stopPlayback, syncRig, commitHistory]);

  const loadSavedProject = useCallback(
    (id: string) => {
      stopPlayback();
      const p = loadProject(id);
      if (!p) return;
      swapProject(core, p, tr("state.hist.loadProject"), commitHistory);
    },
    [core, stopPlayback, commitHistory]
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
      swapProject(core, toEditorProject(obj), tr("state.hist.importProject"), commitHistory);
    },
    [core, stopPlayback, commitHistory]
  );

  const exportProjectObject = useCallback((): EditorProject => deepCopy(projectRef.current), [projectRef]);
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
    importFromLibrary,
  };
}
