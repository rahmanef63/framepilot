"use client";
// Proyek — a real view of the persistent projects store (the SSOT). Signed-in
// users see the reactive Convex list (api.projects.listMine); anonymous users see
// the localStorage list (editorStorage.listProjects). "Buka di Studio 3D" reuses
// the SAME open-in-studio seam as the library: seed the editor autosave key, then
// navigate to /editor, which hydrates it on mount (loadAutosave → swapProject).
// No parallel store, no duplicated list/convert logic.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AUTOKEY, listProjects, deleteProject, type SavedEntry } from "@/lib/editorStorage";
import { useApp } from "@/state/AppState";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";

// Normalized row so the JSX renders once regardless of source (localStorage for
// anonymous users, Convex for signed-in users) — same shape trick as SavedProjects.
type ProjectRow = {
  id: string;
  name: string;
  meta: string;
  onOpen: () => void;
  onDelete: () => void;
};

const fmtDate = (ms: number) => new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

// Send an EditorProject into the editor via the shared autosave seam, then route.
function seedAndOpen(router: ReturnType<typeof useRouter>, docJSON: string) {
  try {
    localStorage.setItem(AUTOKEY, docJSON);
  } catch {
    /* ignore quota / private-mode */
  }
  router.push("/editor");
}

export default function ProyekPage() {
  const router = useRouter();
  const { openImport } = useApp();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const convex = useConvex();
  const removeCloud = useMutation(api.projects.remove);

  // Reactive cloud list (skipped for anonymous callers so localStorage stays sole source).
  const cloudList = useQuery(api.projects.listMine, isAuthenticated ? {} : "skip");

  // localStorage list is not reactive — read on mount + after our own deletes.
  const [localList, setLocalList] = useState<SavedEntry[]>([]);
  const refreshLocal = useCallback(() => setLocalList(listProjects()), []);
  useEffect(() => {
    if (!isAuthenticated) refreshLocal();
  }, [isAuthenticated, refreshLocal]);

  const cloudRows: ProjectRow[] = (cloudList ?? []).map((p) => ({
    id: p._id,
    // listMine returns metadata only (no scene/shot count) — show what we have.
    name: p.name,
    meta: fmtDate(p.updatedAt),
    onOpen: () => {
      void convex.query(api.projects.get, { id: p._id as Id<"projects"> }).then((doc) => {
        if (doc) seedAndOpen(router, doc); // doc is already the serialized EditorProject
      });
    },
    onDelete: () => {
      void removeCloud({ id: p._id as Id<"projects"> });
    },
  }));

  const localRows: ProjectRow[] = localList.map((e) => {
    const scenes = e.project.scenes.length;
    const shots = e.project.scenes.reduce((n, s) => n + s.frames.length, 0);
    return {
      id: e.id,
      name: e.name,
      meta: `${scenes} scene · ${shots} shot · ${fmtDate(e.updated)}`,
      onOpen: () => seedAndOpen(router, JSON.stringify(e.project)),
      onDelete: () => {
        deleteProject(e.id);
        refreshLocal();
      },
    };
  });

  const rows = isAuthenticated ? cloudRows : localRows;
  const loading = authLoading || (isAuthenticated && cloudList === undefined);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 40 }}>
      <div style={{ maxWidth: 820, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ font: "800 24px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>Proyek</h1>
            {!loading && rows.length > 0 && <Badge tone="outline">{rows.length} tersimpan</Badge>}
          </div>
          <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
            Semua proyek yang kamu susun di Studio 3D, buat dari gambar, atau impor — tersimpan dan siap dibuka kembali.
            {isAuthenticated
              ? " Tersinkron di akunmu antar perangkat."
              : " Tersimpan di browser ini. Masuk untuk sinkron antar perangkat."}
          </p>
        </header>

        {loading ? (
          <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>Memuat proyek…</p>
        ) : rows.length === 0 ? (
          <EmptyState onFromImage={() => openImport("photo")} onStudio={() => router.push("/editor")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((row) => (
              <ProjectCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ row }: { row: ProjectRow }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "14px 16px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
        <span style={{ font: "700 15px/1.3 var(--font-sans)", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.name}
        </span>
        <span style={{ font: "400 12px/1.4 var(--font-mono, var(--font-sans))", color: "var(--muted-foreground)" }}>{row.meta}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="primary" size="sm" icon="◈" onClick={row.onOpen}>
          Buka di Studio 3D
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Hapus proyek ini? Tindakan ini tidak bisa dibatalkan.")) row.onDelete();
          }}
        >
          Hapus
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ onStudio, onFromImage }: { onStudio: () => void; onFromImage: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "center",
        textAlign: "center",
        padding: "48px 24px",
        background: "var(--card)",
        border: "1px dashed var(--border)",
        borderRadius: 16,
      }}
    >
      <Badge tone="outline">Belum ada proyek</Badge>
      <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0, maxWidth: 440 }}>
        Belum ada proyek tersimpan. Mulai susun sudut kamera di Studio 3D, atau buat proyek dari sebuah gambar referensi —
        keduanya otomatis muncul di sini.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
        <Button variant="primary" size="sm" icon="◈" onClick={onStudio}>
          Buka Studio 3D
        </Button>
        <Button variant="outline" size="sm" onClick={onFromImage}>
          Buat dari Gambar
        </Button>
      </div>
    </div>
  );
}
