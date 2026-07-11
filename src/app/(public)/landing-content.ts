/**
 * landing-content — SSOT for the public landing (/) copy.
 * Pure data module (LOC-exempt). page.tsx imports + .map-s this.
 * Steps ported from the deleted (app)/beranda hero+STEPS (DRY).
 */

export type BadgeTone = "default" | "new" | "highlight" | "outline";

export const hero = {
  badges: [
    { label: "framepilot", tone: "new" as BadgeTone },
    { label: "Camera Angle Guide Pro", tone: "outline" as BadgeTone },
  ],
  title: "Susun posisi kamera di 3D, dapat Prompt Kamera siap-tempel buat Runway, Kling, Luma, Sora, Veo & Hailuo.",
  purpose:
    "Camera Angle Guide Pro untuk sineas, kreator konten, dan storyboard artist: rancang tiap angle di studio 3D interaktif — ukuran shot, sudut, subjek, lensa, satu gerakan kamera, dan speed — lalu pilih platform video-AI dan salin Prompt Kamera yang tinggal ditempel ke Runway, Kling, Luma, Sora, Veo, atau Hailuo. Punya referensi? Impor foto · YouTube · teks · JSON di Pustaka Data untuk mengekstrak data sudut kamera lebih dulu.",
  ctas: [
    { label: "Buka Studio 3D", href: "/editor", variant: "primary" as const, arrow: true },
    { label: "Impor referensi", href: "/pustaka", variant: "outline" as const, arrow: false },
    { label: "Baca Panduan", href: "/panduan", variant: "ghost" as const, arrow: false },
  ],
};

export type Screen = {
  tag: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  glyph: string;
  tone: BadgeTone;
};

export const screens: Screen[] = [
  {
    tag: "Studio 3D",
    title: "Studio",
    desc: "Rig kamera, atur frame dengan frustum & rule-of-thirds, tangkap tiap angle, lalu salin Prompt Kamera yang di-tune per platform video-AI — semua di ruang 3D interaktif.",
    href: "/editor",
    cta: "Buka Studio 3D",
    glyph: "◱",
    tone: "new",
  },
  {
    tag: "Impor",
    title: "Pustaka Data",
    desc: "Punya referensi? Tempel foto, link YouTube, teks, atau JSON — framepilot mengekstraknya jadi data sudut kamera terstruktur yang bisa diterapkan ke scene.",
    href: "/pustaka",
    cta: "Buka Pustaka Data",
    glyph: "▤",
    tone: "outline",
  },
];

export type Step = {
  n: string;
  tag: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
};

export const steps: Step[] = [
  {
    n: "01",
    tag: "Studio 3D",
    title: "Susun di Studio 3D",
    href: "/editor",
    cta: "Buka Studio 3D",
    desc: "Rancang posisi kamera secara interaktif — ukuran shot, sudut, subjek, lensa, satu gerakan kamera, dan speed — lalu tangkap tiap angle di ruang 3D.",
  },
  {
    n: "02",
    tag: "Platform",
    title: "Pilih platform video-AI",
    href: "/editor",
    cta: "Buka Studio 3D",
    desc: "Tentukan target: Runway, Kling, Luma, Sora, Veo, atau Hailuo. Prompt Kamera langsung di-tune mengikuti gaya platform yang kamu pilih.",
  },
  {
    n: "03",
    tag: "Prompt Kamera",
    title: "Salin Prompt Kamera",
    href: "/editor",
    cta: "Salin Prompt Kamera",
    desc: "Ambil Prompt Kamera yang siap tempel ke platform video-AI. Butuh referensi lebih dulu? Ekstrak data sudut kamera dari foto · YouTube · teks di Pustaka Data.",
  },
];

export type Feature = { title: string; desc: string };

export const features: Feature[] = [
  {
    title: "Impor multi-sumber",
    desc: "Foto, link YouTube, teks bebas, atau JSON — satu pintu masuk untuk semua referensi shot.",
  },
  {
    title: "Skema camera-angle-guide/v2",
    desc: "Setiap entri jadi data sudut kamera terstruktur & konsisten yang bisa dipakai ulang.",
  },
  {
    title: "Preset sudut · shot · lensa",
    desc: "Pustaka preset framing, jenis shot, dan lensa untuk mempercepat perancangan angle.",
  },
  {
    title: "Studio 3D + frustum & thirds",
    desc: "Lihat frustum kamera dan panduan rule-of-thirds langsung di ruang 3D interaktif.",
  },
  {
    title: "Prompt Kamera per platform",
    desc: "Salin Prompt Kamera yang di-tune untuk Runway · Kling · Luma · Sora · Veo · Hailuo, atau ekspor JSON · CSV · storyboard tanpa pindah tool.",
  },
  {
    title: "Tema Terang · Gelap · Sistem",
    desc: "Ikut preferensi sistem atau kunci manual, lengkap dengan preset palet Rupa.",
  },
];

export const closing = {
  title: "Mulai sekarang",
  desc: "Susun posisi kamera di Studio 3D, pilih platform video-AI, lalu salin Prompt Kamera siap-tempel. Punya referensi? Impor dulu di Pustaka Data.",
  cta: { label: "Buka Studio 3D", href: "/editor" },
};
