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
import { projectPrompt, projectDetail } from "@/lib/editorPrompt";
import { usePlatform } from "./usePlatform";
import { usePromptOptions } from "./usePromptOptions";
import { PlatformSelect, PlatformHint } from "./PlatformPicker";
import { PromptOptionsMenu } from "./PromptOptionsMenu";
import { IconPrev, IconPlay, IconPause, IconNext, IconStop, IconLoop } from "./EditorIcons";
import { copyText } from "./panel/outline/clipboard";

export function PreviewPanel() {
  const ctx = useEditor();
  const { playback } = ctx;
  const [platform, setPlatform] = usePlatform();
  const [opts] = usePromptOptions();
  const [copied, setCopied] = useState(false);

  // whole-project skinned camera prompt for the textarea (platform-tuned hero),
  // rebuilt live from the shared prompt-detail toggles
  const prompt = projectPrompt(ctx.project, platform, opts);
  const projName = ctx.project.name.trim() || "Proyek tanpa nama";

  // transport indicator sourced from the active scene (concept updatePlaybackUI)
  const sc = activeScene(ctx.project);
  const frames = sc.frames;
  const total = frames.length;
  const cur = total ? Math.min(playback.idx + 1, total) : 0;
  const name = total ? frames[Math.min(playback.idx, total - 1)].name || "" : "";
  const ind = total ? `${cur}/${total} · ${name}` : "—";

  // total shots across every scene — surfaced so the prompt panel says what it holds
  const totalShots = ctx.project.scenes.reduce((n, s) => n + s.frames.length, 0);
  const hasShots = totalShots > 0;

  const copyPrompt = () => {
    copyText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
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
          <Button variant="outline" size="sm" title="Frame sebelumnya" onClick={ctx.prevFrame}>
            <IconPrev />
          </Button>
          <Button variant="outline" size="sm" title="Play / pause (Space)" onClick={ctx.togglePlay}>
            {playback.playing ? <IconPause /> : <IconPlay />}
          </Button>
          <Button variant="outline" size="sm" title="Frame berikutnya" onClick={ctx.nextFrame}>
            <IconNext />
          </Button>
          <Button variant="outline" size="sm" title="Stop" onClick={ctx.stopPlayback}>
            <IconStop />
          </Button>
          <span className="ind pbInd">{ind}</span>
        </div>
        <button
          className={"small" + (playback.loop ? " on" : "")}
          title={"Loop: " + (playback.loop ? "ON" : "OFF")}
          onClick={() => ctx.setLoop(!playback.loop)}
        >
          <IconLoop />
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
        <div className="pv-side-head">
          <h3>Prompt Kamera</h3>
          <span className="pv-side-count">{totalShots} shot · {projName}</span>
        </div>
        <p className="pv-flow">
          Susun shot di tab <b>Editor</b> → pilih platform → salin prompt kamera → tempel ke AI video.
        </p>
        <div className="cam-dock-ctl">
          <PlatformSelect value={platform} onChange={setPlatform} />
        </div>
        <textarea
          className="pv-prompt"
          readOnly
          spellCheck={false}
          value={prompt}
          placeholder="Tambahkan frame di tab Editor, lalu prompt kamera per shot akan muncul di sini."
        />
        {/* toggles below the output so the live rebuild stays visible while ticking */}
        <PromptOptionsMenu />
        <PlatformHint value={platform} />
        <div className="row">
          <Button
            variant="primary"
            size="md"
            style={{ flex: 1 }}
            disabled={!hasShots}
            onClick={copyPrompt}
          >
            {copied ? "Tersalin ✓" : hasShots ? "Salin Prompt" : "Belum ada shot"}
          </Button>
        </div>
        {hasShots ? (
          <details className="cam-detail">
            <summary>Detail produksi (bilingual · semua shot)</summary>
            <pre>{projectDetail(ctx.project)}</pre>
          </details>
        ) : null}
        <p className="storage-note">
          Prompt kamera di atas siap ditempel ke platform AI video. Buka <b>Detail</b> untuk catatan
          produksi lengkap (tujuan, lighting, style, audio).
        </p>
      </div>
    </>
  );
}

export default PreviewPanel;
