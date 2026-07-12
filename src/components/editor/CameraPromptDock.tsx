"use client";
// CameraPromptDock.tsx — the HERO of the Studio (editor tab): the paste-ready
// CAMERA prompt, always visible (not one tab deep). Shows the skinned prompt for
// the CURRENT SELECTION (active frame → single shot; else whole project), a
// platform selector that reskins live, a prominent Copy, the per-platform hint,
// and the full bilingual production dump tucked into a collapsible "Detail".

import React, { useState } from "react";
import { useEditor } from "@/state/EditorState";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { encodeShot, toNeutral } from "@/lib/prompt/cameraPrompt";
import { projectPrompt, projectDetail } from "@/lib/editorPrompt";
import { usePlatform } from "./usePlatform";
import { PlatformSelect, PlatformHint } from "./PlatformPicker";
import { copyText } from "./panel/outline/clipboard";

export function CameraPromptDock() {
  const ctx = useEditor();
  const [platform, setPlatform] = usePlatform();
  const [copied, setCopied] = useState(false);

  const settings = ctx.project.settings;
  const current = ctx.currentFrame();
  const totalShots = ctx.project.scenes.reduce((n, s) => n + s.frames.length, 0);
  const hasShots = totalShots > 0;

  // Current selection → the shown, paste-ready camera prompt.
  const scope = current ? `Shot terpilih · ${current.name}` : `Proyek · ${totalShots} shot`;
  const prompt = current
    ? encodeShot(toNeutral(current, { aspectRatio: settings.aspectRatio }), platform)
    : hasShots
      ? projectPrompt(ctx.project, platform)
      : "";

  const copy = () => {
    if (!prompt) return;
    copyText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="cam-dock" aria-label="Prompt Kamera">
      <div className="cam-dock-top">
        <div className="cam-dock-title">
          <Badge tone="new">Prompt Kamera</Badge>
          <span className="cam-scope">{scope}</span>
        </div>
        <div className="cam-dock-ctl">
          <Button variant="primary" size="sm" disabled={!hasShots} onClick={copy}>
            {copied ? "Tersalin ✓" : hasShots ? "Salin" : "Belum ada shot"}
          </Button>
        </div>
      </div>

      <PlatformSelect value={platform} onChange={setPlatform} />

      <textarea
        className="cam-out"
        readOnly
        spellCheck={false}
        value={prompt}
        placeholder="Atur kamera + tambah frame — prompt kamera siap-tempel muncul di sini."
      />

      <PlatformHint value={platform} />

      {hasShots ? (
        <details className="cam-detail">
          <summary>Detail produksi (bilingual · semua shot)</summary>
          <pre>{projectDetail(ctx.project)}</pre>
        </details>
      ) : null}
    </section>
  );
}

export default CameraPromptDock;
