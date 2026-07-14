// cameras.ts — real camera brand/model presets. A PROMPT-ONLY look tag layered on
// the neutral shot; no 3D/FOV coupling. Pure leaf: imports NOTHING (so editorModel +
// the prompt engine both depend on it with no cycle). The "" id = none — its empty
// promptFragment is dropped by the encoder's empty-skipping join, so the default is
// byte-identical to today.
//
// Each brand carries its own "settings": sensor + a short signature look (shown in
// the UI) and an enriched promptFragment that names the body + 3-4 perceptual look
// descriptors. Per LTX/AI-video prompt research (ltx.io, Runway/RunPod camera-brand
// guides): the "shot on <brand model>" tag does most of the work because ARRI/RED/
// Sony/GoPro carry strong learned associations; anchor on that + a concise look
// phrase (skin tones / rolloff / saturation / motion-POV). Avoid dumping engineering
// numbers into the PROMPT — models can't map "8.6K dual-base-ISO" to pixels — so the
// spec detail lives in `sensor` (UI only), not the fragment.

export interface CameraPreset {
  id: string;
  brand: string;
  model: string;
  label: string;
  sensor: string; // the brand's sensor "setting" — UI only, kept OUT of the prompt
  look: string; // short signature look shown in the camera picker
  promptFragment: string; // "" = no tag; otherwise "shot on <body>, <look>"
}

export const CAMERAS: CameraPreset[] = [
  { id: "", brand: "", model: "", label: "Tanpa kamera (generic)", sensor: "", look: "", promptFragment: "" },
  {
    id: "arri-alexa-35", brand: "ARRI", model: "Alexa 35", label: "ARRI Alexa 35",
    sensor: "Super 35 · 17-stop", look: "REVEAL filmic, natural skin",
    promptFragment: "shot on ARRI Alexa 35, REVEAL filmic color, natural skin tones, gentle highlight rolloff",
  },
  {
    id: "arri-alexa-mini-lf", brand: "ARRI", model: "Alexa Mini LF", label: "ARRI Alexa Mini LF",
    sensor: "Large-format 4.5K", look: "Large-format, soft separation",
    promptFragment: "shot on ARRI Alexa Mini LF, large-format cinematic look, soft subject separation, smooth rolloff",
  },
  {
    id: "red-v-raptor", brand: "RED", model: "V-Raptor 8K", label: "RED V-Raptor 8K",
    sensor: "Full-frame 8K VV", look: "Crisp, saturated, punchy",
    promptFragment: "shot on RED V-Raptor 8K, crisp high-resolution detail, rich saturated color, punchy contrast",
  },
  {
    id: "sony-venice-2", brand: "Sony", model: "Venice 2", label: "Sony Venice 2",
    sensor: "Full-frame 8.6K · dual-ISO", look: "Filmic, smooth skin tones",
    promptFragment: "shot on Sony Venice 2, filmic full-frame color, smooth natural skin tones, wide exposure latitude",
  },
  {
    id: "blackmagic-ursa-12k", brand: "Blackmagic", model: "URSA Cine 12K", label: "Blackmagic URSA Cine 12K",
    sensor: "Large-format 12K", look: "Ultra-sharp, vivid color",
    promptFragment: "shot on Blackmagic URSA Cine 12K, ultra-sharp resolution, vivid saturated color, wide dynamic range",
  },
  {
    id: "canon-c300-iii", brand: "Canon", model: "EOS C300 Mark III", label: "Canon EOS C300 Mark III",
    sensor: "Super 35 · DGO", look: "Warm, flattering skin",
    promptFragment: "shot on Canon EOS C300 Mark III, warm flattering skin tones, smooth highlight rolloff, clean image",
  },
  {
    id: "dji-ronin-4d", brand: "DJI", model: "Ronin 4D", label: "DJI Ronin 4D",
    sensor: "Full-frame gimbal", look: "Gimbal-smooth, cinematic",
    promptFragment: "shot on DJI Ronin 4D, ultra-smooth gimbal-stabilized floating motion, cinematic full-frame look",
  },
  {
    id: "dji-mavic3-cine", brand: "DJI", model: "Mavic 3 Cine", label: "DJI Mavic 3 Cine (drone)",
    sensor: "4/3 Hasselblad · drone", look: "Aerial, Hasselblad color",
    promptFragment: "shot on a DJI Mavic 3 Cine drone, aerial bird's-eye view, vivid Hasselblad color, smooth gliding flight",
  },
  {
    id: "iphone-15-pro", brand: "Apple", model: "iPhone 15 Pro", label: "Apple iPhone 15 Pro",
    sensor: "48MP · Apple Log", look: "HDR, punchy, deep focus",
    promptFragment: "shot on iPhone 15 Pro, computational HDR, punchy contrast, deep focus, modern smartphone look",
  },
  {
    id: "gopro-hero12", brand: "GoPro", model: "HERO12", label: "GoPro HERO12",
    sensor: "1/1.9-in · 156° ultra-wide", look: "Fisheye action-cam POV",
    promptFragment: "shot on GoPro HERO12, ultra-wide fisheye action-cam POV, immersive first-person, vibrant color",
  },
];

const CAMERA_BY_ID = new Map(CAMERAS.map((c) => [c.id, c]));
export const CAMERA_IDS = new Set(CAMERAS.map((c) => c.id));

/** The camera preset for an id (undefined/none → the "" generic entry). */
export function cameraById(id: string | undefined): CameraPreset | undefined {
  return CAMERA_BY_ID.get(id ?? "");
}

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
