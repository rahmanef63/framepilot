"use client";
// MobileFrameStrip — the mobile-only ROW 1 of the editor (≤820). A horizontal-
// scrolling strip of frame thumbnails ("kotak frame") that REPLACES the drawer
// frame manager on phones: tapping a thumbnail jumps the 3D canvas to that shot
// (ctx.loadFrame), a LONG-PRESS opens <MobileFrameMenu/> (rename/duplicate/move/
// delete), and the pinned ▶ (left) toggles sequence playback. Creating a frame
// moved to the bottom dock's center ＋ (EditorDock). Hidden on desktop via CSS
// (.mobile-frame-strip{display:none}); there the sidebar <OutlineSidebar/> owns
// frames. Lives inside EditorStateProvider, so useEditor() works directly.

import React, { useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { activeScene, type EditorFrame } from "@/lib/editorModel";
import { IconPlay, IconPause } from "./EditorIcons";
import { MobileFrameMenu } from "./MobileFrameMenu";

const LONG_PRESS_MS = 450;

export function MobileFrameStrip() {
  const ctx = useEditor();
  const frames = activeScene(ctx.project).frames;
  const currentId = ctx.currentFrameId;
  const playing = ctx.playback.playing;

  const [menu, setMenu] = useState<{ frame: EditorFrame; index: number; rect: DOMRect } | null>(null);
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const cancelTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const onDown = (e: React.PointerEvent, frame: EditorFrame, index: number) => {
    longPressed.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    const rect = e.currentTarget.getBoundingClientRect();
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      navigator.vibrate?.(10);
      setMenu({ frame, index, rect });
    }, LONG_PRESS_MS);
  };
  const onMove = (e: React.PointerEvent) => {
    if (timer.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) cancelTimer();
  };
  const onClickTile = (e: React.MouseEvent, id: string) => {
    if (longPressed.current) {
      e.preventDefault();
      longPressed.current = false;
      return; // long-press already opened the menu — don't also load the frame
    }
    ctx.loadFrame(id);
  };

  return (
    <div className="mobile-frame-strip" role="group" aria-label="Frame — ketuk untuk pindah, tahan untuk aksi">
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
            onPointerDown={(e) => onDown(e, f, i)}
            onPointerMove={onMove}
            onPointerUp={cancelTimer}
            onPointerLeave={cancelTimer}
            onClick={(e) => onClickTile(e, f.id)}
            title={f.name + " — tahan untuk aksi"}
            aria-label={"Pindah ke " + f.name}
            aria-current={f.id === currentId}
          >
            {f.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.thumb} alt="" />
            ) : (
              <span className="mfs-ph" aria-hidden>
                <LayoutGrid size={18} />
              </span>
            )}
            <span className="mfs-idx">#{i + 1}</span>
          </button>
        ))}
      </div>
      {menu ? (
        <MobileFrameMenu
          frame={menu.frame}
          index={menu.index}
          total={frames.length}
          rect={menu.rect}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  );
}
