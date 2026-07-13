// editorExport.ts — export/import for the CAG Editor (plan §G23). Pure, no React.
// Ported VERBATIM from concept camera-angle-guides-pro.html (JS lines ~2547-2638):
//   JSON backup, Shot List CSV (25 cols, BOM + CRLF + quote-doubling), Prompt TXT
//   (projectPrompt), Storyboard PNG (1600w, 4 cols, cardH286), import + v1 migration.
// Browser-only at call time (uses document/Image/canvas/Blob/URL) but framework-agnostic.

import {
  EditorProject,
  EditorScene,
  EditorFrame,
  ensureProjectShape,
  defaultShotMeta,
  frameDuration,
  sceneDuration,
} from "./editorModel";
import { uid } from "./dataPrompt";

// ============================================================
// File-name helpers (concept ~2547-2553)
// ============================================================

// Slugify a project name into a safe file-name base (no extension).
// Concept safeFileName() appended the ext inline; here the caller composes it.
export function safeFileName(s: string): string {
  return (
    (s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "camera-plan"
  );
}

export function downloadBlob(name: string, blob: Blob): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

// ============================================================
// JSON backup (concept ~2554-2557) — whole v2 project verbatim
// ============================================================
export function exportJSON(project: EditorProject): Blob {
  return new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
}

// ============================================================
// Shot List CSV (concept ~2563-2575) — EXACT 25 cols, BOM + CRLF + quote-doubling
// ============================================================
function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCSV(project: EditorProject): Blob {
  const head = [
    "Project",
    "Scene",
    "Shot #",
    "Shot name",
    "Duration (s)",
    "Transition",
    "Intent",
    "Angle",
    "Shot size",
    "Lens (mm)",
    "FOV",
    "Azimuth",
    "Elevation",
    "Distance (m)",
    "Camera height (m)",
    "Subject",
    "Subject rotation",
    "Movement",
    "Action",
    "Lighting",
    "Style",
    "Audio/SFX",
    "Aspect ratio",
    "FPS",
    "Notes",
  ];
  const rows: unknown[][] = [head];
  project.scenes.forEach((sc) =>
    sc.frames.forEach((f, i) => {
      const m = { ...defaultShotMeta(), ...(f.meta || {}) };
      const s = f.s;
      rows.push([
        project.name || "Untitled",
        sc.name,
        i + 1,
        f.name,
        frameDuration(f),
        m.transition,
        m.intent,
        f.angle,
        f.shot,
        f.lens,
        s.fov,
        f.az,
        f.el,
        f.dist,
        s.camPos.y.toFixed(2),
        s.subj,
        s.subjRot,
        m.movement,
        m.action,
        m.lighting,
        m.style,
        m.audio,
        project.settings.aspectRatio,
        project.settings.fps,
        f.notes || "",
      ]);
    })
  );
  const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

// ============================================================
// Storyboard PNG (concept ~2576-2609) — 1600w, 4 cols, cardH286
// ============================================================
function loadBoardImage(src: string | null): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

function ellipsis(ctx: CanvasRenderingContext2D, text: unknown, maxWidth: number): string {
  let t = String(text || "");
  if (ctx.measureText(t).width <= maxWidth) return t;
  while (t.length && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t + "…";
}

// Returns null when the project has no frames (nothing to draw) or the 2D
// context / toBlob is unavailable. Otherwise a PNG Blob.
export async function exportStoryboardPNG(project: EditorProject): Promise<Blob | null> {
  const frames: { sc: EditorScene; f: EditorFrame; i: number }[] = [];
  project.scenes.forEach((sc) => sc.frames.forEach((f, i) => frames.push({ sc, f, i })));
  if (!frames.length) return null;

  const W = 1600,
    pad = 36,
    gap = 18,
    cols = 4,
    cardW = (W - pad * 2 - gap * (cols - 1)) / cols,
    cardH = 286,
    headerH = 112;
  const rows = Math.ceil(frames.length / cols),
    H = headerH + pad + rows * (cardH + gap) + 20;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0c0f12";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#eef2f5";
  ctx.font = "700 28px Segoe UI, sans-serif";
  ctx.fillText(project.name || "Camera Plan", pad, 45);
  ctx.fillStyle = "#8d99a5";
  ctx.font = "14px ui-monospace, monospace";
  ctx.fillText(
    `${project.scenes.length} scene · ${frames.length} shot · ${project.settings.aspectRatio} · ${project.settings.fps} fps · ${project.scenes
      .reduce((n, s) => n + sceneDuration(s), 0)
      .toFixed(1)}s`,
    pad,
    76
  );

  const images = await Promise.all(frames.map((x) => loadBoardImage(x.f.thumb)));
  frames.forEach((item, n) => {
    const col = n % cols,
      row = Math.floor(n / cols),
      x = pad + col * (cardW + gap),
      y = headerH + row * (cardH + gap);
    ctx.fillStyle = "#14191e";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = "#29323b";
    ctx.strokeRect(x + 0.5, y + 0.5, cardW - 1, cardH - 1);
    const im = images[n],
      ix = x + 10,
      iy = y + 10,
      iw = cardW - 20,
      ih = 182;
    ctx.fillStyle = "#07090b";
    ctx.fillRect(ix, iy, iw, ih);
    if (im) {
      const r = Math.min(iw / im.width, ih / im.height),
        dw = im.width * r,
        dh = im.height * r;
      ctx.drawImage(im, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
    }
    ctx.fillStyle = "#ffb23f";
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(`${item.sc.name.toUpperCase()} · SHOT ${item.i + 1}`, x + 12, y + 213);
    ctx.fillStyle = "#eef2f5";
    ctx.font = "600 16px Segoe UI, sans-serif";
    ctx.fillText(ellipsis(ctx, item.f.name, cardW - 24), x + 12, y + 237);
    ctx.fillStyle = "#8d99a5";
    ctx.font = "11px ui-monospace, monospace";
    const meta = item.f.meta || defaultShotMeta();
    ctx.fillText(
      ellipsis(
        ctx,
        `${item.f.shot} · ${item.f.angle} · ${item.f.lens}mm · ${frameDuration(item.f).toFixed(1)}s`,
        cardW - 24
      ),
      x + 12,
      y + 258
    );
    ctx.fillText(ellipsis(ctx, meta.movement || "Static / Locked-off", cardW - 24), x + 12, y + 276);
  });

  return new Promise((resolve) => c.toBlob((blob) => resolve(blob), "image/png"));
}

// ============================================================
// Import (concept ~2611-2635) — v2 direct; v1 legacy {frames:[]} wraps as one scene
// ============================================================
export function importProject(text: string): EditorProject {
  const data = JSON.parse(text) as Record<string, unknown>;
  if (Array.isArray(data.scenes)) {
    const project = ensureProjectShape(data);
    if (!project.activeSceneId && project.scenes[0]) project.activeSceneId = project.scenes[0].id;
    return project;
  }
  if (Array.isArray(data.frames)) {
    // format lama: satu scene
    const s = {
      id: uid(),
      name: (data.name as string) || "Scene 1",
      notes: "",
      frames: data.frames,
      frameSeq: (data.frameSeq as number) || (data.frames as unknown[]).length + 1,
      collapsed: false,
      notesOpen: false,
    };
    return ensureProjectShape({ name: (data.name as string) || "", scenes: [s], activeSceneId: s.id });
  }
  throw new Error("File JSON tidak valid");
}
