// editor/core.ts — the shared mutable state (refs), re-render heartbeat, and the
// three low-level helpers every action group leans on. Split out of
// EditorState.tsx; the provider wires the groups on top of this EditorCore.

import { useCallback, useRef, useState } from "react";
import type { Meta } from "@/lib/dataPrompt";
import {
  EditorProject,
  RigState,
  newProject,
  defaultRigState,
  defaultShotMeta,
  ensureProjectShape,
  deepCopy,
} from "@/lib/editorModel";
import type { EditorEngineHandle } from "@/components/editor/viewport/engineApi";
import { autosave, SavedEntry } from "@/lib/editorStorage";
import type { EditorUi, EditorPlayback, HistoryState } from "./types";

export interface EditorCore {
  // mutable refs (concept module-globals)
  projectRef: React.MutableRefObject<EditorProject>;
  rigRef: React.MutableRefObject<RigState>;
  uiRef: React.MutableRefObject<EditorUi>;
  playbackRef: React.MutableRefObject<EditorPlayback>;
  historyRef: React.MutableRefObject<HistoryState>;
  currentFrameIdRef: React.MutableRefObject<string | null>;
  draftMetaRef: React.MutableRefObject<Meta>;
  engineRef: React.MutableRefObject<EditorEngineHandle | null>;
  keysHeldRef: React.MutableRefObject<Set<string>>;
  savedRef: React.MutableRefObject<SavedEntry[]>;
  autosaveOnRef: React.MutableRefObject<boolean>;
  quotaWarnRef: React.MutableRefObject<boolean>;
  historyTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;

  // re-render heartbeat
  version: number;
  bump: () => void;

  // shared helpers
  syncRig: () => void;
  pushAutosave: () => void;
  markDirty: () => void;
}

export function useEditorCore(initial?: EditorProject): EditorCore {
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

  return {
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
    quotaWarnRef,
    historyTimerRef,
    version,
    bump,
    syncRig,
    pushAutosave,
    markDirty,
  };
}
