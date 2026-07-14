"use client";
// EditorActionMenu.tsx — the "Aksi" (actions) dropdown for the single Studio
// header. Collapses the less-frequent project actions (Simpan / Proyek Baru /
// Impor / Ekspor / Skema) into one token-styled popover that closes on
// outside-click and Esc. Mirrors shell/CreateMenu.tsx, but the trigger is an
// icon button ("⋯") instead of the rail's NavItem.

import React from "react";
import { Button } from "@/components/ds/Button";
import { forceFreshReload } from "@/lib/forceFreshReload";
import { MoreHorizontal, Undo2, Redo2, Download, Sparkles, Plus, GraduationCap, RotateCw, Braces } from "lucide-react";

export function EditorActionMenu({
  onSave,
  onNew,
  onImport,
  onExport,
  onSchema,
  onUndo,
  onRedo,
  onTour,
  canUndo,
  canRedo,
}: {
  onSave: () => void;
  onNew: () => void;
  onImport: () => void;
  onExport: () => void;
  onSchema: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTour?: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  const toggle = () => {
    if (wrapRef.current) setRect(wrapRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  // Fixed-position popover anchored off the trigger's rect, right-aligned so it
  // never spills past the header's right edge (the trigger sits at the far right).
  const width = 210;
  const menuPos: React.CSSProperties = rect
    ? { top: rect.bottom + 4, left: Math.max(8, rect.right - width), width }
    : {};

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: "none" }}>
      <Button
        variant={open ? "outline" : "ghost"}
        size="sm"
        icon={<MoreHorizontal size={16} aria-hidden />}
        title="Aksi lainnya"
        onClick={toggle}
        style={{ padding: "7px 11px" }}
      />
      {open ? (
        <div
          role="menu"
          style={{
            position: "fixed",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            padding: "6px",
            background: "var(--card)",
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow, 0 8px 24px rgba(0,0,0,.16))",
            ...menuPos,
          }}
        >
          <EditorActionRows
            onSave={onSave}
            onNew={onNew}
            onImport={onImport}
            onExport={onExport}
            onSchema={onSchema}
            onUndo={onUndo}
            onRedo={onRedo}
            onTour={onTour}
            canUndo={canUndo}
            canRedo={canRedo}
            onPick={pick}
          />
        </div>
      ) : null}
    </div>
  );
}

// The shared action rows — used by the desktop ⋯ popover AND (on mobile) portaled
// into the ☰ drawer (see EditorHeaderActions), so the same actions live in both.
// onPick lets the popover close itself before running; the drawer just runs the fn.
export function EditorActionRows({
  onSave,
  onNew,
  onImport,
  onExport,
  onSchema,
  onUndo,
  onRedo,
  onTour,
  canUndo,
  canRedo,
  onPick,
}: {
  onSave: () => void;
  onNew: () => void;
  onImport: () => void;
  onExport: () => void;
  onSchema: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTour?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPick?: (fn: () => void) => void;
}) {
  const pick = onPick ?? ((fn: () => void) => fn());
  return (
    <>
      <MenuOption icon={<Undo2 size={16} aria-hidden />} title="Urungkan" desc="Undo (Ctrl/Cmd+Z)" disabled={!canUndo} onClick={() => pick(onUndo)} />
      <MenuOption icon={<Redo2 size={16} aria-hidden />} title="Ulangi" desc="Redo (Ctrl/Cmd+Shift+Z)" disabled={!canRedo} onClick={() => pick(onRedo)} />
      <div style={{ height: 1, margin: "3px 4px", background: "var(--border)" }} />
      <MenuOption icon={<Download size={16} aria-hidden />} title="Simpan Proyek" desc="Tulis ke penyimpanan" onClick={() => pick(onSave)} />
      <MenuOption icon={<Sparkles size={16} aria-hidden />} title="Proyek Baru" desc="Mulai proyek kosong" onClick={() => pick(onNew)} />
      <MenuOption icon={<Plus size={16} aria-hidden />} title="Impor" desc="Tempel / unggah data" onClick={() => pick(onImport)} />
      <MenuOption icon={<Download size={16} aria-hidden />} title="Ekspor proyek" desc="Unduh JSON proyek" onClick={() => pick(onExport)} />
      <MenuOption icon={<Braces size={16} aria-hidden />} title="Skema" desc="Lihat & unduh skema" onClick={() => pick(onSchema)} />
      {onTour ? <MenuOption icon={<GraduationCap size={16} aria-hidden />} title="Tur / Panduan" desc="Pandu langkah demi langkah" onClick={() => pick(onTour)} /> : null}
      <div style={{ height: 1, margin: "3px 4px", background: "var(--border)" }} />
      {/* Hard reload: unregister SW + purge Cache Storage + cache-busted reload. */}
      <MenuOption icon={<RotateCw size={16} aria-hidden />} title="Muat ulang versi" desc="Bersihkan cache & ambil versi terbaru" onClick={() => pick(() => void forceFreshReload())} />
    </>
  );
}

function MenuOption({
  icon,
  title,
  desc,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        textAlign: "left",
        border: 0,
        borderRadius: "var(--radius-sm)",
        padding: "8px 9px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        background: hover && !disabled ? "var(--muted)" : "transparent",
        color: "var(--foreground)",
      }}
    >
      <span
        style={{
          width: "26px",
          height: "26px",
          flex: "none",
          borderRadius: "7px",
          border: "var(--border-width) solid var(--border)",
          display: "grid",
          placeItems: "center",
          font: "600 11px var(--font-mono)",
          color: "var(--subtle-foreground)",
        }}
      >
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
        <span style={{ font: "700 12.5px var(--font-sans)", color: "var(--foreground)" }}>{title}</span>
        <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--muted-foreground)" }}>{desc}</span>
      </span>
    </button>
  );
}
