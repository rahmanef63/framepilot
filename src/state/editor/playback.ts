// editor/playback.ts — transport; the engine loop does the actual tween. Depends
// on currentFrame (brief) and scheduleHistoryCommit (history), passed in.

import { useCallback } from "react";
import {
  EditorFrame,
  RigSnapshot,
  defaultShotMeta,
  activeScene as findActiveScene,
  applyState,
  frameDuration,
  deepCopy,
} from "@/lib/editorModel";
import { clamp } from "@/lib/editorMath";
import type { EditorCore } from "./core";

export interface PlaybackActions {
  togglePlay: () => void;
  play: () => void;
  stopPlayback: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  setFrameDuration: (v: number) => void;
  setLoop: (b: boolean) => void;
  setSmooth: (b: boolean) => void;
  onPlaybackTick: (idx: number, t: number, done: boolean) => void;
}

export function usePlaybackActions(
  core: EditorCore,
  deps: {
    currentFrame: () => EditorFrame | null;
    scheduleHistoryCommit: (label?: string, delay?: number) => void;
  }
): PlaybackActions {
  const { projectRef, rigRef, playbackRef, currentFrameIdRef, draftMetaRef, engineRef, bump, syncRig } = core;
  const { currentFrame, scheduleHistoryCommit } = deps;

  const buildPlaybackFrames = useCallback((): { frames: RigSnapshot[]; durations: number[] } => {
    const sc = findActiveScene(projectRef.current);
    return {
      frames: sc.frames.map((f) => deepCopy(f.s)),
      durations: sc.frames.map((f) => frameDuration(f)),
    };
  }, [projectRef]);

  const stopPlayback = useCallback(() => {
    if (!playbackRef.current.playing) return;
    playbackRef.current.playing = false;
    engineRef.current?.setPlayback({ playing: false });
    bump();
  }, [playbackRef, engineRef, bump]);

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
  }, [buildPlaybackFrames, playbackRef, engineRef, bump]);

  const togglePlay = useCallback(() => {
    if (playbackRef.current.playing) stopPlayback();
    else play();
  }, [playbackRef, play, stopPlayback]);

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
    [projectRef, rigRef, playbackRef, currentFrameIdRef, draftMetaRef, engineRef, syncRig, bump]
  );

  const nextFrame = useCallback(() => {
    stopPlayback();
    gotoFrameIndex(playbackRef.current.idx + 1);
  }, [playbackRef, stopPlayback, gotoFrameIndex]);
  const prevFrame = useCallback(() => {
    stopPlayback();
    gotoFrameIndex(playbackRef.current.idx - 1);
  }, [playbackRef, stopPlayback, gotoFrameIndex]);

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
    [playbackRef, rigRef, engineRef, bump]
  );

  const setFrameDuration = useCallback(
    (v: number) => {
      const d = clamp(v, 0.5, 30);
      playbackRef.current.duration = d;
      const f = currentFrame();
      if (f) f.meta.duration = d;
      scheduleHistoryCommit("Durasi frame");
      bump();
    },
    [playbackRef, currentFrame, scheduleHistoryCommit, bump]
  );
  const setLoop = useCallback(
    (b: boolean) => {
      playbackRef.current.loop = b;
      bump();
    },
    [playbackRef, bump]
  );
  const setSmooth = useCallback(
    (b: boolean) => {
      playbackRef.current.smooth = b;
      bump();
    },
    [playbackRef, bump]
  );

  return {
    togglePlay,
    play,
    stopPlayback,
    nextFrame,
    prevFrame,
    setFrameDuration,
    setLoop,
    setSmooth,
    onPlaybackTick,
  };
}
