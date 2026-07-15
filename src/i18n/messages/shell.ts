// SHELL — header breadcrumb + language-switcher strings, owned by hand (the app
// header is migrated directly, not by the fan-out). Namespaces header.* / lang.*.
import type { Locale, Dict } from "../types";

export const SHELL: Record<Locale, Dict> = {
  id: {
    "header.crumb.studio": "Studio 3D",
    "header.crumb.library": "Pustaka",
    "header.crumb.guide": "Panduan",
    "header.crumb.admin": "Admin",
    "header.crumb.fallback": "Studio 3D · Prompt Kamera",
    "header.schema": "Skema",
    "header.toggleSidebar": "Buka/tutup sidebar",
    "lang.label": "Bahasa",
  },
  en: {
    "header.crumb.studio": "3D Studio",
    "header.crumb.library": "Library",
    "header.crumb.guide": "Guide",
    "header.crumb.admin": "Admin",
    "header.crumb.fallback": "3D Studio · Camera Prompt",
    "header.schema": "Schema",
    "header.toggleSidebar": "Toggle sidebar",
    "lang.label": "Language",
  },
  es: {
    "header.crumb.studio": "Estudio 3D",
    "header.crumb.library": "Biblioteca",
    "header.crumb.guide": "Guía",
    "header.crumb.admin": "Admin",
    "header.crumb.fallback": "Estudio 3D · Prompt de cámara",
    "header.schema": "Esquema",
    "header.toggleSidebar": "Alternar barra lateral",
    "lang.label": "Idioma",
  },
  zh: {
    "header.crumb.studio": "3D 工作室",
    "header.crumb.library": "素材库",
    "header.crumb.guide": "指南",
    "header.crumb.admin": "管理",
    "header.crumb.fallback": "3D 工作室 · 相机提示词",
    "header.schema": "结构",
    "header.toggleSidebar": "切换侧边栏",
    "lang.label": "语言",
  },
  ar: {
    "header.crumb.studio": "استوديو 3D",
    "header.crumb.library": "المكتبة",
    "header.crumb.guide": "الدليل",
    "header.crumb.admin": "الإدارة",
    "header.crumb.fallback": "استوديو 3D · موجه الكاميرا",
    "header.schema": "المخطط",
    "header.toggleSidebar": "تبديل الشريط الجانبي",
    "lang.label": "اللغة",
  },
};
