/**
 * docs-content — SSOT for the /docs pages. Pure data (LOC-exempt); page.tsx maps
 * it into a TOC + sections. Refreshed from the retired public landing copy.
 */

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "steps"; items: { n: string; t: string; d: string }[] }
  | { type: "list"; items: string[] }
  | { type: "cta"; label: string; href: string };

export type DocSection = { id: string; title: string; lead: string; blocks: DocBlock[] };

export const DOCS: DocSection[] = [
  {
    id: "kenalan",
    title: "Kenalan",
    lead:
      "Camera Angle Guide Pro mengubah ide shot jadi Prompt Kamera siap-tempel untuk platform video-AI.",
    blocks: [
      {
        type: "p",
        text:
          "Buat sineas, kreator konten, dan storyboard artist: rancang tiap angle di studio 3D interaktif — ukuran shot, sudut, subjek, lensa, satu gerakan kamera, dan speed — lalu pilih platform video-AI dan salin Prompt Kamera yang tinggal ditempel ke Runway, Kling, Luma, Sora, Veo, atau Hailuo.",
      },
      {
        type: "p",
        text:
          "Yang bikin beda: prompt-nya membawa geometri kamera 3D asli (elevasi, arah hadap/azimuth, jarak, tinggi, dutch tilt) — bukan cuma label preset — jadi platform video-AI dapat instruksi posisi kamera yang jelas.",
      },
      { type: "cta", label: "Buka Studio 3D →", href: "/" },
    ],
  },
  {
    id: "mulai",
    title: "Mulai cepat",
    lead: "Tiga langkah dari nol ke prompt. Butuh dipandu? Klik tombol Tur (🎓) di header Studio.",
    blocks: [
      {
        type: "steps",
        items: [
          {
            n: "01",
            t: "Susun di Studio 3D",
            d: "Atur posisi kamera secara interaktif (orbit/zoom/pan atau WASD), lalu klik + Frame untuk menangkap angle sebagai satu shot. Ulangi untuk tiap angle.",
          },
          {
            n: "02",
            t: "Pilih platform video-AI",
            d: "Tentukan target: Runway, Kling, Luma, Sora, Veo, Hailuo, dan lainnya. Prompt langsung di-tune mengikuti gaya platform.",
          },
          {
            n: "03",
            t: "Salin Prompt Kamera",
            d: "Atur detail lewat checkbox (lensa, jarak, gerakan, rasio…), lalu klik Salin dan tempel ke platform. Selesai.",
          },
        ],
      },
    ],
  },
  {
    id: "prompt",
    title: "Prompt Kamera",
    lead: "Satu shot → satu string kamera yang di-skin per platform.",
    blocks: [
      {
        type: "p",
        text:
          "Prompt Kamera adalah output hero: kalimat ukuran shot + sudut + subjek + lensa + geometri kamera + satu gerakan + speed + rasio, di-encode berbeda untuk tiap platform (kalimat natural, string-eksak Luma, atau token [bracket] Hailuo).",
      },
      {
        type: "p",
        text:
          "Dropdown “Detail prompt” di tab Prompt punya checkbox per klausa (lensa, depth of field, elevasi, arah hadap, jarak, tinggi, dutch tilt, gerakan, rasio). Centang/hapus untuk merakit prompt persis yang kamu mau — hasilnya diperbarui langsung.",
      },
    ],
  },
  {
    id: "platform",
    title: "Platform video-AI",
    lead: "10 target didukung; masing-masing pakai best-practice-nya sendiri.",
    blocks: [
      {
        type: "list",
        items: [
          "Runway — kalimat natural, satu gerakan/shot, selalu ada speed.",
          "Kling — gerakan di 8–10 kata pertama + kata tempo.",
          "Google Veo — gerakan kamera jadi kalimat pendek tersendiri.",
          "Sora — pimpin dengan frame, gerakan 5–10 kata.",
          "Luma — string-eksak + bisa di-stack (“camera push in”).",
          "Hailuo / MiniMax — token [Push in] / [Truck left], maks 3.",
          "Pika — kalimat natural, kosakata umum.",
          "Higgsfield — kalimat + satu preset Camera-Motion.",
          "Wan 2.x — kalimat natural, verba kamera polos + tempo.",
          "Seedance — kalimat natural, satu gerakan jelas/shot.",
        ],
      },
    ],
  },
  {
    id: "impor",
    title: "Impor referensi",
    lead: "Punya referensi lebih dulu? Ekstrak data sudut kamera di Pustaka.",
    blocks: [
      {
        type: "p",
        text:
          "Tempel foto, link YouTube, teks, atau JSON di Pustaka Data — framepilot mengekstraknya jadi data sudut kamera terstruktur (skema camera-angle-guide/v2) yang bisa diterapkan ke scene, lalu disempurnakan di Studio 3D.",
      },
      { type: "cta", label: "Buka Pustaka →", href: "/library" },
    ],
  },
];
