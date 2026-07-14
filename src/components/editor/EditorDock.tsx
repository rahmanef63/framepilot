"use client";
// EditorDock — the mobile-only (≤820) bottom control bar. Five slots:
//   [Prompt] [Kamera] (＋) [Preset] [Lainnya]
// The center ＋ captures the live camera as a new frame (ctx.addFrame). The four
// side buttons toggle the controller open as an IN-FLOW split panel (MobilePanel
// reads the active section from useMobileDock and renders only that group; the
// grid row collapses to 0 when nothing is active, so the canvas gets the whole
// screen by default). No overlay — the panel pushes the canvas up, dock stays
// pinned at the bottom. display:none on desktop (there PanelTabs owns the panel).

import React, { createContext, useContext, useState } from "react";
import { useEditor } from "@/state/EditorState";
import { PanelLeft, Aperture, LayoutGrid, MoreHorizontal, Plus, type LucideIcon } from "lucide-react";

type DockSection = "prompt" | "kamera" | "preset" | "more" | null;

const MobileDockCtx = createContext<{
  section: DockSection;
  setSection: (s: DockSection) => void;
}>({ section: null, setSection: () => {} });

export function MobileDockProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<DockSection>(null);
  return <MobileDockCtx.Provider value={{ section, setSection }}>{children}</MobileDockCtx.Provider>;
}

export const useMobileDock = () => useContext(MobileDockCtx);

const TABS: { key: Exclude<DockSection, null>; icon: LucideIcon; label: string }[] = [
  { key: "prompt", icon: PanelLeft, label: "Prompt" },
  { key: "kamera", icon: Aperture, label: "Kamera" },
  { key: "preset", icon: LayoutGrid, label: "Preset" },
  { key: "more", icon: MoreHorizontal, label: "Lainnya" },
];

export function EditorDock() {
  const ctx = useEditor();
  const { section, setSection } = useMobileDock();
  const toggle = (s: Exclude<DockSection, null>) => setSection(section === s ? null : s);

  // Split the four toggles around the center ＋ (2 · add · 2).
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav className="editor-dock" aria-label="Kontrol editor">
      {left.map((t) => (
        <DockBtn key={t.key} icon={t.icon} label={t.label} active={section === t.key} onClick={() => toggle(t.key)} />
      ))}
      <button
        type="button"
        className="dock-add"
        onClick={() => ctx.addFrame()}
        aria-label="Buat frame baru dari kamera saat ini"
        title="Tangkap frame dari kamera → frame baru"
      >
        <span aria-hidden><Plus size={26} /></span>
      </button>
      {right.map((t) => (
        <DockBtn key={t.key} icon={t.icon} label={t.label} active={section === t.key} onClick={() => toggle(t.key)} />
      ))}
    </nav>
  );
}

function DockBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = icon;
  return (
    <button
      type="button"
      className={"dock-btn" + (active ? " active" : "")}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="dock-ico" aria-hidden>
        <Icon size={22} />
      </span>
      <span className="dock-lbl">{label}</span>
    </button>
  );
}
