"use client";
// SavedProjects.tsx — the "Proyek Tersimpan" group inside the Kontrol panel
// (concept #savedList + .io-row ~741-753). Lists localStorage-backed projects
// (Muat / Hapus-2×) and the export/import row wired to editorExport
// (JSON · Shot List CSV · Prompt TXT · Storyboard PNG · Impor JSON). All project
// data comes from useEditor(); the pure lib does the Blob/file work.

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { useProjectSync } from "@/components/editor/useProjectSync";
import { usePlatform } from "@/components/editor/usePlatform";
import { Button } from "@/components/ds/Button";
import { projectPrompt } from "@/lib/editorPrompt";
import {
  exportJSON,
  exportCSV,
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
      {armed ? (
        <>
          <X size={13} aria-hidden />?
        </>
      ) : (
        <X size={13} aria-hidden />
      )}
    </button>
  );
}

// Normalized row so the list renders once regardless of its source (localStorage
// for anonymous users, Convex for signed-in users).
type SavedRow = {
  id: string;
  name: string;
  meta: string;
  onLoad: () => void;
  onDelete: () => void;
};

export function SavedProjects() {
  const ctx = useEditor();
  const { showToast, project: libraryProject } = useApp();
  const { signedIn, cloudList, loadCloud, removeCloud } = useProjectSync();
  const [platform] = usePlatform();
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
    // skinned camera prompt at the selected platform (same output as Copy)
    const blob = new Blob([projectPrompt(p, platform)], { type: "text/plain;charset=utf-8" });
    downloadBlob(safeFileName(p.name) + "-prompt.txt", blob);
    showToast("Prompt kamera TXT diekspor");
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

  // Signed-in → the deployed Convex list; anonymous → the existing localStorage
  // list. Both collapse to the same SavedRow shape so the JSX below is shared.
  const localRows: SavedRow[] = ctx.savedList.map((item) => {
    const scs = item.project.scenes.length;
    const frs = item.project.scenes.reduce((n, s) => n + s.frames.length, 0);
    return {
      id: item.id,
      name: item.name,
      meta: `${scs}s·${frs}f · ${new Date(item.updated).toLocaleDateString("id-ID")}`,
      onLoad: () => {
        ctx.loadSavedProject(item.id);
        showToast(`Proyek “${item.name}” dimuat`);
      },
      onDelete: () => ctx.deleteSavedProject(item.id),
    };
  });

  const cloudRows: SavedRow[] = (cloudList ?? []).map((p) => ({
    id: p._id,
    name: p.name,
    meta: new Date(p.updatedAt).toLocaleDateString("id-ID"),
    onLoad: () => {
      void loadCloud(p._id).then(() => showToast(`Proyek “${p.name}” dimuat`));
    },
    onDelete: () => {
      void removeCloud(p._id);
    },
  }));

  const rows = signedIn ? cloudRows : localRows;

  return (
    <div className="group">
      <h3>Proyek Tersimpan</h3>
      <div className="saved-list">
        {rows.length === 0 ? (
          <div className="storage-note">Belum ada proyek tersimpan.</div>
        ) : (
          rows.map((row) => (
            <div className="saved-item" key={row.id}>
              <span className="name">{row.name}</span>
              <span className="meta">{row.meta}</span>
              <Button variant="outline" size="sm" onClick={row.onLoad}>
                Muat
              </Button>
              <ArmDelete title="Hapus proyek (klik 2×)" onConfirm={row.onDelete} />
            </div>
          ))
        )}
      </div>
      <div className="io-row">
        <Button variant="outline" size="sm" onClick={doJSON}>
          Ekspor JSON
        </Button>
        <Button variant="outline" size="sm" onClick={doCSV}>
          Shot List CSV
        </Button>
        <Button variant="outline" size="sm" onClick={doTxt}>
          Prompt TXT
        </Button>
        <Button variant="outline" size="sm" onClick={doBoard}>
          Storyboard PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          Impor JSON
        </Button>
        <Button variant="outline" size="sm" onClick={doImportLibrary}>
          Impor dari Pustaka
        </Button>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={onImportFile} />
      </div>
      <p className="storage-note">
        {signedIn
          ? "Proyek tersimpan di cloud (akun kamu) dan tersinkron antar perangkat. Ekspor JSON tetap disarankan sebagai backup."
          : "Autosave aktif di browser. Ekspor JSON tetap disarankan sebagai backup proyek."}
      </p>
    </div>
  );
}
