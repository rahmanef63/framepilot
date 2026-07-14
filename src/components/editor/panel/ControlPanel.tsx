"use client";
// ControlPanel.tsx — the Kontrol inspector. Splits the section stack into three
// sub-tabs via <InspectorTabs/> (local state, default "kamera"):
//   · KAMERA   → RigSliders (rig + Posisi Kamera + Posisi Anchor) · PresetRows
//   · SUBJEK   → SubjectControls (type + transform)
//   · VIEWPORT → ToggleRow · OutputFrame
// SavedProjects (G22/G23) stays OUTSIDE the tabs — project management is not
// tab-specific, so it's always reachable at the foot of the panel.

import React, { useState } from "react";
import { InspectorTabs, type InspectorTab } from "./control/InspectorTabs";
import { SubjectControls } from "./control/SubjectControls";
import { RigSliders } from "./control/RigSliders";
import { PresetRows } from "./control/PresetRows";
import { ToggleRow } from "./control/ToggleRow";
import { OutputFrame } from "./control/OutputFrame";
import { SavedProjects } from "./SavedProjects";
import "./control/inspector-tabs.css";

export function ControlPanel() {
  const [tab, setTab] = useState<InspectorTab>("kamera");

  return (
    <div className="panel-page active">
      <InspectorTabs value={tab} onChange={setTab} />

      <div className="inspector-body">
        {tab === "kamera" && (
          <>
            <RigSliders />
            <PresetRows />
          </>
        )}
        {tab === "subjek" && <SubjectControls />}
        {tab === "viewport" && (
          <>
            <ToggleRow />
            <OutputFrame />
          </>
        )}
      </div>

      <SavedProjects />
    </div>
  );
}
