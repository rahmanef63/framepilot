// cameras.ts — real camera brand/model presets. A PROMPT-ONLY look tag
// ("shot on ARRI Alexa 35") layered on the neutral shot; no 3D/FOV coupling.
// Pure leaf: imports NOTHING (so editorModel + the prompt engine can both depend
// on it with no cycle). The "" id = none — its empty promptFragment is dropped by
// the encoder's empty-skipping join, so the default is byte-identical to today.

export interface CameraPreset {
  id: string;
  brand: string;
  model: string;
  label: string;
  promptFragment: string; // "" = no tag
}

export const CAMERAS: CameraPreset[] = [
  { id: "", brand: "", model: "", label: "Tanpa kamera (generic)", promptFragment: "" },
  { id: "arri-alexa-35", brand: "ARRI", model: "Alexa 35", label: "ARRI Alexa 35", promptFragment: "shot on ARRI Alexa 35" },
  { id: "arri-alexa-mini-lf", brand: "ARRI", model: "Alexa Mini LF", label: "ARRI Alexa Mini LF", promptFragment: "shot on ARRI Alexa Mini LF, large-format" },
  { id: "red-v-raptor", brand: "RED", model: "V-Raptor 8K", label: "RED V-Raptor 8K", promptFragment: "shot on RED V-Raptor 8K" },
  { id: "sony-venice-2", brand: "Sony", model: "Venice 2", label: "Sony Venice 2", promptFragment: "shot on Sony Venice 2" },
  { id: "blackmagic-ursa-12k", brand: "Blackmagic", model: "URSA Cine 12K", label: "Blackmagic URSA Cine 12K", promptFragment: "shot on Blackmagic URSA Cine 12K" },
  { id: "canon-c300-iii", brand: "Canon", model: "EOS C300 Mark III", label: "Canon EOS C300 Mark III", promptFragment: "shot on Canon EOS C300 Mark III" },
  { id: "dji-ronin-4d", brand: "DJI", model: "Ronin 4D", label: "DJI Ronin 4D", promptFragment: "shot on DJI Ronin 4D" },
  { id: "dji-mavic3-cine", brand: "DJI", model: "Mavic 3 Cine", label: "DJI Mavic 3 Cine (drone)", promptFragment: "shot on a DJI Mavic 3 Cine drone, aerial" },
  { id: "iphone-15-pro", brand: "Apple", model: "iPhone 15 Pro", label: "Apple iPhone 15 Pro", promptFragment: "shot on iPhone 15 Pro" },
  { id: "gopro-hero12", brand: "GoPro", model: "HERO12", label: "GoPro HERO12", promptFragment: "shot on GoPro HERO12, action-cam" },
];

const CAMERA_BY_ID = new Map(CAMERAS.map((c) => [c.id, c]));
export const CAMERA_IDS = new Set(CAMERAS.map((c) => c.id));

/** The prompt fragment for a camera id; "" (none/unknown) → "" so the encoder drops it. */
export function cameraPhrase(id: string | undefined): string {
  return CAMERA_BY_ID.get(id ?? "")?.promptFragment ?? "";
}

/**
 * Which camera applies to a frame at prompt time. globalCamera ON → the one
 * project camera wins for every frame; OFF → each frame's own pick (empty = none).
 */
export function effectiveCameraId(
  frameCamera: string | undefined,
  settings: { globalCamera?: boolean; camera?: string },
): string {
  return settings.globalCamera ? settings.camera || "" : frameCamera || "";
}
