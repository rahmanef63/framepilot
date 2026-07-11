"use client";
// EditorState.tsx — the CAG Editor context (plan §4.3). Separate from AppState.
// Owns the v2 document, a mutable rig ref, ui/playback/history — all non-3D logic.
// The 3D engine is injected via a ref typed EditorEngineHandle (null before mount).

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Meta, uid } from "@/lib/dataPrompt";
import {
  EditorProject,
  EditorFrame,
  EditorScene,
  RigState,
  RigSnapshot,
  newProject,
  newScene,
  defaultRigState,
  defaultShotMeta,
  ensureProjectShape,
  activeScene as findActiveScene,
  snapState,
  applyState,
  frameDuration,
  deepCopy,
  toEditorProject,
  toAppProject,
} from "@/lib/editorModel";
import {
  getOrbit,
  setOrbit,
  angleLabel,
  shotLabel,
  focalLength,
  subjHeight,
  shotDistance,
  fovFromFocal,
  clamp,
} from "@/lib/editorMath";
import type { Project as AppProject } from "@/lib/dataPrompt";
import type {
  EditorEngineHandle,
  DragMode,
  FocusView,
  MainTab,
  ViewId,
} from "@/components/editor/viewport/engineApi";
import {
  autosave,
  loadAutosave,
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
  newProjectStorage,
  SavedEntry,
} from "@/lib/editorStorage";

// ============================================================
// Value-shape types
// ============================================================
export interface EditorUi {
  mainTab: MainTab;
  panelTab: "control" | "shot" | "outline";
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

interface HistoryEntry {
  json: string;
  label: string;
}
interface HistoryState {
  entries: HistoryEntry[];
  index: number;
  busy: boolean;
  max: number;
}

export interface EditorContextValue {
  // reactive snapshots (re-read on bump)
  version: number;
  project: EditorProject;
  ui: EditorUi;
  playback: EditorPlayback;
  currentFrameId: string | null;
  draftMeta: Meta;
  savedList: SavedEntry[];
  autosaveOn: boolean;
  quotaWarn: boolean;
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
  toAppProjectNow: () => AppProject;
  importFromLibrary: (appProject: AppProject) => void;

