"use client";
// MobilePanel — the controller for phones (≤820). Replaces the nested Kontrol/Prompt
// + Kamera/Subjek/Viewport tabs with ONE scrollable accordion stack (native
// <details>, in-flow, no overlay). Reuses every existing control component as-is;
// desktop keeps its tab layout (PanelTabs switches on useMediaQuery). Sections:
// Prompt (open) · Detail prompt (checkboxes) · Kamera · Preset · Subjek · Viewport
// · Brief · Proyek.

import React from "react";
import { CameraPromptDock } from "@/components/editor/CameraPromptDock";
import { PromptOptionsList } from "@/components/editor/PromptOptionsMenu";
import { RigSliders } from "./control/RigSliders";
import { PresetRows } from "./control/PresetRows";
import { SubjectControls } from "./control/SubjectControls";
import { ToggleRow } from "./control/ToggleRow";
import { OutputFrame } from "./control/OutputFrame";
import { SavedProjects } from "./SavedProjects";
import { ShotBrief } from "./ShotBrief";

function AccSection({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="acc-sec" open={open}>
      <summary>
        <span>{title}</span>
        <span className="acc-chevron" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="acc-body">{children}</div>
    </details>
  );
}

export function MobilePanel() {
  return (
    <div className="panel-page active mobile-acc">
      <AccSection title="Prompt Kamera" open>
        <CameraPromptDock showDetailToggles={false} />
      </AccSection>
      <AccSection title="Detail prompt">
        <PromptOptionsList />
      </AccSection>
      <AccSection title="Kamera">
        <RigSliders />
      </AccSection>
      <AccSection title="Preset">
        <PresetRows />
      </AccSection>
      <AccSection title="Subjek">
        <SubjectControls />
      </AccSection>
      <AccSection title="Viewport">
        <ToggleRow />
        <OutputFrame />
      </AccSection>
      <AccSection title="Detail brief (opsional)">
        <ShotBrief />
      </AccSection>
      <AccSection title="Proyek">
        <SavedProjects />
      </AccSection>
    </div>
  );
}

export default MobilePanel;
