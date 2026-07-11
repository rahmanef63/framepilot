"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  Entry,
  Project,
  SchemaMode,
  SourceKind,
  aiPrompt,
  fmtWhen,
  projFrame,
  schemaJson,
  seed,
  seedProject,
  SRC_META,
  toScenes,
  uid,
} from "@/lib/dataPrompt";
import {
  EditorProject,
  ensureProjectShape,
  projectToEntry,
  projectHasFrames,
  toEditorProject,
} from "@/lib/editorModel";
import {
  AUTOKEY,
  PROJECTS_CHANGED,
  SavedEntry,
  deleteProject,
  listProjects,
  saveProject,
} from "@/lib/editorStorage";

// Lean card view-model for the single /library grid. Only the fields the collapsed
// card actually renders (name, scene/shot counts, updated date, cheap 3D thumbnail
// via the pAz/… first-frame snapshot, source badge) plus its two actions.
export interface EntryView {
  id: string;
  name: string;
  when: string;
  sourceGlyph: string;
  sourceLabel: string;
  sourceTone: "new" | "highlight" | "outline" | "default";
  thumbCaption: string;
  sceneCount: number;
  frameCount: number;
  pAz: number;
  pEl: number;
  pDist: number;
  pRoll: number;
  pLens: number;
  pSubj: string;
  /** true = a read-only "Contoh" seed demo (shown only when the store is empty). */
  example: boolean;
  onOpenStudio: () => void;
  onDelete: () => void;
}

