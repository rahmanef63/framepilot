"use client";
// InspectorTabs — the KAMERA / SUBJEK / VIEWPORT sub-tab bar for the Kontrol
// inspector. Controlled: the active id + onChange live in ControlPanel. Pure
// presentation, styled by inspector-tabs.css (tokens only, ≥40px tap targets).

import React from "react";
import { useT } from "@/i18n";

export type InspectorTab = "kamera" | "subjek" | "viewport";

const TABS: { id: InspectorTab; labelKey: string }[] = [
  { id: "kamera", labelKey: "panel.tabCamera" },
  { id: "subjek", labelKey: "panel.tabSubject" },
  { id: "viewport", labelKey: "panel.tabViewport" },
];

export function InspectorTabs({
  value,
  onChange,
}: {
  value: InspectorTab;
  onChange: (id: InspectorTab) => void;
}) {
  const { t } = useT();
  return (
    <div className="inspector-tabs" role="tablist" aria-label={t("panel.inspector")}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={value === tab.id}
          className={value === tab.id ? "active" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
}
