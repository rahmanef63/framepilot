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
  title: "Ubah ide & referensi shot jadi data sudut kamera + prompt AI siap pakai.",
  purpose:
    "Camera Angle Guide Pro untuk sineas, kreator konten, dan storyboard artist: impor ide shot atau referensi (foto · YouTube · teks · JSON), rapikan jadi data sudut kamera terstruktur (skema camera-angle-guide/v2), lalu rancang dan tangkap tiap angle di studio 3D interaktif. Hasil akhir: prompt AI, CSV, atau storyboard yang tinggal ditempel.",
  ctas: [
    { label: "Mulai di Pustaka", href: "/pustaka", variant: "primary" as const, arrow: true },
    { label: "Buka Studio 3D", href: "/editor", variant: "outline" as const, arrow: false },
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
    tag: "Data Prompt",
    title: "Pustaka",
    desc: "Parse & kelola entri: tempel foto, link YouTube, teks, atau JSON — jadikan data sudut kamera terstruktur yang siap dipakai ulang.",
    href: "/pustaka",
    cta: "Buka Pustaka",
    glyph: "▤",
    tone: "new",
  },
  {
    tag: "Studio 3D",
    title: "Editor",
    desc: "Rig kamera, atur frame dengan frustum & rule-of-thirds, tangkap tiap angle, lalu ekspor — semua di ruang 3D interaktif.",
    href: "/editor",
    cta: "Buka Studio 3D",
    glyph: "◱",
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
    tag: "Impor",
    title: "Impor data di Pustaka",
    href: "/pustaka",
    cta: "Buka Pustaka",
    desc: "Tempel ide shot, referensi foto, link YouTube, teks, atau JSON. framepilot mem-parse-nya jadi data sudut kamera terstruktur (skema camera-angle-guide/v2).",
  },
  {
    n: "02",
    tag: "Studio 3D",
    title: "Susun rig di Studio 3D",
    href: "/editor",
    cta: "Buka Studio 3D",
    desc: "Rancang rig kamera secara interaktif, tangkap frame, dan sempurnakan tiap angle di ruang 3D. Data dari Pustaka bisa langsung diterapkan ke scene.",
  },
  {
    n: "03",
    tag: "Ekspor",
    title: "Ekspor & salin prompt",
    href: "/editor",
    cta: "Ke Ekspor",
    desc: "Hasilkan prompt AI siap tempel, atau ekspor CSV dan storyboard. Dari ide sampai prompt final tanpa berpindah tool.",
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
    title: "Ekspor JSON · CSV · storyboard",
    desc: "Salin prompt AI siap tempel, atau ekspor data ke CSV dan storyboard tanpa pindah tool.",
  },
  {
    title: "Tema Terang · Gelap · Sistem",
    desc: "Ikut preferensi sistem atau kunci manual, lengkap dengan preset palet Rupa.",
  },
];

export const closing = {
  title: "Mulai sekarang",
  desc: "Dari ide sampai prompt final: impor di Pustaka, rancang di Studio 3D, ekspor sekali klik.",
  cta: { label: "Mulai di Pustaka", href: "/pustaka" },
};
