// guide-content.ts — pure static content for GuidePage ("Guide Belajar", plan G25).
// Faithful port of the concept LEARNING GUIDE (concept #guidePage, DOM lines ~913-966).
// Extracted from GuidePage.tsx so the component stays under the rr LOC cap (pure data
// exports are excluded). No JSX, no logic — just the camera-grammar reference tables.

// concept data-guide-el / data-guide-roll (concept DOM lines 933-938)
export type AngleCard = {
  kicker: string;
  title: string;
  desc: string;
  use: string;
  useRest: string;
  el: number;
  roll: number;
};

export const ANGLE_CARDS: AngleCard[] = [
  {
    kicker: "Netral · 0°",
    title: "Eye Level",
    desc: "Kamera sejajar mata. Terasa jujur, dekat, dan tidak memaksakan penilaian pada subjek.",
    use: "Pakai untuk:",
    useRest: "dialog, interview, tutorial.",
    el: 0,
    roll: 0,
  },
  {
    kicker: "Dominan · +35°",
    title: "High Angle",
    desc: "Kamera melihat ke bawah. Subjek terasa lebih kecil, rentan, tertekan, atau sedang diamati.",
    use: "Pakai untuk:",
    useRest: "vulnerability, reveal ruang.",
    el: 35,
    roll: 0,
  },
  {
    kicker: "Power · −25°",
    title: "Low Angle",
    desc: "Kamera melihat ke atas. Menambah skala, kekuatan, ancaman, atau rasa heroik.",
    use: "Pakai untuk:",
    useRest: "hero shot, authority, product.",
    el: -25,
    roll: 0,
  },
  {
    kicker: "Top-down · +80°",
    title: "Bird’s Eye",
    desc: "Pandangan hampir tegak dari atas. Membaca pola, blocking, dan hubungan antarobjek dengan jelas.",
    use: "Pakai untuk:",
    useRest: "layout, food, choreography.",
    el: 80,
    roll: 0,
  },
  {
    kicker: "Extreme low · −55°",
    title: "Worm’s Eye",
    desc: "Sudut sangat rendah yang mendramatisasi tinggi dan membuat lingkungan terasa monumental.",
    use: "Pakai untuk:",
    useRest: "spectacle, architecture, tension.",
    el: -55,
    roll: 0,
  },
  {
    kicker: "Unstable · roll 18°",
    title: "Dutch Angle",
    desc: "Horizon dimiringkan. Memberi rasa tidak stabil, aneh, panik, atau dunia yang mulai “salah”.",
    use: "Hindari:",
    useRest: "pemakaian dekoratif tanpa alasan.",
    el: 5,
    roll: 18,
  },
];

// concept data-guide-r (concept DOM lines 945-950)
export type ShotCard = {
  kicker: string;
  title: string;
  desc: string;
  use: string;
  useRest: string;
  r: number;
};

export const SHOT_CARDS: ShotCard[] = [
  {
    kicker: "ECU",
    title: "Extreme Close-Up",
    desc: "Detail sangat kecil—mata, tangan, tekstur produk. Intens dan sangat spesifik.",
    use: "Fungsi:",
    useRest: "detail penting, sensory cue.",
    r: 0.22,
  },
  {
    kicker: "CU",
    title: "Close-Up",
    desc: "Wajah atau detail utama mengisi frame. Prioritasnya emosi, reaksi, atau kualitas produk.",
    use: "Fungsi:",
    useRest: "emosi dan emphasis.",
    r: 0.45,
  },
  {
    kicker: "MCU",
    title: "Medium Close-Up",
    desc: "Kompromi antara ekspresi dan bahasa tubuh. Sangat efektif untuk talking-head.",
    use: "Fungsi:",
    useRest: "dialog, edukasi, testimonial.",
    r: 0.75,
  },
  {
    kicker: "MS",
    title: "Medium Shot",
    desc: "Menampilkan gestur dan interaksi tanpa kehilangan wajah. Ini “default” yang fleksibel.",
    use: "Fungsi:",
    useRest: "presentasi, aksi ringan.",
    r: 1.15,
  },
  {
    kicker: "FS",
    title: "Full Shot",
    desc: "Seluruh tubuh terlihat. Blocking, pose, kostum, dan relasi dengan lantai menjadi penting.",
    use: "Fungsi:",
    useRest: "fashion, movement, choreography.",
    r: 1.8,
  },
  {
    kicker: "WS",
    title: "Wide Shot",
    desc: "Lingkungan ikut bercerita. Subjek menjadi bagian dari ruang, bukan satu-satunya informasi.",
    use: "Fungsi:",
    useRest: "establishing, scale, geography.",
    r: 3,
  },
];

// concept DOM lines 957-960
export type WorkflowStep = { step: string; title: string; desc: string };

export const WORKFLOW: WorkflowStep[] = [
  { step: "STEP 1", title: "Block", desc: "Posisikan subjek dan kamera dari Top/Left/Right/Isometric." },
  { step: "STEP 2", title: "Frame", desc: "Pilih angle, shot size, lensa, aspect ratio, dan komposisi." },
  { step: "STEP 3", title: "Describe", desc: "Isi tujuan, aksi, movement, lighting, style, dan audio." },
  { step: "STEP 4", title: "Deliver", desc: "Preview scene lalu ekspor JSON, CSV, prompt, atau storyboard." },
];
