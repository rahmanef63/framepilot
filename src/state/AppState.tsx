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
import {
  Entry,
  Project,
  RawFrame,
  SchemaMode,
  SourceKind,
  aiPrompt,
  entryProject,
  fillRows,
  fmtWhen,
  projFrame,
  raw,
  schemaJson,
  seed,
  seedProject,
  SRC_META,
  toScenes,
  uid,
} from "@/lib/dataPrompt";

export type ViewMode = "grid" | "table" | "split";

export interface FrameRaw {
  label: string;
  az: number;
  el: number;
  dist: number;
  roll: number;
  lens: number;
  subj: string;
  angle: string;
  shot: string;
  movement: string;
}

export interface EntryView {
  id: string;
  source: SourceKind;
  name: string;
  en: string;
  ref: string;
  when: string;
  sourceGlyph: string;
  sourceLabel: string;
  sourceTone: "new" | "highlight" | "outline" | "default";
  thumbCaption: string;
  sceneCount: number;
  frameCount: number;
  angle: string;
  shot: string;
  lens: string;
  movement: string;
  fillText: string;
  fillPct: number;
  fillRows: ReturnType<typeof fillRows>;
  framesFlat: { scene: string; name: string; angle: string; shot: string; lens: string; movement: string }[];
  jsonPreview: string;
  framesRaw: FrameRaw[];
  pAz: number;
  pEl: number;
  pDist: number;
  pRoll: number;
  pLens: number;
  pSubj: string;
  selected: boolean;
  active: boolean;
  rowBg: string;
  listBg: string;
  listBorder: string;
  onToggle: () => void;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPick: () => void;
  on3d: () => void;
}

