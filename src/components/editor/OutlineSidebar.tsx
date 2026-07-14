"use client";
// OutlineSidebar.tsx — the single scene + frame manager. A sticky 3-row header —
// (1) CREATE: + Frame / + Scene, (2) PLAYBACK: prev·play·next nav trio + smaller
// stop/loop/transition options, (3) STATUS: current frame · duration · Terapkan —
// over a self-scrolling body hosting the <OutlineTree/> (scene→frame hierarchy).
// It PORTALS into the app Shell sidebar (#fp-studio-slot) so it lives in the main
// sidebar while its source stays inside EditorStateProvider (useEditor works). The
// portal root carries `cag-editor` so every `.cag-editor .*` scoped style resolves.

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
        {/* Row 1 — CREATE: the two "add" actions, co-located and clearly labelled
            (+ Frame = capture the current camera into the active scene; + Scene =
            start a new scene). This is the one place you add things. */}
        <div className="os-create">
          <Button
            variant="primary"
            size="sm"
            title="Tangkap frame dari kamera saat ini → masuk scene aktif"
            onClick={ctx.addFrame}
            style={{ flex: "1 1 auto" }}
          >
            <span data-tour="add-frame" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <IconPlus size={15} /> Frame
            </span>
          </Button>
          <Button variant="outline" size="sm" title="Buat scene baru" onClick={ctx.addScene}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <IconPlus size={13} /> Scene
            </span>
          </Button>
        </div>

        {/* Row 2 — PLAYBACK: the maju/mundur nav trio (prev · play · next) sits
            prominent, split by a divider from the smaller playback options. */}
        <div className="os-transport" role="group" aria-label="Navigasi & putar frame">
          <span className="os-tgroup">
            <button className="os-ico os-nav" title="Frame sebelumnya" aria-label="Frame sebelumnya" onClick={ctx.prevFrame}>
              <IconPrev size={18} />
            </button>
            <button
              className="os-ico os-nav"
              title="Play / pause (Space)"
              aria-label={playback.playing ? "Pause" : "Play"}
              onClick={ctx.togglePlay}
            >
              {playback.playing ? <IconPause size={18} /> : <IconPlay size={18} />}
            </button>
            <button className="os-ico os-nav" title="Frame berikutnya" aria-label="Frame berikutnya" onClick={ctx.nextFrame}>
              <IconNext size={18} />
            </button>
          </span>
          <span className="os-tdiv" aria-hidden />
          <span className="os-tgroup">
            <button className="os-ico os-opt" title="Stop" aria-label="Stop" onClick={ctx.stopPlayback}>
              <IconStop size={14} />
            </button>
            <button
              className={"os-ico os-opt" + (playback.loop ? " on" : "")}
              title={"Loop: " + (playback.loop ? "ON" : "OFF")}
              aria-label={"Loop: " + (playback.loop ? "ON" : "OFF")}
              aria-pressed={playback.loop}
              onClick={() => ctx.setLoop(!playback.loop)}
            >
              <IconLoop size={14} />
            </button>
            <button
              className={"os-ico os-opt" + (playback.smooth ? " on" : "")}
              title={"Transisi: " + (playback.smooth ? "HALUS" : "CUT")}
              aria-label={"Transisi: " + (playback.smooth ? "halus" : "potong")}
              aria-pressed={playback.smooth}
              onClick={() => ctx.setSmooth(!playback.smooth)}
            >
              <IconTransition size={14} />
            </button>
          </span>
        </div>

        {/* Row 3 — STATUS: which frame is current · per-frame duration · apply the
            live camera to the selected frame (only when it has unsaved changes). */}
        <div className="os-status">
          <span className="os-ind">{ind}</span>
          <label className="os-dur" title="Durasi per frame saat play">
            <input
              type="number"
              min={0.5}
              max={30}
              step={0.5}
              value={playback.duration}
              onChange={(e) => ctx.setFrameDuration(Number(e.target.value) || 0.5)}
              aria-label="Durasi per frame (detik)"
            />
            s
          </label>
          {current && dirty ? (
            <Button variant="primary" size="sm" title="Terapkan kamera saat ini ke frame terpilih" onClick={ctx.updateFrame}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <IconUpdate size={13} /> Terapkan
              </span>
            </Button>
          ) : null}
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
