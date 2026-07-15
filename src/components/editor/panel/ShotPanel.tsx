"use client";
// ShotPanel.tsx — the "Prompt" tab (tab key "shot"). Two things: (i) CameraPromptDock
// — the paste-ready camera prompt + platform + Detail-prompt checkboxes + Copy (the
// hero, so the flow stays add-frame → Salin); (ii) the 6-field <ShotBrief/> tucked
// into ONE optional collapsed <details>. The scene→frame outline moved to the left
// OutlineSidebar; on mobile this whole panel becomes an accordion (MobilePanel).

import React from "react";
import { useT } from "@/i18n";
import { CameraPromptDock } from "@/components/editor/CameraPromptDock";
import { ShotBrief } from "./ShotBrief";

export function ShotPanel() {
  const { t } = useT();
  return (
    <div className="panel-page active">
      {/* ---- output-of-this-tab hero: paste-ready camera prompt ---- */}
      <CameraPromptDock />

      {/* ---- optional brief: one collapsible layer, collapsed by default ---- */}
      <details className="brief-fold">
        <summary>{t("panel.briefDetailOptional")}</summary>
        <ShotBrief />
      </details>
    </div>
  );
}