interface AppContextValue {
  // state
  view: ViewMode;
  setView: (v: ViewMode) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  sourceFilter: string;
  setSourceFilter: (k: string) => void;
  clearFilter: () => void;
  // derived
  entriesAll: EntryView[];
  filtered: EntryView[];
  counts: Record<string, number>;
  activeEntry: EntryView | null;
  selectedCount: number;
  projStats: string;
  filterActive: boolean;
  filterLabel: string;
  entriesCountText: string;
  // selection bulk
  selectedIds: () => string[];
  bulkApply: () => void;
  bulkExport: () => void;
  bulkDelete: () => void;
  clearSel: () => void;
  // header actions
  openImport: (tab?: string) => void;
  openSchema: () => void;
  exportProject: () => void;
  importLibrary: () => void;
  // import modal
  importOpen: boolean;
  closeImport: () => void;
  importTab: string;
  setImportTab: (k: string) => void;
  pasteText: string;
  setPasteText: (v: string) => void;
  doParsePaste: () => void;
  fillSamplePaste: () => void;
  fileName: string;
  onFileTab: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ytUrl: string;
  setYtUrl: (v: string) => void;
  copyYt: () => void;
  ytJson: string;
  setYtJson: (v: string) => void;
  doParseYt: () => void;
  fillSampleYt: () => void;
  photoDataUrl: string;
  onPhotoTab: (e: React.ChangeEvent<HTMLInputElement>) => void;
  copyPhoto: () => void;
  photoJson: string;
  setPhotoJson: (v: string) => void;
  doParsePhoto: () => void;
  ioMsg: string;
  ioOk: boolean;
  // schema modal
  schemaOpen: boolean;
  closeSchema: () => void;
  schemaMode: SchemaMode;
  setSchemaMode: (m: SchemaMode) => void;
  downloadSchema: () => void;
  copySchemaPrompt: () => void;
  // apply modal
  applyOpen: boolean;
  closeApply: () => void;
  applyCount: number;
  applyMode: "merge" | "new";
  setApplyMode: (m: "merge" | "new") => void;
  scenesForApply: { id: string; name: string }[];
  applySceneId: string;
  setApplyScene: (id: string) => void;
  confirmApply: () => void;
  // edit modal
  editOpen: boolean;
  closeEdit: () => void;
  editName: string;
  setEditName: (v: string) => void;
  editEn: string;
  setEditEn: (v: string) => void;
  saveEdit: () => void;
  // 3d modal
  view3dOpen: boolean;
  openView3d: () => void;
  closeView3d: () => void;
  view3dFrame: number;
  setView3dFrame: (i: number) => void;
  cur3d: FrameRaw & { movement: string };
  hasCur3d: boolean;
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

const F_LABELS: Record<string, string> = {
  all: "Semua",
  photo: "Foto",
  youtube: "YouTube",
  file: "File",
  paste: "Tempel",
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const nowRef = useRef(0);
  if (nowRef.current === 0) nowRef.current = Date.now();
  const now = nowRef.current;

  const [entries, setEntries] = useState<Entry[]>(() => seed(now));
  const [project, setProject] = useState<Project>(() => seedProject());
  const [view, setView] = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importTab, setImportTabState] = useState("paste");
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [schemaMode, setSchemaMode] = useState<SchemaMode>("full");
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMode, setApplyMode] = useState<"merge" | "new">("merge");
  const [applySceneId, setApplySceneId] = useState("p1");
  const [applyIds, setApplyIds] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEn, setEditEn] = useState("");
  const [view3dOpen, setView3dOpen] = useState(false);
  const [view3dFrame, setView3dFrame] = useState(0);

  const [pasteText, setPasteText] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [ytJson, setYtJson] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoJson, setPhotoJson] = useState("");
  const [fileName, setFileName] = useState("");
  const [ioMsg, setIoMsg] = useState("");
  const [ioOk, setIoOk] = useState(true);
  const [toast, setToast] = useState("");

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    // default active entry = first seeded entry
    setActiveId((cur) => cur ?? (entries[0] ? entries[0].id : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setEntries((cur) => [en, ...cur]);
      setActiveId(en.id);
      setSourceFilter("all");
      setIoMsg("Ditambahkan · added: " + scenes.length + " scene · " + fc + " shot");
      setIoOk(true);
      setImportOpen(false);
      setPasteText("");
      setYtJson("");
      setPhotoJson("");
      showToast("Data prompt ditambahkan — " + scenes.length + " scene · " + fc + " shot");
    },
    [showToast]
  );

  const openImport = useCallback((tab?: string) => {
    setImportOpen(true);
    setImportTabState(tab || "paste");
    setIoMsg("");
  }, []);

  const setImportTab = useCallback((k: string) => {
    setImportTabState(k);
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

  const fillSampleYt = useCallback(() => {
    const o = {
      schema: "camera-angle-guide/v2",
      name: "Estab. + orbit",
      scenes: [
        { name: "Wide", frames: [{ name: "Estab", angle: "BIRD'S EYE", shot: "EXTREME WIDE SHOT", lens: 24, meta: { movement: "Crane / Jib", intent: "Menetapkan lokasi" } }] },
        { name: "Orbit", frames: [{ name: "Arc", angle: "HIGH ANGLE", shot: "WIDE SHOT", lens: 35, meta: { movement: "Orbit / Arc" } }] },
      ],
    };
    setYtJson(JSON.stringify(o, null, 2));
    setIoMsg("Contoh diisi — klik Parse");
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

  const onPhotoTab = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setPhotoName(f.name);
      setPhotoDataUrl(String(r.result));
    };
    r.readAsDataURL(f);
    e.target.value = "";
  }, []);

  // --- edit / delete ---
  const openEdit = useCallback(
    (id: string) => {
      const en = entries.find((e) => e.id === id);
      if (!en) return;
      setEditOpen(true);
      setEditId(id);
      setEditName(en.name);
      setEditEn(en.en || "");
    },
    [entries]
  );

  const saveEdit = useCallback(() => {
    setEntries((cur) => cur.map((e) => (e.id === editId ? { ...e, name: editName, en: editEn } : e)));
    setEditOpen(false);
    showToast("Perubahan disimpan · saved");
  }, [editId, editName, editEn, showToast]);

  const del = useCallback(
    (id: string) => {
      setSelected((sel) => {
        const m = { ...sel };
        delete m[id];
        return m;
      });
      setEntries((cur) => cur.filter((e) => e.id !== id));
      setActiveId((cur) => {
        if (cur !== id) return cur;
        const rest = entries.filter((e) => e.id !== id);
        return rest[0] ? rest[0].id : null;
      });
      showToast("Data prompt dihapus · deleted");
    },
    [entries, showToast]
  );

  const selectedIds = useCallback(
    () => entries.filter((e) => selected[e.id]).map((e) => e.id),
    [entries, selected]
  );

  // --- apply ---
  const openApply = useCallback(
    (ids?: string[]) => {
      const list = ids && ids.length ? ids : selectedIds();
      if (!list.length) {
        showToast("Pilih dulu · select first");
        return;
      }
      setApplyOpen(true);
      setApplyIds(list);
      setApplyMode("merge");
      setApplySceneId(project.scenes[0].id);
    },
    [selectedIds, showToast, project.scenes]
  );

  const confirmApply = useCallback(() => {
    setProject((s) => {
      const chosen = entries.filter((e) => applyIds.indexOf(e.id) >= 0);
      const scenes = s.scenes.map((sc) => ({ ...sc, frames: sc.frames.slice() }));
      if (applyMode === "merge") {
        const tgt = scenes.find((sc) => sc.id === applySceneId) || scenes[0];
        chosen.forEach((en) => en.data.scenes.forEach((sc) => sc.frames.forEach((fr) => tgt.frames.push(raw(fr)))));
      } else {
        chosen.forEach((en) =>
          en.data.scenes.forEach((sc) =>
            scenes.push({ id: uid(), name: sc.name, frames: sc.frames.map((fr) => raw(fr)) })
          )
        );
      }
      return { ...s, scenes };
    });
    setApplyOpen(false);
    setSelected({});
    showToast("Diterapkan ke proyek · applied");
  }, [entries, applyIds, applyMode, applySceneId, showToast]);

  // --- export / library ---
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

  const exportLibrary = useCallback(() => {
    const ids = selectedIds();
    const list = ids.length ? entries.filter((e) => ids.indexOf(e.id) >= 0) : entries;
    download("data-prompt-library.json", JSON.stringify({ schema: "data-prompt-library/v1", entries: list }, null, 2));
    showToast(list.length + " data prompt diekspor · exported");
  }, [selectedIds, entries, download, showToast]);

  const importLibrary = useCallback(() => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json,application/json";
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const o = JSON.parse(String(r.result));
          if (o && Array.isArray(o.entries)) {
            setEntries((cur) => o.entries.map((e: Entry) => ({ ...e, id: e.id || uid() })).concat(cur));
            showToast("Pustaka diimpor · library imported");
          } else {
            parseIncoming(String(r.result), "file", f.name);
          }
        } catch {
          showToast("File tidak valid · invalid file");
        }
      };
      r.readAsText(f);
    };
    inp.click();
  }, [parseIncoming, showToast]);

  // --- selection helpers ---
  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  // --- derived view models ---
  const derived = useMemo(() => {
    const view = (en: Entry): EntryView => {
      const scenes = en.data.scenes;
      const f = scenes[0].frames[0];
      const frameCount = scenes.reduce((a, sc) => a + sc.frames.length, 0);
      const rows = fillRows(en);
      const fc = rows.filter((r) => r.filled).length;
      const sm = SRC_META[en.source] || SRC_META.paste;
      const isSel = !!selected[en.id];
      const isActive = activeId === en.id;
      const framesFlat: EntryView["framesFlat"] = [];
      scenes.forEach((sc) =>
        sc.frames.forEach((fr) =>
          framesFlat.push({ scene: sc.name, name: fr.name, angle: fr.angle, shot: fr.shot, lens: fr.lens + "mm", movement: fr.meta.movement })
        )
      );
      const framesRaw: FrameRaw[] = [];
      scenes.forEach((sc) =>
        sc.frames.forEach((fr) =>
          framesRaw.push({
            label: sc.name + " · " + fr.name,
            az: fr.az,
            el: fr.el,
            dist: fr.dist,
            roll: fr.roll || 0,
            lens: fr.lens,
            subj: fr.subj || "person",
            angle: fr.angle,
            shot: fr.shot,
            movement: fr.meta.movement,
          })
        )
      );
      const pf = framesRaw[0] || { az: 30, el: 4, dist: 3, roll: 0, lens: 50, subj: "person" };
      return {
        id: en.id,
        source: en.source,
        name: en.name,
        en: en.en || "",
        ref: en.ref || "",
        when: fmtWhen(en.created, now),
        sourceGlyph: sm.glyph,
        sourceLabel: sm.label,
        sourceTone: sm.tone,
        thumbCaption: sm.label.toLowerCase(),
        sceneCount: scenes.length,
        frameCount,
        angle: f.angle,
        shot: f.shot,
        lens: f.lens + "mm",
        movement: f.meta.movement,
        fillText: fc + "/" + rows.length,
        fillPct: Math.round((fc / rows.length) * 100),
        fillRows: rows,
        framesFlat,
        jsonPreview: JSON.stringify(entryProject(en), null, 2),
        framesRaw,
        pAz: pf.az,
        pEl: pf.el,
        pDist: pf.dist,
        pRoll: pf.roll ?? 0,
        pLens: pf.lens,
        pSubj: pf.subj ?? "person",
        selected: isSel,
        active: isActive,
        rowBg: isSel ? "var(--primary-soft)" : "transparent",
        listBg: isActive ? "var(--primary-soft)" : "var(--card)",
        listBorder: isActive ? "var(--primary)" : "var(--border)",
        onToggle: () => toggleSelect(en.id),
        onApply: () => openApply([en.id]),
        onEdit: () => openEdit(en.id),
        onDelete: () => del(en.id),
        onPick: () => setActiveId(en.id),
        on3d: () => {
          setActiveId(en.id);
          setView3dOpen(true);
          setView3dFrame(0);
        },
      };
    };

    const entriesAll = entries.map(view);
    const counts: Record<string, number> = { all: entriesAll.length, photo: 0, youtube: 0, file: 0, paste: 0 };
    entriesAll.forEach((e) => {
      if (counts[e.source] != null) counts[e.source]++;
    });
    const filtered = sourceFilter === "all" ? entriesAll : entriesAll.filter((e) => e.source === sourceFilter);
    const activeEntry = filtered.find((e) => e.id === activeId) || filtered[0] || null;
    const selectedCount = entriesAll.filter((e) => e.selected).length;
    return { entriesAll, counts, filtered, activeEntry, selectedCount };
  }, [entries, selected, activeId, sourceFilter, now, toggleSelect, openApply, openEdit, del]);

  const { entriesAll, counts, filtered, activeEntry, selectedCount } = derived;

  const totalShots = project.scenes.reduce((a, sc) => a + sc.frames.length, 0);
  const projStats = project.scenes.length + " scene · " + totalShots + " shot";
  const filterActive = sourceFilter !== "all";
  const filterLabel = F_LABELS[sourceFilter];
  const entriesCountText = filterActive
    ? filtered.length + " dari " + entriesAll.length + " item"
    : entriesAll.length + " item";

  const v3idx = activeEntry ? Math.max(0, Math.min(view3dFrame, activeEntry.framesRaw.length - 1)) : 0;
  const v3f = activeEntry ? activeEntry.framesRaw[v3idx] : null;
  const cur3d = v3f || {
    label: "—",
    az: 30,
    el: 4,
    dist: 3,
    roll: 0,
    lens: 50,
    subj: "person",
    angle: "—",
    shot: "—",
    movement: "—",
  };

  const value: AppContextValue = {
    view,
    setView,
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((o) => !o),
    sourceFilter,
    setSourceFilter,
    clearFilter: () => setSourceFilter("all"),
    entriesAll,
    filtered,
    counts,
    activeEntry,
    selectedCount,
    projStats,
    filterActive,
    filterLabel,
    entriesCountText,
    selectedIds,
    bulkApply: () => openApply(),
    bulkExport: () => exportLibrary(),
    bulkDelete: () => selectedIds().forEach((id) => del(id)),
    clearSel: () => setSelected({}),
    openImport,
    openSchema: () => setSchemaOpen(true),
    exportProject,
    importLibrary,
    importOpen,
    closeImport: () => setImportOpen(false),
    importTab,
    setImportTab,
    pasteText,
    setPasteText,
    doParsePaste: () => parseIncoming(pasteText, "paste", ""),
    fillSamplePaste,
    fileName,
    onFileTab,
    ytUrl,
    setYtUrl,
    copyYt: () => copy(aiPrompt("youtube", schemaMode), "Prompt YouTube disalin · copied"),
    ytJson,
    setYtJson,
    doParseYt: () => parseIncoming(ytJson, "youtube", ytUrl),
    fillSampleYt,
    photoDataUrl,
    onPhotoTab,
    copyPhoto: () => copy(aiPrompt("photo", schemaMode), "Prompt foto disalin · copied"),
    photoJson,
    setPhotoJson,
    doParsePhoto: () => parseIncoming(photoJson, "photo", photoName),
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
    copySchemaPrompt: () => copy(aiPrompt("photo", schemaMode), "Prompt + skema disalin · copied"),
    applyOpen,
    closeApply: () => setApplyOpen(false),
    applyCount: applyIds.length,
    applyMode,
    setApplyMode,
    scenesForApply: project.scenes.map((sc) => ({ id: sc.id, name: sc.name + " (" + sc.frames.length + " shot)" })),
    applySceneId,
    setApplyScene: setApplySceneId,
    confirmApply,
    editOpen,
    closeEdit: () => setEditOpen(false),
    editName,
    setEditName,
    editEn,
    setEditEn,
    saveEdit,
    view3dOpen,
    openView3d: () => {
      setView3dOpen(true);
      setView3dFrame(0);
    },
    closeView3d: () => setView3dOpen(false),
    view3dFrame: v3idx,
    setView3dFrame,
    cur3d,
    hasCur3d: !!v3f,
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
