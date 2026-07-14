// editor/types.ts — value-shape types for the Editor context.
// Split out of EditorState.tsx; the public EditorContextValue / EditorUi /
// EditorPlayback types are re-exported from "@/state/EditorState" unchanged.

import type { Meta } from "@/lib/dataPrompt";
import type { Project as AppProject } from "@/lib/dataPrompt";
import type { EditorProject, EditorFrame, RigState, SlotId, ViewKind } from "@/lib/editorModel";
import type {
  EditorEngineHandle,
  DragMode,
  FocusView,
  MainTab,
} from "@/lib/editor/engineApi";
import type { SavedEntry } from "@/lib/editorStorage";

export interface EditorUi {
  mainTab: MainTab;
  panelTab: "control" | "shot";
  dragToolMode: DragMode;
  focusView: FocusView;
  thirdsOn: boolean;
  frustumOn: boolean;
}

export interface EditorPlayback {
  playing: boolean;
  idx: number;
  t: number;
  duration: number;
  loop: boolean;
  smooth: boolean;
}

export interface HistoryEntry {
  json: string;
  label: string;
}
export interface HistoryState {
  entries: HistoryEntry[];
  index: number;
  busy: boolean;
  max: number;
}

export interface EditorContextValue {
  // reactive snapshots (re-read on bump)
  project: EditorProject;
  ui: EditorUi;
  playback: EditorPlayback;
  currentFrameId: string | null;
  draftMeta: Meta;
  savedList: SavedEntry[];
  autosaveOn: boolean;
  canUndo: boolean;
  canRedo: boolean;

  // engine registration (called by EditorViewport on mount)
  registerEngine: (handle: EditorEngineHandle | null) => void;
  keysHeld: Set<string>;

  // rig / presets
  rigRef: React.MutableRefObject<RigState>;
  orbit: (az: number, el: number, dist: number) => void;
  setFov: (v: number) => void;
  setRoll: (v: number) => void;
  setTargetY: (v: number) => void;
  setCamPos: (axis: "x" | "y" | "z", v: number) => void;
  setTarget: (axis: "x" | "y" | "z", v: number) => void;
  setSubjRot: (v: number) => void;
  setSubjX: (v: number) => void;
  setSubjZ: (v: number) => void;
  setSubject: (subj: "person" | "object") => void;
  applyAnglePreset: (el: number, roll: number) => void;
  applyShotPreset: (r: number) => void;
  applyLensPreset: (mm: number) => void;
  focusOnSubject: () => void;
  resetRig: () => void;
  onRigChangedFromEngine: () => void;

  // toggles / ui
  setMainTab: (t: MainTab) => void;
  setPanelTab: (t: EditorUi["panelTab"]) => void;
  setDragMode: (m: DragMode) => void;
  setFocusView: (v: FocusView) => void;
  toggleThirds: () => void;
  toggleFrustum: () => void;
  toggleTrackSubject: () => void;

  // reconfigurable quad (Goal B)
  addSavedView: (name?: string) => void;
  renameSavedView: (id: string, name: string) => void;
  deleteSavedView: (id: string) => void;
  setCellView: (slot: SlotId, kind: ViewKind) => void;

  // output frame
  setAspect: (a: string) => void;
  setFps: (n: number) => void;
  setProjectName: (name: string) => void;

  // data-shot brief
  setDraftMetaField: (k: keyof Meta, v: string | number) => void;
  frameIsDirty: (f: EditorFrame | null) => boolean;
  currentFrame: () => EditorFrame | null;

  // frame CRUD
  addFrame: () => void;
  updateFrame: () => void;
  loadFrame: (id: string) => void;
  dupFrame: (id: string) => void;
  delFrame: (id: string) => void;
  moveFrame: (id: string, dir: -1 | 1) => void;
  renameFrame: (id: string, name: string) => void;
  setFrameNotes: (id: string, notes: string) => void;

  // scene CRUD
  addScene: () => void;
  setActiveSceneId: (id: string, loadFirst?: boolean) => void;
  renameScene: (id: string, name: string) => void;
  delScene: (id: string) => void;
  dupScene: (id: string) => void;
  moveScene: (id: string, dir: -1 | 1) => void;
  setSceneNotes: (id: string, notes: string) => void;
  toggleSceneCollapsed: (id: string) => void;
  toggleSceneNotesOpen: (id: string) => void;

  // transport / playback
  togglePlay: () => void;
  play: () => void;
  stopPlayback: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  setFrameDuration: (v: number) => void;
  setLoop: (b: boolean) => void;
  setSmooth: (b: boolean) => void;
  onPlaybackTick: (idx: number, t: number, done: boolean) => void;

  // persistence
  saveCurrentProject: () => void;
  newProjectAction: () => void;
  loadSavedProject: (id: string) => void;
  deleteSavedProject: (id: string) => void;
  refreshSaved: () => void;

  // import / export / library interop
  importProjectObject: (obj: unknown) => void;
  exportProjectObject: () => EditorProject;
  importFromLibrary: (appProject: AppProject) => void;

  // history
  undo: () => void;
  redo: () => void;
  commitHistory: (label?: string) => void;
  scheduleHistoryCommit: (label?: string, delay?: number) => void;
}
