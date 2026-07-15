// FIXUPS — a few late-caught keys for data/logic files the mass migration left as
// literals (the generic-camera label + the default project name). Owned by hand,
// spread into every locale after AREAS so they always resolve.
import type { Locale, Dict } from "../types";

export const FIXUPS: Record<Locale, Dict> = {
  id: { "view.noCameraGeneric": "Tanpa kamera (generik)", "sys.untitled": "Tanpa nama" },
  en: { "view.noCameraGeneric": "No camera (generic)", "sys.untitled": "Untitled" },
  es: { "view.noCameraGeneric": "Sin cámara (genérica)", "sys.untitled": "Sin título" },
  zh: { "view.noCameraGeneric": "无相机（通用）", "sys.untitled": "未命名" },
  ar: { "view.noCameraGeneric": "بدون كاميرا (عام)", "sys.untitled": "بدون عنوان" },
};
