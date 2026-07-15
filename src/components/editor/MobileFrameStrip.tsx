"use client";
// MobileFrameStrip — the mobile-only ROW 1 of the editor (≤820). A SCENE ↔ FRAME
// hierarchy of enterable "folders": at the top level it shows SCENE tiles (each a
// stacked-cards group with a count badge + per-scene ▶ when it holds >1 frame =
// "video"); tapping a scene ENTERS it, revealing its FRAME thumbnails ("kotak
// frame"). Inside a scene: a ‹ back button + crumb + the ▶ playback toggle + the
// horizontal frame strip. Tapping a frame jumps the 3D canvas to that shot
// (ctx.loadFrame); a LONG-PRESS opens <MobileFrameMenu/> (rename/duplicate/move/
// delete). Creating a frame lives in the bottom dock's center ＋ (EditorDock).
// Hidden on desktop via CSS (.mobile-frame-strip{display:none}); there the sidebar
// <OutlineSidebar/> owns scenes/frames. Lives inside EditorStateProvider, so
// useEditor() works directly.

import React, { useRef, useState } from "react";
import { LayoutGrid, Film, Layers, ChevronLeft } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { activeScene, type EditorFrame } from "@/lib/editorModel";
import { IconPlay, IconPause } from "./EditorIcons";
import { MobileFrameMenu } from "./MobileFrameMenu";
import { MobileSceneMenu } from "./MobileSceneMenu";

const LONG_PRESS_MS = 450;

export function MobileFrameStrip() {
  const ctx = useEditor();
  const scenes = ctx.project.scenes;
  const currentId = ctx.currentFrameId;
  const playing = ctx.playback.playing;
  const activeId = activeScene(ctx.project).id;

  // null = SCENE mode (folder list); a scene id = FRAME mode (inside that scene).
  // A lone scene starts opened — there is no meaningful folder list to show.
  const [insideId, setInsideId] = useState<string | null>(() => (scenes.length === 1 ? scenes[0].id : null));
  const inside = insideId ? scenes.find((s) => s.id === insideId) ?? null : null;

  const [menu, setMenu] = useState<{ frame: EditorFrame; index: number; rect: DOMRect } | null>(null);
  const [sceneMenu, setSceneMenu] = useState<{ scene: (typeof scenes)[number]; index: number; rect: DOMRect } | null>(null);
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
  const onSceneDown = (e: React.PointerEvent, scene: (typeof scenes)[number], index: number) => {
    longPressed.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    const rect = e.currentTarget.getBoundingClientRect();
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      navigator.vibrate?.(10);
      setSceneMenu({ scene, index, rect });
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

  const enterScene = (id: string) => {
    ctx.stopPlayback();
    ctx.setActiveSceneId(id);
    setInsideId(id);
  };
  const exitScene = () => setInsideId(null);
  const playScene = (id: string) => {
    const wasActive = id === activeId;
    ctx.setActiveSceneId(id);
    if (wasActive && playing) ctx.stopPlayback();
    else ctx.play();
  };

  // ---- SCENE mode: enterable folder tiles ----
  if (!inside) {
    return (
      <div className="mobile-frame-strip" role="group" aria-label="Scene — ketuk untuk buka, tahan scene untuk aksi">
        <div className="mfs-scroll">
          {scenes.map((sc, idx) => (
            <div key={sc.id} className={"mfs-scene" + (sc.id === activeId ? " current" : "")}>
              <button
                className="mfs-scene-open"
                onPointerDown={(e) => onSceneDown(e, sc, idx)}
                onPointerMove={onMove}
                onPointerUp={cancelTimer}
                onPointerLeave={cancelTimer}
                onClick={(e) => {
                  if (longPressed.current) {
                    e.preventDefault();
                    longPressed.current = false;
                    return;
                  }
                  enterScene(sc.id);
                }}
                title={sc.name + " — tahan untuk aksi"}
                aria-label={"Buka scene " + sc.name}
              >
                {sc.frames[0]?.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sc.frames[0].thumb} alt="" />
                ) : (
                  <span className="mfs-ph" aria-hidden>
                    <Film size={18} />
                  </span>
                )}
                <span className="mfs-scene-badge">
                  <Layers size={11} aria-hidden /> {sc.frames.length}
                </span>
                <span className="mfs-scene-name">{sc.name}</span>
              </button>
              {sc.frames.length > 1 ? (
                <button
                  className="mfs-scene-play"
                  onClick={() => playScene(sc.id)}
                  aria-label={"Putar scene " + sc.name}
                  title="Putar / preview scene"
                >
                  {playing && sc.id === activeId ? <IconPause size={14} /> : <IconPlay size={14} />}
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {sceneMenu ? (
          <MobileSceneMenu
            scene={sceneMenu.scene}
            index={sceneMenu.index}
            total={scenes.length}
            rect={sceneMenu.rect}
            onClose={() => setSceneMenu(null)}
          />
        ) : null}
      </div>
    );
  }

  // ---- FRAME mode: inside a scene ----
  return (
    <div className="mobile-frame-strip" role="group" aria-label="Frame — ketuk untuk pindah, tahan untuk aksi">
      <button
        className="mfs-back"
        onClick={exitScene}
        aria-label="Kembali ke daftar scene"
        title="Keluar dari scene"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="mfs-crumb" title={inside.name}>
        {inside.name}
      </span>
      <button
        className="mfs-play"
        onClick={ctx.togglePlay}
        aria-label={playing ? "Jeda urutan frame" : "Putar urutan frame"}
        title="Putar / jeda urutan frame"
      >
        {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
      </button>
      <div className="mfs-scroll">
        {inside.frames.map((f, i) => (
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
          total={inside.frames.length}
          rect={menu.rect}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  );
}
