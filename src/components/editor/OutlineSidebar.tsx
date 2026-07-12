"use client";
// OutlineSidebar.tsx — the single scene + frame manager. A sticky action/transport
// strip (icon buttons — Add Frame, Update, Prev/Play/Next/Stop, Loop, Transition,
// Duration) over a self-scrolling body that hosts the <OutlineTree/> (scene→frame
// hierarchy). It PORTALS into the app Shell sidebar (#fp-studio-slot, below the
// nav) — so it lives in the main sidebar while its source stays inside
// EditorStateProvider (useEditor works). The portal root carries `cag-editor` so
// every `.cag-editor .*` scoped style still resolves outside the editor subtree.

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "@/state/EditorState";
import { Button } from "@/components/ds/Button";
import { OutlineTree } from "./panel/OutlineTree";
import {
  IconPlus,
  IconUpdate,
  IconPrev,
  IconPlay,
  IconPause,
  IconNext,
  IconStop,
  IconLoop,
  IconTransition,
} from "./EditorIcons";

export function OutlineSidebar() {
  const ctx = useEditor();
  const { project, playback } = ctx;

  // Target the Shell sidebar slot after mount (it renders before the editor).
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(document.getElementById("fp-studio-slot"));
  }, []);

  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0];
  const frames = scene?.frames ?? [];
  const total = frames.length;
  const cur = total ? Math.min(playback.idx + 1, total) : 0;
  const name = total ? frames[Math.min(playback.idx, total - 1)]?.name || "" : "";
  const ind = total ? `${cur}/${total} · ${name}` : "—";

  const current = ctx.currentFrame();
  const dirty = ctx.frameIsDirty(current);

  const content = (
    <aside className="outline-side" aria-label="Manajemen scene & frame">
      <div className="os-top">
        <div className="os-actions">
          <Button
            variant="primary"
            size="sm"
            title="Tambah frame dari kamera saat ini"
            onClick={ctx.addFrame}
            style={{ flex: "1 1 auto" }}
          >
            <span data-tour="add-frame" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <IconPlus size={14} /> Frame
            </span>
          </Button>
          <Button
            variant={current && dirty ? "primary" : "outline"}
            size="sm"
            disabled={!current}
            title={dirty ? "Terapkan kamera ke frame terpilih" : "Frame tersimpan"}
            onClick={ctx.updateFrame}
          >
            <IconUpdate size={14} />
            {dirty ? " *" : ""}
          </Button>
          {/* duration lives on the action row so the transport row below stays a
              single clean line of icons (was wrapping to 4 rows in the sidebar). */}
          <label className="os-dur" title="Durasi per frame saat play">
            <input
              type="number"
              min={0.5}
              max={30}
              step={0.5}
              value={playback.duration}
              onChange={(e) => ctx.setFrameDuration(Number(e.target.value) || 0.5)}
            />
            s
          </label>
        </div>

        <div className="os-transport">
          <button className="os-ico" title="Frame sebelumnya" aria-label="Frame sebelumnya" onClick={ctx.prevFrame}>
            <IconPrev />
          </button>
          <button
            className="os-ico"
            title="Play / pause (Space)"
            aria-label={playback.playing ? "Pause" : "Play"}
            onClick={ctx.togglePlay}
          >
            {playback.playing ? <IconPause /> : <IconPlay />}
          </button>
          <button className="os-ico" title="Frame berikutnya" aria-label="Frame berikutnya" onClick={ctx.nextFrame}>
            <IconNext />
          </button>
          <button className="os-ico" title="Stop" aria-label="Stop" onClick={ctx.stopPlayback}>
            <IconStop />
          </button>
          <button
            className={"os-ico" + (playback.loop ? " on" : "")}
            title={"Loop: " + (playback.loop ? "ON" : "OFF")}
            aria-label={"Loop: " + (playback.loop ? "ON" : "OFF")}
            aria-pressed={playback.loop}
            onClick={() => ctx.setLoop(!playback.loop)}
          >
            <IconLoop />
          </button>
          <button
            className={"os-ico" + (playback.smooth ? " on" : "")}
            title={"Transisi: " + (playback.smooth ? "HALUS" : "CUT")}
            aria-label={"Transisi: " + (playback.smooth ? "halus" : "potong")}
            aria-pressed={playback.smooth}
            onClick={() => ctx.setSmooth(!playback.smooth)}
          >
            <IconTransition />
          </button>
          {/* playback status trails the icons on the same row (right-aligned,
              ellipsis) — keeps os-top to exactly two rows. */}
          <span className="os-ind">{ind}</span>
        </div>
      </div>

      <div className="os-scroll">
        <OutlineTree />
      </div>
    </aside>
  );

  // Portal into the Shell sidebar slot. The `cag-editor` class on the portal root
  // re-establishes the editor's local CSS-var aliases + scoped selectors so the
  // tree/transport styles resolve even though the DOM now lives under .fp-sidebar.
  if (!slot) return null;
  return createPortal(<div className="cag-editor fp-outline-portal">{content}</div>, slot);
}

export default OutlineSidebar;
