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
//   4. router.push("/editor") — Studio 3D mount ulang & memuat dokumen tadi.

import { useRouter } from "next/navigation";
import { CagCardPreview } from "@/components/CagCardPreview";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { toEditorProject } from "@/lib/editorModel";
import { AUTOKEY, saveProject } from "@/lib/editorStorage";
import { STARTER_TEMPLATES, type StarterTemplate } from "./templates";

export default function TemplatePage() {
  const router = useRouter();

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
    router.push("/editor");
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "32px clamp(16px, 5vw, 48px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h1 style={{ font: "800 24px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>
            Template
          </h1>
          <Badge tone="outline">{STARTER_TEMPLATES.length} preset</Badge>
        </div>
        <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: "0 0 8px" }}>
          Titik awal cepat untuk Studio 3D — pilih satu, langsung dibuka & tersimpan di Pustaka sebagai proyek yang
          bisa kamu ubah.
        </p>

        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {STARTER_TEMPLATES.map((t) => {
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
      </div>
    </div>
  );
}
