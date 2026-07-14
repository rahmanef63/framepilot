"use client";
// PanelTabs.tsx — the right-panel sub-tabs (concept .panel-tabs): Kontrol / Prompt.
// Renders ControlPanel for "control"; the "shot" key now hosts ShotPanel = JUST
// the camera prompt + optional brief (the scene/frame outline moved to the left
// OutlineSidebar). Tab key stays "shot" internally; the label reads "Prompt".

import React from "react";
import { useEditor } from "@/state/EditorState";
import { ControlPanel } from "./ControlPanel";
import { ShotPanel } from "./ShotPanel";
import { MobilePanel } from "./MobilePanel";
import { useMediaQuery } from "../useMediaQuery";
import type { EditorUi } from "@/state/EditorState";

const SUB_TABS: { key: EditorUi["panelTab"]; label: string }[] = [
  { key: "control", label: "Kontrol" },
  { key: "shot", label: "Prompt" },
];

export function PanelTabs() {
  const ctx = useEditor();
  const tab = ctx.ui.panelTab;
  // Mobile (≤820): one accordion stack instead of the nested tabs. Desktop untouched.
  const mobile = useMediaQuery("(max-width: 820px)");
  if (mobile) return <MobilePanel />;

  return (
    <>
      <div className="panel-tabs">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : undefined}
            data-tour={t.key === "shot" ? "panel-prompt" : undefined}
            onClick={() => ctx.setPanelTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "control" ? <ControlPanel /> : null}
      {tab === "shot" ? <ShotPanel /> : null}
    </>
  );
}
