// Data Prompt — the camera-angle-guide/v2 JSON schema template + the extraction
// prompt (the text you send TO an AI to get camera JSON back). Pure.
import { ANGLES, MOVES, ARS, FPS, type SourceKind } from "./types";

export type SchemaMode = "full" | "simplified";

const SHOTS = [
  "EXTREME CLOSE-UP",
  "CLOSE-UP",
  "MEDIUM CLOSE-UP",
  "MEDIUM SHOT",
  "MEDIUM WIDE SHOT",
  "WIDE SHOT",
  "EXTREME WIDE SHOT",
];

function schemaObj(mode: SchemaMode) {
  const frameFull = {
    name: "Shot 1",
    angle: "EYE LEVEL",
    shot: "MEDIUM SHOT",
    lens: 50,
    az: 30,
    el: 4,
    dist: 3.0,
    s: {
      camPos: { x: 0, y: 1.6, z: 3 },
      target: { x: 0, y: 1.35, z: 0 },
      subjPos: { x: 0, z: 0 },
      fov: 40,
      roll: 0,
      subj: "person",
      subjRot: 0,
      trackSubject: false,
    },
    meta: {
      intent: "",
      movement: "Static / Locked-off",
      action: "",
      lighting: "",
      style: "",
      audio: "",
      duration: 2,
      transition: "Smooth",
    },
  };
  const frameSimple = {
    name: "Shot 1",
    angle: "EYE LEVEL",
    shot: "MEDIUM SHOT",
    lens: 50,
    meta: { intent: "", action: "", movement: "Static / Locked-off" },
  };
  const base = {
    schema: "camera-angle-guide/v2",
    _instructions:
      "Fill ONLY the fields you can infer from the image/video. Leave the rest at their defaults. Return valid JSON only.",
    _enums: {
      angle: ANGLES.concat(['(+ " · DUTCH" jika horizon miring)']),
      shot: SHOTS,
      movement: MOVES,
      aspectRatio: ARS,
      fps: FPS,
      transition: ["Smooth", "Cut"],
      subject: ["person", "object"],
    },
  };
  if (mode === "simplified")
    return Object.assign({}, base, { scenes: [{ name: "Scene 1", frames: [frameSimple] }] });
  return Object.assign({}, base, {
    name: "",
    settings: { aspectRatio: "16:9", fps: 24, sensor: "Full Frame" },
    scenes: [{ name: "Scene 1", notes: "", frames: [frameFull] }],
  });
}

export function schemaJson(mode: SchemaMode): string {
  return JSON.stringify(schemaObj(mode), null, 2);
}

export function aiPrompt(src: SourceKind | string, mode: SchemaMode): string {
  const srcTxt =
    (
      {
        photo: "Analisa FOTO terlampir",
        youtube:
          "Tonton VIDEO YouTube ini, screenshot tiap perpindahan scene, dan buat satu frame per scene",
        paste: "Analisa media berikut",
        file: "Analisa media berikut",
      } as Record<string, string>
    )[src] || "Analisa media berikut";
  return [
    "Anda adalah asisten sinematografi. / You are a cinematography assistant.",
    srcTxt +
      ". Hasilkan JSON valid sesuai skema camera-angle-guide/v2 di bawah. / Produce valid JSON matching the schema below.",
    "Fokus: angle, shot size, lens (mm), gerakan kamera. Isi hanya yang terlihat; sisanya biarkan default. Kembalikan HANYA JSON. / Focus on angle, shot size, lens, movement. Fill only what is visible; leave the rest at defaults. Return ONLY JSON.",
    "",
    "SKEMA / SCHEMA (" + mode + "):",
    schemaJson(mode),
  ].join("\n");
}
