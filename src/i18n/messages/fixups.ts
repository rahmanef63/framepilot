// FIXUPS — a few late-caught keys for data/logic files the mass migration left as
// literals (the generic-camera label + the default project name). Owned by hand,
// spread into every locale after AREAS so they always resolve.
import type { Locale, Dict } from "../types";

const TRADEMARKS = {
  id: "Nama produk, merek kamera, dan nama platform AI adalah merek dagang milik masing-masing pemiliknya; penggunaannya di sini bersifat nominatif (untuk mengidentifikasi target) dan tidak menyiratkan afiliasi atau dukungan.",
  en: "Product names, camera brands, and AI-platform names are trademarks of their respective owners; their use here is nominative (to identify the target) and implies no affiliation or endorsement.",
  es: "Los nombres de productos, las marcas de cámaras y las plataformas de IA son marcas registradas de sus respectivos propietarios; su uso aquí es nominativo (para identificar el destino) y no implica afiliación ni respaldo.",
  zh: "产品名称、相机品牌及 AI 平台名称均为其各自所有者的商标；此处仅作指代性使用（用于标识目标），不表示任何隶属或认可关系。",
  ar: "أسماء المنتجات وعلامات الكاميرات وأسماء منصّات الذكاء الاصطناعي هي علامات تجارية تخصّ أصحابها؛ واستخدامها هنا لأغراض التعريف فقط ولا يعني أي انتماء أو تأييد.",
};

export const FIXUPS: Record<Locale, Dict> = {
  id: { "view.noCameraGeneric": "Tanpa kamera (generik)", "sys.untitled": "Tanpa nama", "legal.trademarks": TRADEMARKS.id },
  en: { "view.noCameraGeneric": "No camera (generic)", "sys.untitled": "Untitled", "legal.trademarks": TRADEMARKS.en },
  es: { "view.noCameraGeneric": "Sin cámara (genérica)", "sys.untitled": "Sin título", "legal.trademarks": TRADEMARKS.es },
  zh: { "view.noCameraGeneric": "无相机（通用）", "sys.untitled": "未命名", "legal.trademarks": TRADEMARKS.zh },
  ar: { "view.noCameraGeneric": "بدون كاميرا (عام)", "sys.untitled": "بدون عنوان", "legal.trademarks": TRADEMARKS.ar },
};
