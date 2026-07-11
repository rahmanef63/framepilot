"use client";
// ControlPanel.tsx — the Kontrol panel (plan G5–G11, G15). Now a thin composer
// of cohesive sections that each drive the live rig through useEditor():
//   SubjectControls · RigSliders · PresetRows · ToggleRow · OutputFrame
// plus SavedProjects (G22/G23). Section order is preserved from the original
// single-file panel so the rendered DOM is unchanged.

import React from "react";
import { SubjectControls } from "./control/SubjectControls";
import { RigSliders } from "./control/RigSliders";
import { PresetRows } from "./control/PresetRows";
import { ToggleRow } from "./control/ToggleRow";
import { OutputFrame } from "./control/OutputFrame";
import { SavedProjects } from "./SavedProjects";

export function ControlPanel() {
  return (
    <div className="panel-page active">
      <SubjectControls />
      <RigSliders />
      <PresetRows />
      <ToggleRow />
      <OutputFrame />
      <SavedProjects />
    </div>
  );
}

export default ControlPanel;
