// editor/history.ts — undo/redo ring buffer + commit/schedule (concept ~1043-1075).
// restoreHistory stops playback via a forward ref to break the history<->playback
// cycle, exactly as the original monolith did.

import { useCallback } from "react";
import { ensureProjectShape } from "@/lib/editorModel";
import { tr } from "@/i18n";
import type { EditorCore } from "./core";

export interface HistoryActions {
  commitHistory: (label?: string) => void;
  scheduleHistoryCommit: (label?: string, delay?: number) => void;
  undo: () => void;
  redo: () => void;
}

export function useHistoryActions(
  core: EditorCore,
  stopPlaybackRef: React.MutableRefObject<() => void>
): HistoryActions {
  const {
    projectRef,
    rigRef,
    playbackRef,
    historyRef,
    currentFrameIdRef,
    engineRef,
    historyTimerRef,
    bump,
    syncRig,
    pushAutosave,
  } = core;

  const historyPayload = useCallback((): string => {
    return JSON.stringify({
      project: projectRef.current,
      state: rigRef.current,
      currentFrameId: currentFrameIdRef.current,
      duration: playbackRef.current.duration,
      smooth: playbackRef.current.smooth,
    });
  }, [projectRef, rigRef, currentFrameIdRef, playbackRef]);

  const commitHistory = useCallback(
    (label = tr("state.hist.change")) => {
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
    [historyRef, historyPayload, pushAutosave, bump]
  );

  const scheduleHistoryCommit = useCallback(
    (label = tr("state.hist.change"), delay = 280) => {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      historyTimerRef.current = setTimeout(() => commitHistory(label), delay);
    },
    [historyTimerRef, commitHistory]
  );

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
    [historyRef, stopPlaybackRef, projectRef, rigRef, currentFrameIdRef, playbackRef, engineRef, syncRig, bump]
  );

  const undo = useCallback(() => {
    if (historyRef.current.index > 0) restoreHistory(historyRef.current.index - 1);
  }, [historyRef, restoreHistory]);
  const redo = useCallback(() => {
    if (historyRef.current.index < historyRef.current.entries.length - 1)
      restoreHistory(historyRef.current.index + 1);
  }, [historyRef, restoreHistory]);

  return { commitHistory, scheduleHistoryCommit, undo, redo };
}
