// app/useLibraryIo — the import / schema / export I/O for the library. Owns the
// modal + paste/file/extraction state, parses incoming AI JSON into the SSOT store
// (via the store's persistEntry), and the download/copy helpers. Split out of AppState.
"use client";
import React, { useCallback, useState } from "react";
import { Entry, Project, SchemaMode, SourceKind, aiPrompt, projFrame, schemaJson, toScenes, uid } from "@/lib/dataPrompt";
import { tr } from "@/i18n";

export function useLibraryIo(deps: {
  showToast: (m: string) => void;
  persistEntry: (en: Entry) => string;
  project: Project;
}) {
  const { showToast, persistEntry, project } = deps;

  const [importOpen, setImportOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [schemaMode, setSchemaMode] = useState<SchemaMode>("full");
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState("");
  const [extractSrc, setExtractSrc] = useState<SourceKind>("photo");
  const [ioMsg, setIoMsg] = useState("");
  const [ioOk, setIoOk] = useState(true);

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
      showToast(msg || tr("common.copied"));
    },
    [showToast]
  );

  const parseIncoming = useCallback(
    (text: string, source: SourceKind, ref: string) => {
      let obj: unknown;
      try {
        obj = JSON.parse(text);
      } catch {
        setIoMsg(tr("state.io.invalidJson"));
        setIoOk(false);
        return;
      }
      const scenes = toScenes(obj);
      if (!scenes || !scenes.length) {
        setIoMsg(tr("state.io.noScenes"));
        setIoOk(false);
        return;
      }
      const labels: Record<string, string> = {
        photo: tr("state.io.importPhoto"),
        youtube: tr("state.io.importYoutube"),
        file: tr("state.io.importFile"),
        paste: tr("state.io.importPaste"),
      };
      const o = obj as Record<string, unknown>;
      const nm = (o.name ? String(o.name).trim() : "") || labels[source] || tr("common.import");
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
      setIoMsg(tr("state.io.added", { s: scenes.length, f: fc }));
      setIoOk(true);
      setImportOpen(false);
      setPasteText("");
      showToast(tr("state.io.addedToast", { s: scenes.length, f: fc }));
    },
    [showToast, persistEntry]
  );

  const openImport = useCallback((tab?: string) => {
    setImportOpen(true);
    // A caller may pass a source hint (e.g. "photo" from "Buat dari gambar").
    if (tab === "photo" || tab === "youtube" || tab === "file" || tab === "paste") setExtractSrc(tab);
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
    setIoMsg(tr("state.io.sampleFilled"));
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
    showToast(tr("state.io.exported"));
  }, [project.scenes, download, showToast]);

  const extractPrompt = aiPrompt(extractSrc, schemaMode);

  return {
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
    copyExtractPrompt: () => copy(extractPrompt, tr("state.io.extractCopied")),
    ioMsg,
    ioOk,
    schemaOpen,
    closeSchema: () => setSchemaOpen(false),
    schemaMode,
    setSchemaMode,
    downloadSchema: () => {
      download("camera-angle-guide." + schemaMode + ".schema.json", schemaJson(schemaMode));
      showToast(tr("state.io.schemaDownloaded"));
    },
    copySchemaPrompt: () => copy(aiPrompt(extractSrc, schemaMode), tr("state.io.schemaCopied")),
  };
}
