"use client";
// PanelTabs.tsx — the right-panel sub-tabs (concept .panel-tabs): Kontrol / Data
// Shot / Outline. Renders ControlPanel for "control", ShotPanel for "shot",
// OutlineTree for "outline".

import React from "react";
import { useEditor } from "@/state/EditorState";
import { ControlPanel } from "./ControlPanel";
import { ShotPanel } from "./ShotPanel";
import { OutlineTree } from "./OutlineTree";
import type { EditorUi } from "@/state/EditorState";

const SUB_TABS: { key: EditorUi["panelTab"]; label: string }[] = [
  { key: "control", label: "Kontrol" },
  { key: "shot", label: "Data Shot" },
  { key: "outline", label: "Outline" },
];

export function PanelTabs() {
  const ctx = useEditor();
  const tab = ctx.ui.panelTab;

  return (
    <>
      <div className="panel-tabs">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : undefined}
            onClick={() => ctx.setPanelTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "control" ? <ControlPanel /> : null}
      {tab === "shot" ? <ShotPanel /> : null}
      {tab === "outline" ? <OutlineTree /> : null}
    </>
  );
}

export default PanelTabs;
