"use client";
// PromptOptionsMenu.tsx — the "Detail prompt" dropdown of checkboxes. Each box
// toggles ONE clause of the camera prompt (lens, geometry, move, framing…) and
// the shown/copied prompt rebuilds live via the shared usePromptOptions store.
// Native <details> = the dropdown (no outside-click JS, closes itself, a11y-ok).

import React from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/i18n";
import { usePromptOptions } from "./usePromptOptions";
import type { ShotOptions } from "@/lib/prompt/types";
import "./prompt-options.css";

const ROWS: { key: keyof ShotOptions; labelKey: string }[] = [
  { key: "lens", labelKey: "editor.optLens" },
  { key: "dof", labelKey: "editor.optDof" },
  { key: "elevation", labelKey: "editor.optElevation" },
  { key: "view", labelKey: "editor.optView" },
  { key: "distance", labelKey: "editor.optDistance" },
  { key: "height", labelKey: "editor.optHeight" },
  { key: "dutch", labelKey: "editor.optDutch" },
  { key: "move", labelKey: "editor.optMove" },
  { key: "framing", labelKey: "editor.optFraming" },
  { key: "camera", labelKey: "editor.optCamera" },
];

// The bare checkbox list — reused by the desktop <details> dropdown AND the mobile
// controller accordion (always-visible, no dropdown wrapper there).
export function PromptOptionsList() {
  const { t } = useT();
  const [opts, set] = usePromptOptions();
  return (
    <div className="cam-opts__menu" role="group" aria-label={t("editor.promptDetailsAria")}>
      {ROWS.map((r) => (
        <label key={r.key} className="cam-opts__row">
          <input
            type="checkbox"
            checked={opts[r.key]}
            onChange={(e) => set(r.key, e.target.checked)}
          />
          <span>{t(r.labelKey)}</span>
        </label>
      ))}
    </div>
  );
}

function promptOptionsOnCount(opts: ShotOptions): number {
  return ROWS.filter((r) => opts[r.key]).length;
}

export function PromptOptionsMenu() {
  const { t } = useT();
  const [opts] = usePromptOptions();
  const on = promptOptionsOnCount(opts);

  return (
    <details className="cam-opts" data-tour="detail-prompt">
      <summary title={t("editor.promptDetailsTitle")}>
        <span className="cam-opts__title">{t("editor.promptDetails")}</span>
        <span className="cam-opts__count">
          {on}/{ROWS.length}
        </span>
        <span className="cam-opts__chevron" aria-hidden="true">
          <ChevronDown size={14} />
        </span>
      </summary>
      <PromptOptionsList />
    </details>
  );
}
