"use client";
// PanelTabs.tsx — the right-panel sub-tabs (concept .panel-tabs): Kontrol / Prompt.
// Renders ControlPanel for "control"; the "shot" key now hosts ShotPanel = JUST
// the camera prompt + optional brief (the scene/frame outline moved to the left
// OutlineSidebar). Tab key stays "shot" internally; the label reads "Prompt".

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { ControlPanel } from "./ControlPanel";
import { ShotPanel } from "./ShotPanel";
import { MobilePanel } from "./MobilePanel";
import { useMediaQuery } from "../useMediaQuery";
import type { EditorUi } from "@/state/EditorState";

const SUB_TABS: { key: EditorUi["panelTab"]; labelKey: string }[] = [
  { key: "control", labelKey: "panel.tabControl" },
  { key: "shot", labelKey: "panel.tabPrompt" },
];

export function PanelTabs() {
  const ctx = useEditor();
  const { t } = useT();
  const tab = ctx.ui.panelTab;
  // Mobile (≤820): one accordion stack instead of the nested tabs. Desktop untouched.
  const mobile = useMediaQuery("(max-width: 820px)");
  if (mobile) return <MobilePanel />;

  return (
    <>
      <div className="panel-tabs">
        {SUB_TABS.map((st) => (
          <button
            key={st.key}
            className={tab === st.key ? "active" : undefined}
            data-tour={st.key === "shot" ? "panel-prompt" : undefined}
            onClick={() => ctx.setPanelTab(st.key)}
          >
            {t(st.labelKey)}
          </button>
        ))}
      </div>

      {tab === "control" ? <ControlPanel /> : null}
      {tab === "shot" ? <ShotPanel /> : null}
    </>
  );
}
