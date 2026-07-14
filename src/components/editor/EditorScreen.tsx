"use client";
// EditorScreen.tsx — the CAG editor shell (concept body). One persistent
// <EditorViewport/> mounted inside the always-rendered editor page; tab switching
// only toggles the .active/display of the two .page containers (Editor + Full
// Preview) so React never unmounts the viewport and the three engine keeps its
// rAF loop / WebGL context alive across tabs. The camera-grammar cookbook lives
// at /panduan (Shell sidebar → "Panduan"); the old in-editor Guide tab was folded
// into it (Ship B slim).

import React from "react";
import "./editor.css";
import { useEditor } from "@/state/EditorState";
import { EditorHeaderActions } from "./EditorHeaderActions";
import { EditorTabBar } from "./EditorTabBar";
import { PanelTabs } from "./panel/PanelTabs";
import { EditorViewport } from "./viewport/EditorViewport";
import { Hud } from "./viewport/Hud";
import { OutlineSidebar } from "./OutlineSidebar";
import { MobileFrameStrip } from "./MobileFrameStrip";
import { EditorDock, MobileDockProvider } from "./EditorDock";
import { PreviewPanel } from "./PreviewPanel";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export function EditorScreen() {
  const ctx = useEditor();
  const { ui, playback } = ctx;
  const tab = ui.mainTab;

  return (
    <MobileDockProvider>
    <div className={"cag-editor" + (playback.playing ? " playing" : "")} data-tab={tab}>
      {/* Project CRUD lives in the app header now (portaled into #fp-header-actions);
          the editor keeps only its working toolbar (tabs / drag / views) below. */}
      <EditorHeaderActions />
      <EditorTabBar />

      {/* Scene+frame manager — renders here (inside EditorStateProvider) but
          PORTALS into the app Shell sidebar (#fp-studio-slot), so no in-grid box. */}
      <OutlineSidebar />

      {/* Step-by-step onboarding coach-marks (auto once, replayable via the
          `cag:start-tour` event fired from the header "Tur" button). */}
      <OnboardingWizard />

      {/* ---- Editor page: [ ONE viewport | panel ] ----
           The viewport never unmounts (keeps its WebGL context across tab swaps). */}
      <div className={"page editor-page" + (tab === "editor" ? " active" : "")}>
        {/* ROW 1 (mobile ≤820 only): horizontal frame strip — thumbnails + ＋create.
            Replaces the drawer frame manager on phones; display:none on desktop. */}
        <MobileFrameStrip />
        <EditorViewport />
        <div className="panel">
          <PanelTabs />
        </div>
        {/* Mobile-only control bar (≤820, display:none on desktop) — pinned as the
            grid's last row; toggles the .panel split open per section. */}
        <EditorDock />
      </div>

      {/* ---- Full Preview page: the ONE canvas reflows into .pv-viewport ---- */}
      <div className={"page preview-page" + (tab === "preview" ? " active" : "")}>
        <div className="pv-stage">
          <div className="pv-viewport" data-view="cam">
            <Hud thirdsOn={ui.thirdsOn} />
          </div>
        </div>
        <PreviewPanel />
      </div>
    </div>
    </MobileDockProvider>
  );
}

export default EditorScreen;
