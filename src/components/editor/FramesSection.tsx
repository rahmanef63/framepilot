"use client";
// FramesSection.tsx — the frames filmstrip + transport bar (plan G20). Scene
// selector, transport ([data-pb] prev/play/next/stop + .pbInd "i/N · name"),
// per-frame duration slider (rDur 0.5–30 step0.5 def2), loop + smooth toggles
// (label HALUS/CUT), and Update/Add actions. The FrameCard strip below reflows
// the active scene. Mirrors concept .frames-section markup (~832-859) and the
// transport/pbInd/refreshFrameAction logic. Presentational over useEditor().

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Slider } from "./ui/Slider";
import { FrameCard } from "./FrameCard";
import { Button } from "@/components/ds/Button";

export function FramesSection() {
  const ctx = useEditor();
  const { project, playback } = ctx;

  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0];
  const frames = scene?.frames ?? [];

  // transport indicator "i/N · name" (concept updatePlaybackUI ~2172-2175)
  const total = frames.length;
  const cur = total ? Math.min(playback.idx + 1, total) : 0;
  const name = total ? frames[Math.min(playback.idx, total - 1)]?.name || "" : "";
  const ind = total ? `${cur}/${total} · ${name}` : "—";

  // update-frame action state (concept refreshFrameAction ~1738-1742)
  const current = ctx.currentFrame();
  const dirty = ctx.frameIsDirty(current);
  const updateLabel = !current
    ? "Perbarui Frame"
    : dirty
      ? "Perbarui Frame *"
      : "Frame Tersimpan";

  return (
    <div className="frames-section">
      <div className="frames-head">
        <h2>Scene</h2>
        <select
          title="Scene aktif"
          value={project.activeSceneId ?? ""}
          onChange={(e) => ctx.setActiveSceneId(e.target.value, true)}
        >
          {project.scenes.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name} ({sc.frames.length}f)
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" title="Tambah scene" onClick={ctx.addScene}>
          +
        </Button>
        <span className="count frameCount">{frames.length} frame</span>

        <div className="pbar">
          <Button variant="outline" size="sm" title="Frame sebelumnya" onClick={ctx.prevFrame}>
            Prev
          </Button>
          <Button variant="outline" size="sm" title="Play / pause (Space)" onClick={ctx.togglePlay}>
            {playback.playing ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" size="sm" title="Frame berikutnya" onClick={ctx.nextFrame}>
            Next
          </Button>
          <Button variant="outline" size="sm" title="Stop" onClick={ctx.stopPlayback}>
            Stop
          </Button>
          <span className="ind pbInd">{ind}</span>
        </div>

        <div className="dur">
          <Slider
            label="DUR"
            min={0.5}
            max={30}
            step={0.5}
            value={playback.duration}
            format={(v) => `${v.toFixed(1)}s`}
            onInput={ctx.setFrameDuration}
          />
        </div>

        <button
          className={playback.loop ? "small on" : "small"}
          data-pb="loop"
          onClick={() => ctx.setLoop(!playback.loop)}
        >
          Loop: {playback.loop ? "ON" : "OFF"}
        </button>
        <button
          className={playback.smooth ? "small on" : "small"}
          data-pb="smooth"
          onClick={() => ctx.setSmooth(!playback.smooth)}
        >
          Transisi: {playback.smooth ? "HALUS" : "CUT"}
        </button>

        <div className="spacer" style={{ flex: 1 }} />

        <Button
          variant={current && dirty ? "primary" : "outline"}
          size="sm"
          disabled={!current}
          onClick={ctx.updateFrame}
        >
          {updateLabel}
        </Button>
        <Button variant="primary" size="sm" onClick={ctx.addFrame}>
          + Tambah Frame
        </Button>
      </div>

      <div className="frames-strip">
        {frames.length === 0 ? (
          <div className="empty-frames">
            <div>
              Scene “{scene?.name}” belum punya frame.
              <br />
              Atur kamera lalu klik <b>+ Tambah Frame</b>. Frame bisa di-play berurutan sebagai
              previsualisasi.
            </div>
          </div>
        ) : (
          frames.map((f, i) => <FrameCard key={f.id} frame={f} index={i} />)
        )}
      </div>
    </div>
  );
}

export default FramesSection;