  // history
  undo: () => void;
  redo: () => void;
  commitHistory: (label?: string) => void;
  scheduleHistoryCommit: (label?: string, delay?: number) => void;
}

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
  // --- mutable refs (concept module-globals) ---
  const projectRef = useRef<EditorProject>(initial ? ensureProjectShape(deepCopy(initial)) : newProject());
  const rigRef = useRef<RigState>(defaultRigState());
  const uiRef = useRef<EditorUi>({
    mainTab: "editor",
    panelTab: "control",
    dragToolMode: "nav",
    focusView: null,
    thirdsOn: true,
    frustumOn: true,
  });
  const playbackRef = useRef<EditorPlayback>({
    playing: false,
    idx: 0,
    t: 0,
    duration: 2,
    loop: false,
    smooth: true,
  });
  const historyRef = useRef<HistoryState>({ entries: [], index: -1, busy: false, max: 30 });
  const currentFrameIdRef = useRef<string | null>(null);
  const draftMetaRef = useRef<Meta>(defaultShotMeta());
  const engineRef = useRef<EditorEngineHandle | null>(null);
  const keysHeldRef = useRef<Set<string>>(new Set());
  const savedRef = useRef<SavedEntry[]>([]);
  const autosaveOnRef = useRef(false);
  const quotaWarnRef = useRef(false);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- re-render heartbeat ---
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => (v + 1) % 1_000_000), []);

  // ---------- internal helpers ----------
  const syncRig = useCallback(() => {
    engineRef.current?.setRig(rigRef.current);
  }, []);

  const pushAutosave = useCallback(() => {
    autosave(projectRef.current, (res) => {
      autosaveOnRef.current = res.ok;
      quotaWarnRef.current = res.quota;
      bump();
    });
  }, [bump]);

  const markDirty = useCallback(() => {
    bump();
  }, [bump]);

  // ---------- history (concept ~1043-1075) ----------
  const historyPayload = useCallback((): string => {
    return JSON.stringify({
      project: projectRef.current,
      state: rigRef.current,
      currentFrameId: currentFrameIdRef.current,
      duration: playbackRef.current.duration,
      smooth: playbackRef.current.smooth,
    });
  }, []);

  const commitHistory = useCallback(
    (label = "Perubahan") => {
      const h = historyRef.current;
      if (h.busy) return;
      const json = historyPayload();
      if (h.entries[h.index]?.json === json) return;
      h.entries = h.entries.slice(0, h.index + 1);
      h.entries.push({ json, label });
      if (h.entries.length > h.max) h.entries.shift();
      h.index = h.entries.length - 1;
      pushAutosave();
      bump();
    },
    [historyPayload, pushAutosave, bump]
  );

  const scheduleHistoryCommit = useCallback(
    (label = "Perubahan", delay = 280) => {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      historyTimerRef.current = setTimeout(() => commitHistory(label), delay);
    },
    [commitHistory]
  );

  // forward declaration handles (defined below via refs to avoid cycles)
  const stopPlaybackRef = useRef<() => void>(() => {});

  const restoreHistory = useCallback(
    (nextIndex: number) => {
      const entry = historyRef.current.entries[nextIndex];
      if (!entry) return;
      historyRef.current.busy = true;
      stopPlaybackRef.current();
      const data = JSON.parse(entry.json);
      projectRef.current = ensureProjectShape(data.project);
      Object.assign(rigRef.current, data.state || {});
      currentFrameIdRef.current = data.currentFrameId || null;
      playbackRef.current.duration = data.duration || 2;
      playbackRef.current.smooth = data.smooth !== false;
      playbackRef.current.idx = 0;
      historyRef.current.index = nextIndex;
      syncRig();
      engineRef.current?.setAspect(projectRef.current.settings.aspectRatio);
      engineRef.current?.updateHud();
      historyRef.current.busy = false;
      bump();
    },
    [syncRig, bump]
  );

  const undo = useCallback(() => {
    if (historyRef.current.index > 0) restoreHistory(historyRef.current.index - 1);
  }, [restoreHistory]);
  const redo = useCallback(() => {
    if (historyRef.current.index < historyRef.current.entries.length - 1)
      restoreHistory(historyRef.current.index + 1);
  }, [restoreHistory]);

  // ---------- playback (transport; engine loop does the tween) ----------
  const buildPlaybackFrames = useCallback((): { frames: RigSnapshot[]; durations: number[] } => {
    const sc = findActiveScene(projectRef.current);
    return {
      frames: sc.frames.map((f) => deepCopy(f.s)),
      durations: sc.frames.map((f) => frameDuration(f)),
    };
  }, []);

  const stopPlayback = useCallback(() => {
    if (!playbackRef.current.playing) return;
    playbackRef.current.playing = false;
    engineRef.current?.setPlayback({ playing: false });
    bump();
  }, [bump]);
  stopPlaybackRef.current = stopPlayback;

  const play = useCallback(() => {
    const { frames, durations } = buildPlaybackFrames();
    if (!frames.length) return;
    const pb = playbackRef.current;
    pb.playing = true;
    pb.t = 0;
    engineRef.current?.setPlayback({
      playing: true,
      idx: pb.idx,
      t: 0,
      loop: pb.loop,
      smooth: pb.smooth,
      frames,
      durations,
    });
    engineRef.current?.startLoop();
    bump();
  }, [buildPlaybackFrames, bump]);

  const togglePlay = useCallback(() => {
    if (playbackRef.current.playing) stopPlayback();
    else play();
  }, [play, stopPlayback]);

  const gotoFrameIndex = useCallback(
    (idx: number) => {
      const sc = findActiveScene(projectRef.current);
      if (!sc.frames.length) return;
      const i = ((idx % sc.frames.length) + sc.frames.length) % sc.frames.length;
      const f = sc.frames[i];
      playbackRef.current.idx = i;
      applyState(rigRef.current, f.s);
      currentFrameIdRef.current = f.id;
      draftMetaRef.current = { ...defaultShotMeta(), ...f.meta };
      syncRig();
      engineRef.current?.updateHud();
      bump();
    },
    [syncRig, bump]
  );

  const nextFrame = useCallback(() => {
    stopPlayback();
    gotoFrameIndex(playbackRef.current.idx + 1);
  }, [stopPlayback, gotoFrameIndex]);
  const prevFrame = useCallback(() => {
    stopPlayback();
    gotoFrameIndex(playbackRef.current.idx - 1);
  }, [stopPlayback, gotoFrameIndex]);

  const onPlaybackTick = useCallback(
    (idx: number, t: number, done: boolean) => {
      playbackRef.current.idx = idx;
      playbackRef.current.t = t;
      rigRef.current = engineRef.current ? engineRef.current.getRig() : rigRef.current;
      if (done && !playbackRef.current.loop) {
        playbackRef.current.playing = false;
      }
      bump();
    },
    [bump]
  );

  // ---------- rig / presets ----------
  const afterRigMutate = useCallback(
    (label: string) => {
      syncRig();
      engineRef.current?.updateHud();
      markDirty();
      scheduleHistoryCommit(label);
    },
    [syncRig, markDirty, scheduleHistoryCommit]
  );

  const orbit = useCallback(
    (az: number, el: number, dist: number) => {
      stopPlayback();
      const rig = rigRef.current;
      rig.camPos = setOrbit(az, el, dist, rig.target);
      afterRigMutate("Orbit");
    },
    [stopPlayback, afterRigMutate]
  );

  const setFov = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.fov = v;
      afterRigMutate("FOV");
    },
    [stopPlayback, afterRigMutate]
  );
  const setRoll = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.roll = v;
      afterRigMutate("Roll");
    },
    [stopPlayback, afterRigMutate]
  );
  const setTargetY = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.target.y = v;
      afterRigMutate("Target Y");
    },
    [stopPlayback, afterRigMutate]
  );
  const setSubjRot = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.subjRot = v;
      afterRigMutate("Rotasi subjek");
    },
    [stopPlayback, afterRigMutate]
  );
  const setSubjX = useCallback(
    (v: number) => {
      stopPlayback();
      const rig = rigRef.current;
      rig.subjPos.x = v;
      if (rig.trackSubject) rig.target.x = v;
      afterRigMutate("Posisi subjek");
    },
    [stopPlayback, afterRigMutate]
  );
  const setSubjZ = useCallback(
    (v: number) => {
      stopPlayback();
      const rig = rigRef.current;
      rig.subjPos.z = v;
      if (rig.trackSubject) rig.target.z = v;
      afterRigMutate("Posisi subjek");
    },
    [stopPlayback, afterRigMutate]
  );

  const setSubject = useCallback(
    (subj: "person" | "object") => {
      stopPlayback();
      const rig = rigRef.current;
      rig.subj = subj;
      rig.target.y = subj === "person" ? 1.35 : 1.0;
      engineRef.current?.setSubject(subj);
      afterRigMutate("Ganti subjek");
    },
    [stopPlayback, afterRigMutate]
  );

  const applyAnglePreset = useCallback(
    (el: number, roll: number) => {
      stopPlayback();
      const rig = rigRef.current;
      const o = getOrbit(rig.camPos, rig.target);
      rig.roll = roll;
      rig.camPos = setOrbit(o.az, el, o.dist, rig.target);
      afterRigMutate("Preset angle");
    },
    [stopPlayback, afterRigMutate]
  );

  const applyShotPreset = useCallback(
    (r: number) => {
      stopPlayback();
      const rig = rigRef.current;
      const o = getOrbit(rig.camPos, rig.target);
      const d = shotDistance(r, rig.fov, subjHeight(rig.subj));
      rig.camPos = setOrbit(o.az, o.el, d, rig.target);
      afterRigMutate("Preset shot size");
    },
    [stopPlayback, afterRigMutate]
  );

  const applyLensPreset = useCallback(
    (mm: number) => {
      stopPlayback();
      rigRef.current.fov = clamp(fovFromFocal(mm), 12, 100);
      afterRigMutate("Preset lensa");
    },
    [stopPlayback, afterRigMutate]
  );

  const focusOnSubject = useCallback(() => {
    stopPlayback();
    const rig = rigRef.current;
    const o = getOrbit(rig.camPos, rig.target);
    rig.target.x = rig.subjPos.x;
    rig.target.z = rig.subjPos.z;
    rig.camPos = setOrbit(o.az, o.el, o.dist, rig.target);
    afterRigMutate("Fokus ke subjek");
  }, [stopPlayback, afterRigMutate]);

  const resetRig = useCallback(() => {
    stopPlayback();
    const rig = rigRef.current;
    rig.subjPos = { x: 0, z: 0 };
    rig.subjRot = 0;
    rig.fov = 40;
    rig.roll = 0;
    rig.target = { x: 0, y: rig.subj === "person" ? 1.35 : 1.0, z: 0 };
    rig.camPos = setOrbit(30, 4, 3, rig.target);
    rig.trackSubject = false;
    afterRigMutate("Reset rig");
  }, [stopPlayback, afterRigMutate]);

  const onRigChangedFromEngine = useCallback(() => {
    rigRef.current = engineRef.current ? engineRef.current.getRig() : rigRef.current;
    markDirty();
    scheduleHistoryCommit("Gerakkan kamera");
  }, [markDirty, scheduleHistoryCommit]);

  // ---------- toggles / ui ----------
  const setMainTab = useCallback(
    (t: MainTab) => {
      uiRef.current.mainTab = t;
      engineRef.current?.setActiveTab(t);
      // Preview forces the single POV; returning to Editor restores the tracked
      // quad/focus state so the engine's focusView never gets stuck on "cam".
      engineRef.current?.applyFocus(t === "preview" ? "cam" : uiRef.current.focusView);
      bump();
    },
    [bump]
  );
  const setPanelTab = useCallback(
    (t: EditorUi["panelTab"]) => {
      uiRef.current.panelTab = t;
      bump();
    },
    [bump]
  );
  const setDragMode = useCallback(
    (m: DragMode) => {
      uiRef.current.dragToolMode = m;
      engineRef.current?.setDragMode(m);
      bump();
    },
    [bump]
  );
  const setFocusView = useCallback(
    (v: FocusView) => {
      uiRef.current.focusView = v;
      engineRef.current?.applyFocus(v);
      bump();
    },
    [bump]
  );
  const toggleThirds = useCallback(() => {
    uiRef.current.thirdsOn = !uiRef.current.thirdsOn;
    engineRef.current?.setThirds(uiRef.current.thirdsOn);
    bump();
  }, [bump]);
  const toggleFrustum = useCallback(() => {
    uiRef.current.frustumOn = !uiRef.current.frustumOn;
    engineRef.current?.setFrustum(uiRef.current.frustumOn);
    bump();
  }, [bump]);
  const toggleTrackSubject = useCallback(() => {
    const rig = rigRef.current;
    rig.trackSubject = !rig.trackSubject;
    if (rig.trackSubject) {
      rig.target.x = rig.subjPos.x;
      rig.target.z = rig.subjPos.z;
    }
    afterRigMutate("Target lock");
  }, [afterRigMutate]);

  // ---------- output frame ----------
  const setAspect = useCallback(
    (a: string) => {
      projectRef.current.settings.aspectRatio = a;
      engineRef.current?.setAspect(a);
      engineRef.current?.updateHud();
      pushAutosave();
      commitHistory("Ubah aspek");
      bump();
    },
    [pushAutosave, commitHistory, bump]
  );
  const setFps = useCallback(
    (n: number) => {
      projectRef.current.settings.fps = n;
      engineRef.current?.updateHud();
      pushAutosave();
      commitHistory("Ubah FPS");
      bump();
    },
    [pushAutosave, commitHistory, bump]
  );
  const setProjectName = useCallback(
    (name: string) => {
      projectRef.current.name = name;
      pushAutosave();
      bump();
    },
    [pushAutosave, bump]
  );

  // ---------- data-shot brief ----------
  const setDraftMetaField = useCallback(
    (k: keyof Meta, v: string | number) => {
      (draftMetaRef.current as unknown as Record<string, unknown>)[k] = v;
      bump();
    },
    [bump]
  );

  const currentFrame = useCallback((): EditorFrame | null => {
    const id = currentFrameIdRef.current;
    if (!id) return null;
    for (const sc of projectRef.current.scenes) {
      const f = sc.frames.find((x) => x.id === id);
      if (f) return f;
    }
    return null;
  }, []);

  const frameIsDirty = useCallback(
    (f: EditorFrame | null): boolean => {
      if (!f) return false;
      const liveS = JSON.stringify(snapState(rigRef.current));
      const savedS = JSON.stringify(f.s);
      if (liveS !== savedS) return true;
      const liveMeta = JSON.stringify({ ...defaultShotMeta(), ...draftMetaRef.current });
      const savedMeta = JSON.stringify({ ...defaultShotMeta(), ...f.meta });
      return liveMeta !== savedMeta;
    },
    []
  );

  // ---------- frame CRUD ----------
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
  }, []);

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
  }, [stopPlayback, captureFrameFields, commitHistory, bump]);

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
    [stopPlayback, syncRig, bump]
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
    [stopPlayback, commitHistory, bump]
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
    [stopPlayback, commitHistory, bump]
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
    [stopPlayback, commitHistory, bump]
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
    [scheduleHistoryCommit, bump]
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
    [scheduleHistoryCommit, bump]
  );

  // ---------- scene CRUD ----------
  const addScene = useCallback(() => {
    stopPlayback();
    const sc = newScene(undefined, projectRef.current.scenes.length + 1);
    projectRef.current.scenes.push(sc);
    projectRef.current.activeSceneId = sc.id;
    commitHistory("Tambah scene");
    bump();
  }, [stopPlayback, commitHistory, bump]);

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
    [stopPlayback, loadFrame, bump]
  );

  const renameScene = useCallback(
    (id: string, name: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.name = name;
      scheduleHistoryCommit("Ganti nama scene");
      bump();
    },
    [scheduleHistoryCommit, bump]
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
    [stopPlayback, commitHistory, bump]
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
    [stopPlayback, commitHistory, bump]
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
    [stopPlayback, commitHistory, bump]
  );

  const setSceneNotes = useCallback(
    (id: string, notes: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.notes = notes;
      scheduleHistoryCommit("Catatan scene");
      bump();
    },
    [scheduleHistoryCommit, bump]
  );

  const toggleSceneCollapsed = useCallback(
    (id: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.collapsed = !sc.collapsed;
      bump();
    },
    [bump]
  );
  const toggleSceneNotesOpen = useCallback(
    (id: string) => {
      const sc = projectRef.current.scenes.find((s) => s.id === id);
      if (!sc) return;
      sc.notesOpen = !sc.notesOpen;
      bump();
    },
    [bump]
  );

  // ---------- transport misc ----------
  const setFrameDuration = useCallback(
    (v: number) => {
      const d = clamp(v, 0.5, 30);
      playbackRef.current.duration = d;
      const f = currentFrame();
      if (f) f.meta.duration = d;
      scheduleHistoryCommit("Durasi frame");
      bump();
    },
    [currentFrame, scheduleHistoryCommit, bump]
  );
  const setLoop = useCallback(
    (b: boolean) => {
      playbackRef.current.loop = b;
      bump();
    },
    [bump]
  );
  const setSmooth = useCallback(
    (b: boolean) => {
      playbackRef.current.smooth = b;
      bump();
    },
    [bump]
  );

  // ---------- persistence ----------
  const refreshSaved = useCallback(() => {
    savedRef.current = listProjects();
    bump();
  }, [bump]);

  const saveCurrentProject = useCallback(() => {
    const res = saveProject(projectRef.current);
    quotaWarnRef.current = res.quota;
    autosaveOnRef.current = res.ok;
    refreshSaved();
  }, [refreshSaved]);

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
  }, [stopPlayback, syncRig, commitHistory, bump]);

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
    [stopPlayback, commitHistory, bump]
  );

  const deleteSavedProject = useCallback(
    (id: string) => {
      deleteProject(id);
      refreshSaved();
    },
    [refreshSaved]
  );

  // ---------- import / export / library interop ----------
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
    [stopPlayback, commitHistory, bump]
  );

  const exportProjectObject = useCallback((): EditorProject => deepCopy(projectRef.current), []);
  const toAppProjectNow = useCallback((): AppProject => toAppProject(projectRef.current), []);
  const importFromLibrary = useCallback(
    (appProject: AppProject) => {
      importProjectObject(appProject);
    },
    [importProjectObject]
  );

  // ---------- restore autosave on mount (concept: continue last session) ----------
  // React fires child effects before parent effects, so the viewport has already
  // registered the engine by the time this runs — setAspect/updateHud take effect.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const auto = loadAutosave();
    if (!auto) return;
    projectRef.current = auto;
    currentFrameIdRef.current = null;
    historyRef.current = { entries: [], index: -1, busy: false, max: 30 };
    engineRef.current?.setAspect(auto.settings.aspectRatio);
    engineRef.current?.updateHud();
    commitHistory("Pulihkan autosave");
    bump();
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
  }, [undo, redo, togglePlay, focusOnSubject, setFocusView]);

  // ---------- value ----------
  const value = useMemo<EditorContextValue>(
    () => ({
      version,
      project: projectRef.current,
      ui: uiRef.current,
      playback: playbackRef.current,
      currentFrameId: currentFrameIdRef.current,
      draftMeta: draftMetaRef.current,
      savedList: savedRef.current,
      autosaveOn: autosaveOnRef.current,
      quotaWarn: quotaWarnRef.current,
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
      toAppProjectNow,
      importFromLibrary,

      undo,
      redo,
      commitHistory,
      scheduleHistoryCommit,
    }),
    // version drives snapshot freshness; actions are stable useCallbacks.
    [
      version,
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
      toAppProjectNow,
      importFromLibrary,
      undo,
      redo,
      commitHistory,
      scheduleHistoryCommit,
    ]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
