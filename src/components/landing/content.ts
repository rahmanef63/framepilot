// Landing copy for the SSR, per-locale SEO pages (/en, /es, /zh, /ar, /id).
// This is SERVER-rendered marketing text — independent of the client i18n system —
// so crawlers get fully translated HTML without running JS. Kept concise on purpose.
import type { Locale } from "@/i18n";

export interface LandingCopy {
  metaTitle: string;
  metaDesc: string;
  h1: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  features: { title: string; desc: string }[];
  footerTagline: string;
  ogLocale: string; // OpenGraph locale code
}

// The 10 target platforms — brand names, same across locales (keyword-rich strip).
export const PLATFORMS = [
  "Runway", "Kling", "Veo", "Luma", "Higgsfield", "Wan", "Seedance", "Hailuo", "Pika", "LTX",
];

export const LANDING: Record<Locale, LandingCopy> = {
  en: {
    metaTitle: "Camera Angle Guide Pro — 3D shot planning → AI video prompts",
    metaDesc:
      "Plan camera angles, lenses and moves in an interactive 3D studio, then export paste-ready prompts for AI video (Runway, Kling, Veo, Luma, and more). Free & open-source.",
    h1: "Plan your shots in 3D. Export prompts for AI video.",
    sub: "Compose camera angles, lenses and moves in an interactive 3D studio, then copy a paste-ready prompt for Runway, Kling, Veo, Luma, and more.",
    ctaPrimary: "Open the studio",
    ctaSecondary: "Read the docs",
    features: [
      { title: "3D shot planning", desc: "Position the camera, subject and lens in a real 3D scene. What you see is what the prompt describes." },
      { title: "10 AI-video platforms", desc: "One shot, re-encoded for each platform's prompt style — with no rewriting." },
      { title: "Free & installable", desc: "Runs in your browser, works offline as a PWA, and needs no sign-up to start." },
    ],
    footerTagline: "Free and open-source (MIT).",
    ogLocale: "en_US",
  },
  id: {
    metaTitle: "Camera Angle Guide Pro — perencanaan shot 3D → prompt AI video",
    metaDesc:
      "Rancang sudut kamera, lensa, dan gerakan di studio 3D interaktif, lalu ekspor prompt siap-tempel untuk AI video (Runway, Kling, Veo, Luma, dll). Gratis & open-source.",
    h1: "Rancang shot dalam 3D. Ekspor prompt untuk AI video.",
    sub: "Susun sudut kamera, lensa, dan pergerakan di studio 3D interaktif, lalu salin prompt siap-tempel untuk Runway, Kling, Veo, Luma, dan lainnya.",
    ctaPrimary: "Buka studio",
    ctaSecondary: "Baca dokumentasi",
    features: [
      { title: "Perencanaan shot 3D", desc: "Atur kamera, subjek, dan lensa di scene 3D nyata. Apa yang kamu lihat, itulah yang prompt gambarkan." },
      { title: "10 platform AI video", desc: "Satu shot, dikodekan ulang untuk gaya prompt tiap platform — tanpa menulis ulang." },
      { title: "Gratis & bisa dipasang", desc: "Berjalan di browser, bekerja offline sebagai PWA, dan tanpa perlu daftar untuk memulai." },
    ],
    footerTagline: "Gratis dan open-source (MIT).",
    ogLocale: "id_ID",
  },
  es: {
    metaTitle: "Camera Angle Guide Pro — planificación de tomas 3D → prompts de vídeo IA",
    metaDesc:
      "Planifica ángulos de cámara, lentes y movimientos en un estudio 3D interactivo y exporta prompts listos para pegar para vídeo con IA (Runway, Kling, Veo, Luma y más). Gratis y de código abierto.",
    h1: "Planifica tus tomas en 3D. Exporta prompts para vídeo con IA.",
    sub: "Compón ángulos de cámara, lentes y movimientos en un estudio 3D interactivo y copia un prompt listo para pegar en Runway, Kling, Veo, Luma y más.",
    ctaPrimary: "Abrir el estudio",
    ctaSecondary: "Leer la documentación",
    features: [
      { title: "Planificación de tomas en 3D", desc: "Coloca la cámara, el sujeto y la lente en una escena 3D real. Lo que ves es lo que describe el prompt." },
      { title: "10 plataformas de vídeo con IA", desc: "Una toma, recodificada al estilo de prompt de cada plataforma, sin reescribir nada." },
      { title: "Gratis e instalable", desc: "Funciona en tu navegador, sin conexión como PWA, y sin registro para empezar." },
    ],
    footerTagline: "Gratis y de código abierto (MIT).",
    ogLocale: "es_ES",
  },
  zh: {
    metaTitle: "Camera Angle Guide Pro — 3D 镜头规划 → AI 视频提示词",
    metaDesc:
      "在交互式 3D 工作室中规划机位、镜头与运镜，导出可直接粘贴的 AI 视频提示词（Runway、Kling、Veo、Luma 等）。免费开源。",
    h1: "用 3D 规划镜头，导出 AI 视频提示词。",
    sub: "在交互式 3D 工作室中编排机位、镜头与运镜，然后复制可直接粘贴的提示词，用于 Runway、Kling、Veo、Luma 等平台。",
    ctaPrimary: "打开工作室",
    ctaSecondary: "查看文档",
    features: [
      { title: "3D 镜头规划", desc: "在真实的 3D 场景中摆放相机、主体与镜头。所见即提示词所述。" },
      { title: "10 个 AI 视频平台", desc: "同一个镜头，按各平台的提示词风格重新编码，无需重写。" },
      { title: "免费且可安装", desc: "在浏览器中运行，可作为 PWA 离线使用，无需注册即可开始。" },
    ],
    footerTagline: "免费、开源（MIT）。",
    ogLocale: "zh_CN",
  },
  ar: {
    metaTitle: "Camera Angle Guide Pro — تخطيط لقطات ثلاثي الأبعاد ← مطالبات فيديو الذكاء الاصطناعي",
    metaDesc:
      "خطّط زوايا الكاميرا والعدسات والحركات في استوديو ثلاثي الأبعاد، ثم صدّر مطالبات جاهزة للصق لفيديو الذكاء الاصطناعي (Runway وKling وVeo وLuma وغيرها). مجاني ومفتوح المصدر.",
    h1: "خطّط لقطاتك بتقنية ثلاثية الأبعاد. صدّر مطالبات لفيديو الذكاء الاصطناعي.",
    sub: "نسّق زوايا الكاميرا والعدسات والحركات في استوديو ثلاثي الأبعاد تفاعلي، ثم انسخ مطالبة جاهزة للّصق في Runway وKling وVeo وLuma وغيرها.",
    ctaPrimary: "افتح الاستوديو",
    ctaSecondary: "اقرأ الوثائق",
    features: [
      { title: "تخطيط اللقطات ثلاثي الأبعاد", desc: "ضَع الكاميرا والهدف والعدسة في مشهد ثلاثي الأبعاد حقيقي. ما تراه هو ما تصفه المطالبة." },
      { title: "10 منصّات لفيديو الذكاء الاصطناعي", desc: "لقطة واحدة، يُعاد ترميزها بأسلوب مطالبة كل منصّة — دون إعادة كتابة." },
      { title: "مجاني وقابل للتثبيت", desc: "يعمل في متصفحك، ويعمل دون اتصال كتطبيق ويب تقدّمي، دون تسجيل للبدء." },
    ],
    footerTagline: "مجاني ومفتوح المصدر (MIT).",
    ogLocale: "ar_AR",
  },
};
