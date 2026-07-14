"use client";
// Template — starter camera-angle-guide/v2 presets, rendered through the SHARED
// CardGallery (same component the Pustaka/library grid uses, so the two match).
// "Gunakan Template" builds a project from the preset and opens it in Studio 3D
// (same seam as before: toEditorProject → saveProject → seed AUTOKEY → router.push).

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ds/Badge";
import { toEditorProject } from "@/lib/editorModel";
import { AUTOKEY, saveProject } from "@/lib/editorStorage";
import { STARTER_TEMPLATES, type StarterTemplate } from "./templates";
import { CardGallery, type GalleryItem } from "@/components/gallery/CardGallery";

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
    router.push("/");
  };

  const items: GalleryItem[] = STARTER_TEMPLATES.map((t) => {
    const scenes = t.project.scenes.length;
    const shots = t.project.scenes.reduce((n, s) => n + s.frames.length, 0);
    // Full ordered shot list — a >1-frame template plays through as an animation.
    const frames = t.project.scenes
      .flatMap((s) => s.frames)
      .map((f) => ({ az: f.az, el: f.el, dist: f.dist, lens: f.lens, roll: f.roll, subj: f.subj, name: f.name }));
    return {
      id: t.id,
      title: t.title,
      meta: `${scenes} scene · ${shots} shot`,
      badge: { label: t.aspectRatio, tone: "outline" },
      filterValue: t.aspectRatio,
      shotCount: shots,
      preview: frames[0],
      frames,
      description: t.description,
      actions: [
        {
          label: "Gunakan Template",
          variant: "primary",
          onClick: () => useTemplate(t),
          title: "Buat proyek dari template ini",
        },
      ],
    };
  });

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "32px clamp(16px, 5vw, 48px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h1 style={{ font: "800 24px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>Template</h1>
          <Badge tone="outline">{STARTER_TEMPLATES.length} preset</Badge>
        </div>
        <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
          Titik awal cepat untuk Studio 3D — ketuk kartu untuk preview & detail, lalu pakai jadi proyek yang bisa kamu
          ubah.
        </p>
        <CardGallery
          items={items}
          filterLabel="Semua rasio"
          searchPlaceholder="Cari template…"
          emptyText="Tidak ada template yang cocok."
        />
      </div>
    </div>
  );
}
