"use client";
// PanelTabs.tsx — the right-panel sub-tabs (concept .panel-tabs): Kontrol / Data
// Shot / Outline. Renders ControlPanel for "control"; shot + outline are simple
// placeholders here (Workflow B fills the brief editor + outline tree).

import React from "react";
import { useEditor } from "@/state/EditorState";
import { ControlPanel } from "./ControlPanel";
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
      {tab === "shot" ? (
        <div className="panel-page active">
          <div className="group">
            <h3>Data Shot</h3>
            <div className="storage-note">Editor brief data-shot menyusul (Workflow B).</div>
          </div>
        </div>
      ) : null}
      {tab === "outline" ? (
        <div className="panel-page active">
          <div className="group">
            <h3>Outline</h3>
            <div className="storage-note">Pohon scene / frame menyusul (Workflow B).</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default PanelTabs;
