"use client";
// InspectorTabs — the KAMERA / SUBJEK / VIEWPORT sub-tab bar for the Kontrol
// inspector. Controlled: the active id + onChange live in ControlPanel. Pure
// presentation, styled by inspector-tabs.css (tokens only, ≥40px tap targets).

import React from "react";

export type InspectorTab = "kamera" | "subjek" | "viewport";

const TABS: { id: InspectorTab; label: string }[] = [
  { id: "kamera", label: "Kamera" },
  { id: "subjek", label: "Subjek" },
  { id: "viewport", label: "Viewport" },
];

export function InspectorTabs({
  value,
  onChange,
}: {
  value: InspectorTab;
  onChange: (id: InspectorTab) => void;
}) {
  return (
    <div className="inspector-tabs" role="tablist" aria-label="Inspector">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={value === t.id ? "active" : undefined}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