interface AppContextValue {
  // shell
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // library list (single view of the SSOT store)
  entriesAll: EntryView[];
  entriesCountText: string;
  projStats: string;
  /** DataPrompt library staging project — read-only, for export + the header stat. */
  project: Project;
  // header actions
  openImport: (tab?: string) => void;
  openSchema: () => void;
  exportProject: () => void;
  // import modal (single collapsed panel)
  importOpen: boolean;
  closeImport: () => void;
  pasteText: string;
  setPasteText: (v: string) => void;
  doParsePaste: () => void;
  fillSamplePaste: () => void;
  fileName: string;
  onFileTab: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** source hint that tunes the collapsible extraction-prompt helper. */
  extractSrc: SourceKind;
  setExtractSrc: (s: SourceKind) => void;
  extractPrompt: string;
  copyExtractPrompt: () => void;
  ioMsg: string;
  ioOk: boolean;
  // schema modal
  schemaOpen: boolean;
  closeSchema: () => void;
  schemaMode: SchemaMode;
  setSchemaMode: (m: SchemaMode) => void;
  downloadSchema: () => void;
  copySchemaPrompt: () => void;
  // toast
  toast: string;
  showToast: (m: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppStateProvider");
  return ctx;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const nowRef = useRef(0);
  if (nowRef.current === 0) nowRef.current = Date.now();
  const now = nowRef.current;

  // The persistent projects store is the SSOT for the library. `seedEntries` is
  // ONLY the "Contoh" demo shown as an empty-state (see showingExamples). Imports
  // and Studio 3D saves write the store, NOT this state.
  const [seedEntries, setSeedEntries] = useState<Entry[]>(() => seed(now));
  const [project] = useState<Project>(() => seedProject());

  // ---- persistent projects store (SSOT) ----
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const saveMutation = useMutation(api.projects.save);
  const removeMutation = useMutation(api.projects.remove);
  // Signed-in: reactive metadata list — a Studio 3D save bumps updatedAt and this
  // re-runs, so the library updates live. Anonymous: skipped, localStorage rules.
  const cloudList = useQuery(api.projects.listMine, isAuthenticated ? {} : "skip");
  const [cloudDocs, setCloudDocs] = useState<Record<string, EditorProject>>({});
  // Anonymous: the localStorage saved-projects list, re-read on mount / focus /
  // the projects-changed event that editorStorage dispatches on every save.
  const [localSaved, setLocalSaved] = useState<SavedEntry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [importOpen, setImportOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [schemaMode, setSchemaMode] = useState<SchemaMode>("full");

  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState("");
  const [extractSrc, setExtractSrc] = useState<SourceKind>("photo");
  const [ioMsg, setIoMsg] = useState("");
  const [ioOk, setIoOk] = useState(true);
  const [toast, setToast] = useState("");

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---- anonymous store: re-read localStorage on mount / focus / save event ----
  useEffect(() => {
    const read = () => setLocalSaved(listProjects());
    read();
    window.addEventListener("focus", read);
    window.addEventListener(PROJECTS_CHANGED, read);
    return () => {
      window.removeEventListener("focus", read);
      window.removeEventListener(PROJECTS_CHANGED, read);
    };
  }, []);

  // ---- signed-in store: fetch each cloud project's doc (get is owner-scoped).
  // Re-runs whenever listMine changes (reactive), so a Studio 3D save refreshes
  // the docs and the library live. Few projects per user → simple full refetch.
  useEffect(() => {
    if (!isAuthenticated || !cloudList) {
      setCloudDocs({});
      return;
    }
    let cancelled = false;
    (async () => {
      const next: Record<string, EditorProject> = {};
      for (const p of cloudList) {
        try {
          const doc = await convex.query(api.projects.get, { id: p._id });
          if (doc) next[p._id] = ensureProjectShape(JSON.parse(doc));
        } catch {
          /* skip unreadable */
        }
      }
      if (!cancelled) setCloudDocs(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, cloudList, convex]);

  // ---- the library's real content = the persistent store, converted to Entry.
  // Signed-in reads Convex; anonymous reads localStorage. Empty projects (no
  // frames) are hidden. This is the SSOT; seedEntries are examples-only.
  const storeEntries = useMemo<Entry[]>(() => {
    if (isAuthenticated && cloudList) {
      return cloudList
        .map((p) => {
          const doc = cloudDocs[p._id];
          if (!doc || !projectHasFrames(doc)) return null;
          return projectToEntry(doc, {
            id: "cloud:" + p._id,
            source: doc.source || "studio",
            created: p.updatedAt,
          });
        })
        .filter((e): e is Entry => e !== null);
    }
    return localSaved
      .filter((s) => projectHasFrames(s.project))
      .map((s) =>
        projectToEntry(s.project, {
          id: "local:" + s.id,
          source: s.project.source || "studio",
          created: s.updated,
        })
      );
  }, [isAuthenticated, cloudList, cloudDocs, localSaved]);

  // Seed demos are shown ONLY when the store has no real projects (empty-state).
  const showingExamples = storeEntries.length === 0;
  const entries = showingExamples ? seedEntries : storeEntries;

  const showToast = useCallback((m: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(m);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const download = useCallback((name: string, text: string) => {
    const b = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 400);
  }, []);

  const copy = useCallback(
    (text: string, msg?: string) => {
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(text);
      } catch {
        /* ignore */
      }
      showToast(msg || "Disalin · Copied");
    },
    [showToast]
  );

  // Persist a library Entry to the SSOT projects store (localStorage always +
  // Convex when signed in). Reuses toEditorProject (Entry -> v2) and tags the
  // origin. Returns the localStorage id so callers can refresh the list.
  const persistEntry = useCallback(
    (en: Entry): string => {
      const editorProj = toEditorProject(en);
      editorProj.name = en.name;
      editorProj.source = en.source;
      const res = saveProject(editorProj); // dispatches PROJECTS_CHANGED
      if (isAuthenticated) {
        saveMutation({ name: editorProj.name || "Proyek", doc: JSON.stringify(editorProj) }).catch(() => {});
      }
      return res.id;
    },
    [isAuthenticated, saveMutation]
  );

  // --- import / parse ---
  const parseIncoming = useCallback(
    (text: string, source: SourceKind, ref: string) => {
      let obj: unknown;
      try {
        obj = JSON.parse(text);
      } catch {
        setIoMsg("JSON tidak valid · Invalid JSON");
        setIoOk(false);
        return;
      }
      const scenes = toScenes(obj);
      if (!scenes || !scenes.length) {
        setIoMsg("Tidak ada scene/frame ditemukan · No scenes or frames found");
        setIoOk(false);
        return;
      }
      const labels: Record<string, string> = {
        photo: "Impor foto",
        youtube: "Impor YouTube",
        file: "Impor file",
        paste: "Impor tempel",
      };
      const o = obj as Record<string, unknown>;
      const nm = (o.name ? String(o.name).trim() : "") || labels[source] || "Impor";
      const en: Entry = {
        id: uid(),
        name: nm,
        en: source.charAt(0).toUpperCase() + source.slice(1) + " import",
        source,
        ref: ref || "",
        created: Date.now(),
        data: { scenes },
      };
      const fc = scenes.reduce((a, sc) => a + sc.frames.length, 0);

      // Import persistence: write the SAME projects store the Studio 3D editor uses,
      // so the new prompt shows in /library and survives reload (SSOT).
      persistEntry(en);
      setLocalSaved(listProjects());
      setIoMsg("Ditambahkan · added: " + scenes.length + " scene · " + fc + " shot");
      setIoOk(true);
      setImportOpen(false);
      setPasteText("");
      showToast("Data prompt ditambahkan — " + scenes.length + " scene · " + fc + " shot");
    },
    [showToast, persistEntry]
  );

  const openImport = useCallback((tab?: string) => {
    setImportOpen(true);
    // A caller may pass a source hint (e.g. "photo" from "Buat dari gambar") to
    // preselect the extraction-prompt helper — there are no tabs anymore.
    if (tab === "photo" || tab === "youtube" || tab === "file" || tab === "paste") {
      setExtractSrc(tab);
    }
    setIoMsg("");
  }, []);

  const fillSamplePaste = useCallback(() => {
    const o = {
      schema: "camera-angle-guide/v2",
      name: "Contoh — Master + CU",
      scenes: [
        {
          name: "Wawancara",
          frames: [
            { name: "Master", angle: "EYE LEVEL", shot: "MEDIUM SHOT", lens: 50, meta: { intent: "Perkenalan", action: "Duduk menghadap kamera", movement: "Static / Locked-off" } },
            { name: "CU", angle: "EYE LEVEL", shot: "CLOSE-UP", lens: 85, meta: { movement: "Handheld" } },
          ],
        },
      ],
    };
    setPasteText(JSON.stringify(o, null, 2));
    setIoMsg("Contoh diisi — klik Parse · Sample filled");
    setIoOk(true);
  }, []);

  const onFileTab = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        setFileName(f.name);
        parseIncoming(String(r.result), "file", f.name);
      };
      r.readAsText(f);
      e.target.value = "";
    },
    [parseIncoming]
  );

  // Delete routes to the store (localStorage / Convex); seed examples are removed
  // from in-memory demo state.
  const del = useCallback(
    (id: string) => {
      if (id.startsWith("local:")) {
        deleteProject(id.slice(6));
        setLocalSaved(listProjects());
      } else if (id.startsWith("cloud:")) {
        removeMutation({ id: id.slice(6) as Id<"projects"> }).catch(() => {});
      } else {
        setSeedEntries((cur) => cur.filter((e) => e.id !== id));
      }
      showToast("Data prompt dihapus · deleted");
    },
    [removeMutation, showToast]
  );

  // --- library -> Studio 3D handoff ---
  // Convert the entry to an EditorProject (reuse toEditorProject — no duplicate
  // conversion logic) and seed the editor's autosave key, which EditorStateProvider
  // hydrates from on mount (loadAutosave -> swapProject). Then navigate to /editor.
  const openInStudio3d = useCallback(
    (id: string) => {
      let proj: EditorProject | null = null;
      if (id.startsWith("local:")) {
        const se = localSaved.find((s) => "local:" + s.id === id);
        proj = se ? se.project : null;
      } else if (id.startsWith("cloud:")) {
        proj = cloudDocs[id.slice(6)] ?? null;
      } else {
        const en = entries.find((e) => e.id === id);
        if (en) proj = toEditorProject(en);
      }
      if (!proj) return;
      try {
        localStorage.setItem(AUTOKEY, JSON.stringify(proj));
      } catch {
        /* ignore quota/private-mode */
      }
      router.push("/editor");
    },
    [entries, localSaved, cloudDocs, router]
  );

  // --- export (header) ---
  const exportProject = useCallback(() => {
    const proj = {
      schema: "camera-angle-guide/v2",
      name: "Camera Angle Guide — Data Prompt",
      settings: { aspectRatio: "16:9", fps: 24, sensor: "Full Frame" },
      scenes: project.scenes.map((sc) => ({
        id: uid(),
        name: sc.name,
        notes: "",
        frameSeq: sc.frames.length + 1,
        collapsed: false,
        notesOpen: false,
        frames: sc.frames.map((fr) => projFrame(fr)),
      })),
      activeSceneId: null,
    };
    download("camera-angle-guide-project.json", JSON.stringify(proj, null, 2));
    showToast("Proyek diekspor untuk Camera Angle Guide Pro");
  }, [project.scenes, download, showToast]);

  // --- derived view models (single grid, no filter / selection / view switch) ---
  const entriesAll = useMemo<EntryView[]>(() => {
    return entries.map((en): EntryView => {
      const scenes = en.data.scenes;
      const frameCount = scenes.reduce((a, sc) => a + sc.frames.length, 0);
      // Examples get a clear "Contoh" badge via the existing source-badge UI.
      const sm = showingExamples
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
        example: showingExamples,
        onOpenStudio: () => openInStudio3d(en.id),
        onDelete: () => del(en.id),
      };
    });
  }, [entries, showingExamples, now, openInStudio3d, del]);

  const entriesCountText = entriesAll.length + " item";
  const totalShots = project.scenes.reduce((a, sc) => a + sc.frames.length, 0);
  const projStats = project.scenes.length + " scene · " + totalShots + " shot";
  const extractPrompt = aiPrompt(extractSrc, schemaMode);

  const value: AppContextValue = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((o) => !o),
    entriesAll,
    entriesCountText,
    projStats,
    project,
    openImport,
    openSchema: () => setSchemaOpen(true),
    exportProject,
    importOpen,
    closeImport: () => setImportOpen(false),
    pasteText,
    setPasteText,
    doParsePaste: () => parseIncoming(pasteText, extractSrc, ""),
    fillSamplePaste,
    fileName,
    onFileTab,
    extractSrc,
    setExtractSrc,
    extractPrompt,
    copyExtractPrompt: () => copy(extractPrompt, "Prompt ekstraksi disalin · copied"),
    ioMsg,
    ioOk,
    schemaOpen,
    closeSchema: () => setSchemaOpen(false),
    schemaMode,
    setSchemaMode,
    downloadSchema: () => {
      download("camera-angle-guide." + schemaMode + ".schema.json", schemaJson(schemaMode));
      showToast("Skema JSON diunduh · downloaded");
    },
    copySchemaPrompt: () => copy(aiPrompt(extractSrc, schemaMode), "Prompt + skema disalin · copied"),
    toast,
    showToast,
  };

  if (!mounted) {
    return (
      <div
        style={{
          height: "100vh",
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
