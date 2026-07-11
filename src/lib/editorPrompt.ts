// editorPrompt.ts — prompt generators for the CAG Editor (plan G24).
// Ported VERBATIM from concept/camera-angle-guides-pro.html (~lines 2300-2357):
// angleEN map, framePrompt, scenePrompt, projectPrompt. Bilingual ID/EN strings
// kept as-is. Pure functions — NO React, NO three.

import { EditorFrame, EditorScene, EditorProject, defaultShotMeta, frameDuration, sceneDuration } from "./editorModel";
import { focalLength, norm180 } from "./editorMath";

export type PromptSettings = EditorProject["settings"];

// ============================================================
// EN maps (concept ~2303)
// ============================================================
export const angleEN: Record<string, string> = {
  "BIRD'S EYE": "bird's-eye view",
  "HIGH ANGLE": "high angle",
  "EYE LEVEL": "eye-level shot",
  "LOW ANGLE": "low angle",
  "WORM'S EYE": "worm's-eye view",
};

// rel = norm180(az - subjRot): <=22 front / <=67 3q-front / <=112 side /
// <=157 3q-back / else back (concept ~2311-2318).
export function viewEN(az: number, subjRot: number): string {
  const abs = Math.abs(norm180(az - subjRot));
  if (abs <= 22) return "front view";
  if (abs <= 67) return "three-quarter front view";
  if (abs <= 112) return "side profile view";
  if (abs <= 157) return "three-quarter back view";
  return "back view";
}

// person -> a standing person / object -> a sculptural object on a pedestal.
export function subjEN(subj: string): string {
  return subj === "person" ? "a standing person" : "a sculptural object on a pedestal";
}

// ============================================================
// framePrompt (concept ~2307)
// ============================================================
export function framePrompt(f: EditorFrame, i: number, settings: PromptSettings): string {
  const s = f.s;
  const m = { ...defaultShotMeta(), ...(f.meta || {}) };
  const baseAngle = (f.angle || "EYE LEVEL").replace(" · DUTCH", "");
  const view = viewEN(f.az, s.subjRot);
  const subj = subjEN(s.subj);
  const dutch = Math.abs(s.roll) >= 7 ? `, dutch angle ${Math.round(s.roll)}°` : "";
  const details = [m.action, m.lighting, m.style].filter(Boolean).join(", ");
  const movement =
    m.movement && !m.movement.startsWith("Static")
      ? `, camera movement: ${m.movement.toLowerCase()}`
      : ", locked-off camera";
  const en = `${(f.shot || "MEDIUM SHOT").toLowerCase()}, ${angleEN[baseAngle] || baseAngle.toLowerCase()}, ${view} of ${subj}, ~${f.lens || focalLength(s.fov)}mm full-frame lens, ${settings.aspectRatio} composition${dutch}${movement}${details ? ", " + details : ""}`;
  const lines = [
    `SHOT ${i + 1} — ${f.name}`,
    `• Tujuan     : ${m.intent || "—"}`,
    `• Durasi     : ${frameDuration(f).toFixed(1)}s · ${m.transition}`,
    `• Angle      : ${f.angle} (elevasi ${f.el}°)`,
    `• Shot size  : ${f.shot}`,
    `• Lensa      : ~${f.lens}mm (FOV ${Math.round(s.fov)}°)`,
    `• Kamera     : azimuth ${f.az}°, jarak ${f.dist} m, tinggi ${s.camPos.y.toFixed(2)} m` +
      (Math.abs(s.roll) >= 1 ? `, roll ${Math.round(s.roll)}°` : ""),
    `• Movement   : ${m.movement}`,
    `• Subjek     : ${s.subj === "person" ? "orang berdiri" : "objek/pedestal"}, menghadap ${Math.round(s.subjRot)}°, tampak ${view}`,
    `• Aksi       : ${m.action || "—"}`,
    `• Lighting   : ${m.lighting || "—"}`,
    `• Style      : ${m.style || "—"}`,
    `• Audio/SFX  : ${m.audio || "—"}`,
    `• Output     : ${settings.aspectRatio} · ${settings.fps} fps · ${settings.sensor}`,
    `• Prompt EN  : "${en}"`,
  ];
  if (f.notes && f.notes.trim()) lines.push(`• Catatan    : ${f.notes.trim()}`);
  return lines.join("\n");
}

// ============================================================
// scenePrompt (concept ~2344)
// ============================================================
export function scenePrompt(sc: EditorScene, settings: PromptSettings): string {
  const head =
    `SCENE: ${sc.name}\n` +
    (sc.notes && sc.notes.trim() ? `Catatan scene: ${sc.notes.trim()}\n` : "") +
    `Total ${sc.frames.length} shot · playback ±${sceneDuration(sc).toFixed(1)}s\n` +
    `${"-".repeat(46)}`;
  if (!sc.frames.length) return head + "\n(scene kosong)";
  return head + "\n\n" + sc.frames.map((f, i) => framePrompt(f, i, settings)).join("\n\n");
}

// ============================================================
// projectPrompt (concept ~2353)
// ============================================================
export function projectPrompt(project: EditorProject): string {
  const name = project.name.trim() || "Proyek tanpa nama";
  return (
    `PROYEK: ${name}\nOUTPUT: ${project.settings.aspectRatio} · ${project.settings.fps} fps · ${project.settings.sensor}\n${"=".repeat(46)}\n\n` +
    project.scenes.map((sc) => scenePrompt(sc, project.settings)).join("\n\n" + "=".repeat(46) + "\n\n")
  );
}
