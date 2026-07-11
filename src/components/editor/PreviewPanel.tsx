"use client";
// PreviewPanel.tsx — the Full Preview tab chrome (plan G1/G23). Renders the
// concept's .pv-bar (transport row) + .pv-side (generated-prompt textarea + copy),
// as a fragment so they drop into the .preview-page grid. The 3D stage itself is
// the ONE shared engine reflowed by EditorScreen into .pv-stage (focusView=cam) —
// this component never mounts a second viewport. Presentational: all playback /
// scene state comes from useEditor(); strings ported VERBATIM from the concept.

import React, { useState } from "react";
import { useEditor } from "@/state/EditorState";
import { Button } from "@/components/ds/Button";
import { activeScene } from "@/lib/editorModel";
import { projectPrompt } from "@/lib/editorPrompt";

function fallbackCopy(txt: string) {
  const ta = document.createElement("textarea");
  ta.value = txt;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* noop */
  }
  ta.remove();
}

export function PreviewPanel() {
  const ctx = useEditor();
  const { playback } = ctx;
  const [copied, setCopied] = useState(false);

  // whole-project prompt for the textarea (concept projectPrompt)
  const prompt = projectPrompt(ctx.project);
  const projName = ctx.project.name.trim() || "Proyek tanpa nama";

  // transport indicator sourced from the active scene (concept updatePlaybackUI)
  const sc = activeScene(ctx.project);
  const frames = sc.frames;
  const total = frames.length;
  const cur = total ? Math.min(playback.idx + 1, total) : 0;
  const name = total ? frames[Math.min(playback.idx, total - 1)].name || "" : "";
  const ind = total ? `${cur}/${total} · ${name}` : "—";

  const copyPrompt = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt).then(done).catch(() => {
        fallbackCopy(prompt);
        done();
      });
    } else {
      fallbackCopy(prompt);
      done();
    }
  };

  return (
    <>
      {/* ---- transport row (concept .pv-bar) ---- */}
      <div className="pv-bar">
        <select
          title="Scene aktif"
          value={sc.id}
          onChange={(e) => ctx.setActiveSceneId(e.target.value, true)}
        >
          {ctx.project.scenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.frames.length}f)
            </option>
          ))}
        </select>
        <div className="pbar">
          <Button variant="outline" size="sm" onClick={ctx.prevFrame}>Prev</Button>
          <Button variant="outline" size="sm" onClick={ctx.togglePlay}>
            {playback.playing ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" size="sm" onClick={ctx.nextFrame}>Next</Button>
          <Button variant="outline" size="sm" onClick={ctx.stopPlayback}>Stop</Button>
          <span className="ind pbInd">{ind}</span>
        </div>
        <button
          className={"small" + (playback.loop ? " on" : "")}
          onClick={() => ctx.setLoop(!playback.loop)}
        >
          Loop
        </button>
        <span
          className="count frameCount"
          style={{ fontFamily: "var(--e-mono)", fontSize: 11, color: "var(--muted)" }}
        >
          {total} frame
        </span>
        <div className="spacer" />
        <span className="hint" style={{ maxWidth: "34vw" }}>
          Navigasi tetap aktif: WASD / Q E / drag / scroll
        </span>
      </div>

      {/* ---- generated-prompt side panel (concept .pv-side) ---- */}
      <div className="pv-side">
        <h3>
          Info Prompt — <span style={{ color: "var(--accent)" }}>{projName}</span>
        </h3>
        <textarea
          readOnly
          spellCheck={false}
          value={prompt}
          placeholder="Tambahkan frame di tab Editor, lalu info prompt per shot akan muncul di sini."
        />
        <div className="row">
          <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={copyPrompt}>
            {copied ? "Tersalin ✓" : "Salin Prompt"}
          </Button>
        </div>
        <p className="storage-note">
          Teks ini bisa ditempel sebagai konteks shot untuk prompt AI (image/video generation)
          atau catatan produksi.
        </p>
      </div>
    </>
  );
}

export default PreviewPanel;
