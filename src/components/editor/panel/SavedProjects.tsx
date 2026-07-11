"use client";
// SavedProjects.tsx — the "Proyek Tersimpan" group inside the Kontrol panel
// (concept #savedList + .io-row ~741-753). Lists localStorage-backed projects
// (Muat / Hapus-2×) and the export/import row wired to editorExport
// (JSON · Shot List CSV · Prompt TXT · Storyboard PNG · Impor JSON). All project
// data comes from useEditor(); the pure lib does the Blob/file work.

import React, { useEffect, useRef } from "react";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import {
  exportJSON,
  exportCSV,
  exportPromptTxt,
  exportStoryboardPNG,
  importProject,
  downloadBlob,
  safeFileName,
} from "@/lib/editorExport";

// concept armDelete — first click arms (✕?), second within 2600ms confirms.
function ArmDelete({ title, onConfirm }: { title: string; onConfirm: () => void }) {
  const [armed, setArmed] = React.useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <button
      className={"small danger" + (armed ? " arm" : "")}
      title={title}
      onClick={() => {
        if (armed) {
          if (timer.current) clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 2600);
      }}
    >
      {armed ? "✕?" : "✕"}
    </button>
  );
}

export function SavedProjects() {
  const ctx = useEditor();
  const { showToast, project: libraryProject } = useApp();
  const fileRef = useRef<HTMLInputElement | null>(null);

  // One-way handoff: pull the scenes staged in the DataPrompt library ("Terapkan")
  // into the editor. Replaces the current editor project, so confirm first.
  const doImportLibrary = () => {
    const hasFrames = libraryProject?.scenes?.some((s) => s.frames?.length);
    if (!hasFrames) {
      showToast("Pustaka masih kosong — terapkan data di layar Pustaka dulu");
      return;
    }
    if (!confirm("Impor scene dari Pustaka? Proyek editor saat ini akan diganti.")) return;
    ctx.importFromLibrary(libraryProject);
    showToast("Diimpor dari Pustaka");
  };

  // hydrate the saved-projects list on mount (concept renderSavedList)
  useEffect(() => {
    ctx.refreshSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const project = () => ctx.exportProjectObject();

  const doJSON = () => {
    const p = project();
    downloadBlob(safeFileName(p.name) + ".json", exportJSON(p));
    showToast("Proyek diekspor sebagai JSON");
  };
  const doCSV = () => {
    const p = project();
    downloadBlob(safeFileName(p.name) + "-shotlist.csv", exportCSV(p));
    showToast("Shot List CSV diekspor");
  };
  const doTxt = () => {
    const p = project();
    downloadBlob(safeFileName(p.name) + "-prompt.txt", exportPromptTxt(p));
    showToast("Prompt TXT diekspor");
  };
  const doBoard = async () => {
    const p = project();
    const blob = await exportStoryboardPNG(p);
    if (!blob) {
      showToast("Belum ada frame untuk storyboard");
      return;
    }
    downloadBlob(safeFileName(p.name) + "-storyboard.png", blob);
    showToast("Storyboard PNG diekspor");
  };
  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importProject(String(reader.result));
        ctx.importProjectObject(imported);
        showToast("Proyek diimpor");
      } catch {
        showToast("File JSON tidak valid");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="group">
      <h3>Proyek Tersimpan</h3>
      <div className="saved-list">
        {ctx.savedList.length === 0 ? (
          <div className="storage-note">Belum ada proyek tersimpan.</div>
        ) : (
          ctx.savedList.map((item) => {
            const scs = item.project.scenes.length;
            const frs = item.project.scenes.reduce((n, s) => n + s.frames.length, 0);
            return (
              <div className="saved-item" key={item.id}>
                <span className="name">{item.name}</span>
                <span className="meta">
                  {scs}s·{frs}f · {new Date(item.updated).toLocaleDateString("id-ID")}
                </span>
                <button
                  className="small"
                  onClick={() => {
                    ctx.loadSavedProject(item.id);
                    showToast(`Proyek “${item.name}” dimuat`);
                  }}
                >
                  Muat
                </button>
                <ArmDelete
                  title="Hapus proyek (klik 2×)"
                  onConfirm={() => ctx.deleteSavedProject(item.id)}
                />
              </div>
            );
          })
        )}
      </div>
      <div className="io-row">
        <button className="small" onClick={doJSON}>
          Ekspor JSON
        </button>
        <button className="small" onClick={doCSV}>
          Shot List CSV
        </button>
        <button className="small" onClick={doTxt}>
          Prompt TXT
        </button>
        <button className="small" onClick={doBoard}>
          Storyboard PNG
        </button>
        <button className="small" onClick={() => fileRef.current?.click()}>
          Impor JSON
        </button>
        <button className="small" onClick={doImportLibrary}>
          Impor dari Pustaka
        </button>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={onImportFile} />
      </div>
      <p className="storage-note">
        Autosave aktif di browser. Ekspor JSON tetap disarankan sebagai backup proyek.
      </p>
    </div>
  );
}

export default SavedProjects;
