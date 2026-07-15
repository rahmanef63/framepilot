"use client";
// PreviewPanel.tsx — the Full Preview tab chrome (plan G1/G23). Renders the
// concept's .pv-bar (transport row) + .pv-side (generated-prompt textarea + copy),
// as a fragment so they drop into the .preview-page grid. The 3D stage itself is
// the ONE shared engine reflowed by EditorScreen into .pv-stage (focusView=cam) —
// this component never mounts a second viewport. Presentational: all playback /
// scene state comes from useEditor(); strings ported VERBATIM from the concept.

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { Button } from "@/components/ds/Button";
import { activeScene } from "@/lib/editorModel";
import { projectPrompt, projectDetail } from "@/lib/editorPrompt";
import { usePlatform } from "./usePlatform";
import { usePromptOptions } from "./usePromptOptions";
import { PlatformSelect, PlatformHint } from "./PlatformPicker";
import { PromptOptionsMenu } from "./PromptOptionsMenu";
import { IconPrev, IconPlay, IconPause, IconNext, IconStop, IconLoop } from "./EditorIcons";
import { copyText } from "./panel/outline/clipboard";
import { CopyButton } from "./CopyButton";

export function PreviewPanel() {
  const ctx = useEditor();
  const { t } = useT();
  const { playback } = ctx;
  const [platform, setPlatform] = usePlatform();
  const [opts] = usePromptOptions();
  const [copied, setCopied] = useState(false);

  // whole-project skinned camera prompt for the textarea (platform-tuned hero),
  // rebuilt live from the shared prompt-detail toggles
  const prompt = projectPrompt(ctx.project, platform, opts);
  const projName = ctx.project.name.trim() || t("editor.untitledProject");

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
          title={t("editor.activeScene")}
          value={sc.id}
          onChange={(e) => ctx.setActiveSceneId(e.target.value, true)}
        >
          {ctx.project.scenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({t("editor.framesShort", { n: s.frames.length })})
            </option>
          ))}
        </select>
        <div className="pbar">
          <Button variant="outline" size="sm" title={t("editor.prevFrame")} onClick={ctx.prevFrame}>
            <IconPrev />
          </Button>
          <Button variant="outline" size="sm" title={t("editor.playPause")} onClick={ctx.togglePlay}>
            {playback.playing ? <IconPause /> : <IconPlay />}
          </Button>
          <Button variant="outline" size="sm" title={t("editor.nextFrame")} onClick={ctx.nextFrame}>
            <IconNext />
          </Button>
          <Button variant="outline" size="sm" title={t("editor.stop")} onClick={ctx.stopPlayback}>
            <IconStop />
          </Button>
          <span className="ind pbInd">{ind}</span>
        </div>
        <button
          className={"small" + (playback.loop ? " on" : "")}
          title={playback.loop ? t("editor.loopOn") : t("editor.loopOff")}
          onClick={() => ctx.setLoop(!playback.loop)}
        >
          <IconLoop />
        </button>
        <span
          className="count frameCount"
          style={{ fontFamily: "var(--e-mono)", fontSize: 11, color: "var(--muted)" }}
        >
          {t("editor.frameCount", { n: total })}
        </span>
        <div className="spacer" />
        <span className="hint" style={{ maxWidth: "34vw" }}>
          {t("editor.navStaysActive")}
        </span>
      </div>

      {/* ---- generated-prompt side panel (concept .pv-side) ---- */}
      <div className="pv-side">
        <div className="pv-side-head">
          <h3>{t("editor.cameraPrompt")}</h3>
          <span className="pv-side-count">{t("editor.shotCount", { n: totalShots })} · {projName}</span>
        </div>
        <p className="pv-flow">
          {t("editor.flowBefore")} <b>{t("editor.tabEditor")}</b> {t("editor.flowAfter")}
        </p>
        <div className="cam-dock-ctl">
          <PlatformSelect value={platform} onChange={setPlatform} />
        </div>
        <textarea
          className="pv-prompt"
          readOnly
          spellCheck={false}
          value={prompt}
          placeholder={t("editor.promptPlaceholder")}
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
            {copied ? <>{t("common.copied")} <Check size={16} aria-hidden /></> : hasShots ? t("editor.copyPrompt") : t("editor.noShotsYet")}
          </Button>
          <CopyButton variant="ghost" size="md" text={() => projectDetail(ctx.project)} label={t("editor.copyDetails")} disabled={!hasShots} />
        </div>
        {hasShots ? (
          <details className="cam-detail">
            <summary>{t("editor.productionDetails")}</summary>
            <pre>{projectDetail(ctx.project)}</pre>
          </details>
        ) : null}
        <p className="storage-note">
          {t("editor.storageNoteBefore")} <b>{t("editor.detailWord")}</b> {t("editor.storageNoteAfter")}
        </p>
      </div>
    </>
  );
}
