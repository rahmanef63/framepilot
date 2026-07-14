"use client";
// AppState — the app-global context (shell sidebar + the DataPrompt library). Now a
// thin composition provider: the SSOT projects store lives in app/useLibraryStore and
// the import/schema/export I/O in app/useLibraryIo; this wires them + the shell/toast
// state into one AppContextValue (mirrors the state/editor/* decomposition). The
// public API — useApp(), AppStateProvider, EntryView, LibraryView — is unchanged.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Project, SRC_META, fmtWhen, seedProject } from "@/lib/dataPrompt";
import { useLibraryStore } from "./app/useLibraryStore";
import { useLibraryIo } from "./app/useLibraryIo";
import type { AppContextValue, EntryView, LibraryView } from "./app/types";

export type { EntryView, LibraryView } from "./app/types";

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppStateProvider");
  return ctx;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const nowRef = useRef(0);
  if (nowRef.current === 0) nowRef.current = Date.now();
  const now = nowRef.current;

  // DataPrompt library staging project — read-only, for export + the header stat.
  const [project] = useState<Project>(() => seedProject());

  // ---- shell ----
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // At/below the drawer breakpoint (≤820, matching globals.css) the open sidebar is a
  // fixed drawer that would otherwise cover content on load. Auto-collapse once on
  // mount when narrow (SSR renders open → hydration matches → then collapses).
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 820) setSidebarOpen(false);
  }, []);
  const [view, setView] = useState<LibraryView>("grid");

  // ---- toast (shared by the store + I/O) ----
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((m: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(m);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  // ---- library store (SSOT) + I/O ----
  const store = useLibraryStore({ now, showToast });
  const io = useLibraryIo({ showToast, persistEntry: store.persistEntry, refreshLocal: store.refreshLocal, project });

  // ---- derived card view models (single grid, no filter / selection / view switch) ----
  const entriesAll = useMemo<EntryView[]>(() => {
    return store.entries.map((en): EntryView => {
      const scenes = en.data.scenes;
      const frameCount = scenes.reduce((a, sc) => a + sc.frames.length, 0);
      // Examples get a clear "Contoh" badge via the existing source-badge UI.
      const sm = store.showingExamples
        ? { glyph: "★", label: "Contoh", tone: "outline" as const }
        : SRC_META[en.source] || SRC_META.paste;
      const f0 = scenes[0].frames[0];
      return {
        id: en.id,
        name: en.name,
        when: fmtWhen(en.created, now),
        sourceGlyph: sm.glyph,
        sourceLabel: sm.label,
        sourceTone: sm.tone,
        thumbCaption: sm.label.toLowerCase(),
        sceneCount: scenes.length,
        frameCount,
        pAz: f0.az,
        pEl: f0.el,
        pDist: f0.dist,
        pRoll: f0.roll ?? 0,
        pLens: f0.lens,
        pSubj: f0.subj ?? "person",
        example: store.showingExamples,
        onOpenStudio: () => store.openInStudio3d(en.id),
        onDelete: () => store.del(en.id),
      };
    });
  }, [store.entries, store.showingExamples, now, store.openInStudio3d, store.del]);

  const entriesCountText = entriesAll.length + " item";
  const totalShots = project.scenes.reduce((a, sc) => a + sc.frames.length, 0);
  const projStats = project.scenes.length + " scene · " + totalShots + " shot";

  const value: AppContextValue = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((o) => !o),
    entriesAll,
    view,
    setView,
    entriesCountText,
    projStats,
    project,
    ...io,
    toast,
    showToast,
  };

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "var(--background)",
          color: "var(--muted-foreground)",
          font: "600 12px var(--font-mono)",
        }}
      >
        Memuat · Loading…
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
