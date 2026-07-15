"use client";
// CameraPromptDock.tsx — the HERO of the Studio (editor tab): the paste-ready
// CAMERA prompt, always visible (not one tab deep). Shows the skinned prompt for
// the CURRENT SELECTION (active frame → single shot; else whole project), a
// platform selector that reskins live, a prominent Copy, the per-platform hint,
// and the full bilingual production dump tucked into a collapsible "Detail".

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { encodeShot, toNeutral } from "@/lib/prompt/cameraPrompt";
import { projectPrompt, projectDetail } from "@/lib/editorPrompt";
import { usePlatform } from "./usePlatform";
import { usePromptOptions } from "./usePromptOptions";
import { PlatformSelect, PlatformHint } from "./PlatformPicker";
import { PromptOptionsMenu } from "./PromptOptionsMenu";
import { copyText } from "./panel/outline/clipboard";
import { CopyButton } from "./CopyButton";

// showDetailToggles: the desktop dock shows the "Detail prompt" checkboxes inline;
// on mobile MobilePanel hosts them in a dedicated accordion section, so it passes
// false here to avoid a duplicate.
export function CameraPromptDock({ showDetailToggles = true }: { showDetailToggles?: boolean } = {}) {
  const ctx = useEditor();
  const { t } = useT();
  const [platform, setPlatform] = usePlatform();
  const [opts] = usePromptOptions();
  const [copied, setCopied] = useState(false);

  const settings = ctx.project.settings;
  const current = ctx.currentFrame();
  const totalShots = ctx.project.scenes.reduce((n, s) => n + s.frames.length, 0);
  const hasShots = totalShots > 0;

  // Current selection → the shown, paste-ready camera prompt. `opts` picks which
  // clauses are folded in, so ticking a box rebuilds this string live.
  const scope = current
    ? t("editor.scopeSelectedShot", { name: current.name })
    : t("editor.scopeProject", { n: totalShots });
  const prompt = current
    ? encodeShot(
        toNeutral(current, {
          aspectRatio: settings.aspectRatio,
          camera: settings.camera,
          globalCamera: settings.globalCamera,
        }),
        platform,
        opts
      )
    : hasShots
      ? projectPrompt(ctx.project, platform, opts)
      : "";

  const copy = () => {
    if (!prompt) return;
    copyText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="cam-dock" aria-label={t("editor.cameraPrompt")}>
      <div className="cam-dock-top">
        <div className="cam-dock-title">
          <Badge tone="new">{t("editor.cameraPrompt")}</Badge>
          <span className="cam-scope">{scope}</span>
        </div>
      </div>

      <div className="cam-dock-row" data-tour="copy">
        <PlatformSelect value={platform} onChange={setPlatform} />
        <Button variant="primary" size="sm" disabled={!hasShots} onClick={copy}>
          {copied ? <>{t("common.copied")} <Check size={14} aria-hidden /></> : hasShots ? t("common.copy") : t("editor.noShotsYet")}
        </Button>
        <CopyButton variant="ghost" text={() => projectDetail(ctx.project)} label={t("editor.copyDetails")} disabled={!hasShots} />
      </div>

      <textarea
        className="cam-out"
        readOnly
        spellCheck={false}
        value={prompt}
        placeholder={t("editor.dockPromptPlaceholder")}
      />

      {/* toggles sit BELOW the output so ticking a box rebuilds the prompt in view */}
      {showDetailToggles ? <PromptOptionsMenu /> : null}

      <PlatformHint value={platform} />

      {hasShots ? (
        <details className="cam-detail">
          <summary>{t("editor.productionDetails")}</summary>
          <pre>{projectDetail(ctx.project)}</pre>
        </details>
      ) : null}
    </section>
  );
}
