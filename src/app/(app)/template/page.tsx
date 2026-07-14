"use client";
// Template — galeri starter camera-angle-guide/v2 siap pakai. Setiap kartu punya
// preview 3D (CagViewport, frame pertama) + tombol "Gunakan Template" yang
// membuat proyek DARI template dan membukanya di Studio 3D.
//
// Alur pakai (memakai ulang seam yang sama seperti library -> Studio 3D):
//   1. toEditorProject(template.project) — konversi RawFrame -> EditorProject
//      lewat converter yang sama dengan Studio 3D (sintesis snapshot `s`), lalu
//      terapkan aspectRatio template.
//   2. saveProject(project) — tulis ke SSOT projects store, jadi proyek langsung
//      muncul di Pustaka (data Pustaka DIHASILKAN, bukan demo statis).
//   3. localStorage[AUTOKEY] = project — seed autosave yang di-hydrate
//      EditorStateProvider saat mount (loadAutosave -> swapProject).
//   4. router.push("/") — Studio 3D mount ulang & memuat dokumen tadi.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CagCardPreview } from "@/shared/viewport3d/CagCardPreview";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { toEditorProject } from "@/lib/editorModel";
import { AUTOKEY, saveProject } from "@/lib/editorStorage";
import { STARTER_TEMPLATES, type StarterTemplate } from "./templates";
import "./template.css";

type SortKey = "name" | "shots-desc" | "shots-asc";

// Total frames across all scenes — the "shot count" used by the header meta and
// the shot-count sort options (matches the per-card "{shots} shot" figure).
const shotCount = (t: StarterTemplate) =>
  t.project.scenes.reduce((n, s) => n + s.frames.length, 0);

export default function TemplatePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [ratio, setRatio] = useState("all");

  // Distinct aspect ratios present in the data, sorted — drives the filter <select>.
  const ratios = useMemo(
    () => Array.from(new Set(STARTER_TEMPLATES.map((t) => t.aspectRatio))).sort(),
    [],
  );

  // Visible list: filter by ratio → search (title+description) → sort.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = STARTER_TEMPLATES.filter((t) => {
      if (ratio !== "all" && t.aspectRatio !== ratio) return false;
      if (!q) return true;
      return (t.title + " " + t.description).toLowerCase().includes(q);
    });
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "shots-desc") sorted.sort((a, b) => shotCount(b) - shotCount(a));
    else sorted.sort((a, b) => shotCount(a) - shotCount(b));
    return sorted;
  }, [query, sort, ratio]);

  const useTemplate = (t: StarterTemplate) => {
    const project = toEditorProject(t.project);
    project.name = t.title;
    project.settings.aspectRatio = t.aspectRatio; // Project-branch forces default; restore intent
    saveProject(project); // persist into the SSOT store (upsert by name)
    try {
      localStorage.setItem(AUTOKEY, JSON.stringify(project));
    } catch {
      /* ignore quota/private-mode — editor akan mulai dari proyek baru */
    }
    router.push("/");
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "32px clamp(16px, 5vw, 48px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h1 style={{ font: "800 24px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>
            Template
          </h1>
          <Badge tone="outline">
            {visible.length} / {STARTER_TEMPLATES.length} preset
          </Badge>
        </div>
        <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: "0 0 8px" }}>
          Titik awal cepat untuk Studio 3D — pilih satu, langsung dibuka & tersimpan di Pustaka sebagai proyek yang
          bisa kamu ubah.
        </p>

        <div className="tpl-toolbar">
          <input
            className="tpl-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari template…"
            aria-label="Cari template"
          />
          <select
            className="tpl-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Urutkan"
          >
            <option value="name">Nama (A–Z)</option>
            <option value="shots-desc">Shot terbanyak</option>
            <option value="shots-asc">Shot paling sedikit</option>
          </select>
          <select
            className="tpl-select"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            aria-label="Filter rasio"
          >
            <option value="all">Semua rasio</option>
            {ratios.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="tpl-empty">Tidak ada template yang cocok.</div>
        ) : (
          <div className="tpl-grid">
            {visible.map((t) => {
            const f0 = t.project.scenes[0].frames[0];
            const scenes = t.project.scenes.length;
            const shots = t.project.scenes.reduce((n, s) => n + s.frames.length, 0);
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius, 12px)",
                  background: "var(--card)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--muted)",
                    position: "relative",
                  }}
                >
                  {/* Shared lazy preview: mounts ONE WebGL context only while near
                      the viewport, freeing it when scrolled away — same context
                      discipline as the library grid (no eager all-6-at-once). */}
                  <CagCardPreview
                    az={f0.az}
                    el={f0.el}
                    dist={f0.dist}
                    lens={f0.lens}
                    roll={f0.roll}
                    subj={f0.subj}
                    height={168}
                  />
                  <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                    <Badge tone="outline">{t.aspectRatio}</Badge>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <h2 style={{ font: "700 15px/1.3 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>
                      {t.title}
                    </h2>
                    <span style={{ font: "500 11px/1 var(--font-mono, var(--font-sans))", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                      {scenes} scene · {shots} shot
                    </span>
                  </div>
                  <p
                    style={{
                      font: "400 13px/1.55 var(--font-sans)",
                      color: "var(--muted-foreground)",
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {t.description}
                  </p>
                  <Button variant="primary" size="sm" onClick={() => useTemplate(t)} style={{ marginTop: 4 }}>
                    Gunakan Template →
                  </Button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
