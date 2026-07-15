"use client";
// MobilePanel — the controller for phones (≤820), now DRIVEN BY THE BOTTOM DOCK.
// The dock (EditorDock) sets an active section via useMobileDock; this renders ONLY
// that section's group of controls as an in-flow split panel (native <details>
// accordion, no overlay). Section null (default) → returns null so the .panel grid
// row collapses and the canvas fills the screen. Reuses every existing control
// component as-is; desktop keeps its tab layout (PanelTabs switches on useMediaQuery).
// Dock groups: Prompt (prompt+detail) · Kamera (rig+subjek) · Preset · Lainnya
// (viewport+brief+proyek).

import React from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/i18n";
import { CameraPromptDock } from "@/components/editor/CameraPromptDock";
import { PromptOptionsList } from "@/components/editor/PromptOptionsMenu";
import { useMobileDock } from "@/components/editor/EditorDock";
import { RigSliders } from "./control/RigSliders";
import { PresetRows } from "./control/PresetRows";
import { CameraSelect } from "./control/CameraSelect";
import { GlobalCameraSettings } from "./control/GlobalCameraSettings";
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
          <ChevronDown size={14} />
        </span>
      </summary>
      <div className="acc-body">{children}</div>
    </details>
  );
}

export function MobilePanel() {
  const { section } = useMobileDock();
  const { t } = useT();
  if (!section) return null; // dock closed → panel row collapses, canvas full-screen

  return (
    <div className="panel-page active mobile-acc" data-section={section}>
      {section === "prompt" ? (
        <>
          <AccSection title={t("panel.sectionCameraPrompt")} open>
            <CameraPromptDock showDetailToggles={false} />
          </AccSection>
          <AccSection title={t("panel.sectionPromptDetail")}>
            <PromptOptionsList />
          </AccSection>
        </>
      ) : null}
      {section === "kamera" ? (
        <>
          <AccSection title={t("panel.tabCamera")} open>
            <RigSliders />
            <CameraSelect />
          </AccSection>
          <AccSection title={t("panel.tabSubject")}>
            <SubjectControls />
          </AccSection>
        </>
      ) : null}
      {section === "preset" ? (
        <AccSection title={t("panel.preset")} open>
          <PresetRows />
        </AccSection>
      ) : null}
      {section === "more" ? (
        <>
          <AccSection title={t("panel.tabViewport")} open>
            <ToggleRow />
            <OutputFrame />
            <GlobalCameraSettings />
          </AccSection>
          <AccSection title={t("panel.briefDetailOptional")}>
            <ShotBrief />
          </AccSection>
          <AccSection title={t("panel.projectSection")}>
            <SavedProjects />
          </AccSection>
        </>
      ) : null}
    </div>
  );
}
