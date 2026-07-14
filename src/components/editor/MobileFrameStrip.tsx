"use client";
// MobileFrameStrip — the mobile-only ROW 1 of the editor (≤820). A horizontal-
// scrolling strip of frame thumbnails ("kotak frame") that REPLACES the drawer
// frame manager on phones: the leading ＋ tile captures the live camera as a new
// frame (ctx.addFrame), tapping a thumbnail jumps the 3D canvas to that shot
// (ctx.loadFrame — applies the frame's rig to the engine), and the pinned ▶
// toggles sequence playback. Hidden on desktop via CSS (.mobile-frame-strip{
// display:none}); there the sidebar <OutlineSidebar/> owns frames. Lives inside
// EditorStateProvider (rendered by EditorScreen), so useEditor() works directly.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { activeScene } from "@/lib/editorModel";
import { IconPlay, IconPause, IconPlus } from "./EditorIcons";

export function MobileFrameStrip() {
  const ctx = useEditor();
  const frames = activeScene(ctx.project).frames;
  const currentId = ctx.currentFrameId;
  const playing = ctx.playback.playing;

  return (
    <div
      className="mobile-frame-strip"
      role="group"
      aria-label="Frame — ketuk untuk pindah kamera, atau buat baru"
    >
      <button
        className="mfs-play"
        onClick={ctx.togglePlay}
        aria-label={playing ? "Jeda urutan frame" : "Putar urutan frame"}
        title="Putar / jeda urutan frame"
      >
        {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
      </button>
      <div className="mfs-scroll">
        {frames.map((f, i) => (
          <button
            key={f.id}
            className={"mfs-tile" + (f.id === currentId ? " current" : "")}
            onClick={() => ctx.loadFrame(f.id)}
            title={f.name}
            aria-label={"Pindah ke " + f.name}
            aria-current={f.id === currentId}
          >
            {f.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.thumb} alt="" />
            ) : (
              <span className="mfs-ph" aria-hidden>
                ▦
              </span>
            )}
            <span className="mfs-idx">#{i + 1}</span>
          </button>
        ))}
      </div>
      <button
        className="mfs-add"
        onClick={() => ctx.addFrame()}
        aria-label="Tangkap frame dari kamera saat ini"
        title="Tangkap frame dari kamera saat ini → frame baru"
      >
        <IconPlus size={20} />
        <span>Frame</span>
      </button>
    </div>
  );
}

export default MobileFrameStrip;
