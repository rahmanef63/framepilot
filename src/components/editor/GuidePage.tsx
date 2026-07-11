"use client";
// GuidePage.tsx — "Guide Belajar" (plan G25). Faithful port of the concept
// LEARNING GUIDE page (concept #guidePage, DOM lines ~913-966). Static camera-grammar
// content: hero + score tiles, 6 angle cards, 6 shot cards, 4 workflow steps, closing note.
// Each "Coba di Editor" CTA applies its preset to the live rig then jumps to the Editor tab.
// Rendered inside EditorScreen's `.page.guide-page` wrapper (that div owns .active toggling),
// so this component only emits the inner `.guide-shell`. Reuses editor.css classes 1:1.

import React from "react";
import { useEditor } from "@/state/EditorState";

// concept data-guide-el / data-guide-roll (concept DOM lines 933-938)
const ANGLE_CARDS: {
  kicker: string;
  title: string;
  desc: string;
  use: string;
  useRest: string;
  el: number;
  roll: number;
}[] = [
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
const SHOT_CARDS: {
  kicker: string;
  title: string;
  desc: string;
  use: string;
  useRest: string;
  r: number;
}[] = [
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
const WORKFLOW: { step: string; title: string; desc: string }[] = [
  { step: "STEP 1", title: "Block", desc: "Posisikan subjek dan kamera dari Top/Left/Right/Isometric." },
  { step: "STEP 2", title: "Frame", desc: "Pilih angle, shot size, lensa, aspect ratio, dan komposisi." },
  { step: "STEP 3", title: "Describe", desc: "Isi tujuan, aksi, movement, lighting, style, dan audio." },
  { step: "STEP 4", title: "Deliver", desc: "Preview scene lalu ekspor JSON, CSV, prompt, atau storyboard." },
];

export function GuidePage() {
  const { applyAnglePreset, applyShotPreset, setMainTab } = useEditor();

  // concept #guidePage click handler (lines 2665-2674): apply preset then jump to Editor.
  const tryAngle = (el: number, roll: number) => {
    applyAnglePreset(el, roll);
    setMainTab("editor");
  };
  const tryShot = (r: number) => {
    applyShotPreset(r);
    setMainTab("editor");
  };

  return (
    <div className="guide-shell">
      {/* hero + score tiles */}
      <section className="guide-hero">
        <div>
          <div className="eyebrow">Camera grammar for beginners</div>
          <h2>Angle memberi makna. Shot size mengatur kedekatan. Lensa mengubah rasa ruang.</h2>
          <p>
            Gunakan guide ini sebagai keputusan kreatif, bukan daftar istilah. Setiap tombol “Coba di
            Editor” langsung menerapkan contoh pada rig 3D agar perbedaannya terlihat, bukan hanya
            dibaca.
          </p>
        </div>
        <div className="guide-score">
          <div>
            <b>6</b>
            <span>Shot size utama</span>
          </div>
          <div>
            <b>6</b>
            <span>Angle dasar</span>
          </div>
          <div>
            <b>5</b>
            <span>Output ratio</span>
          </div>
          <div>
            <b>1</b>
            <span>Shot list terpadu</span>
          </div>
        </div>
      </section>

      {/* 01 · Camera angle */}
      <section className="guide-section">
        <div className="guide-section-head">
          <div>
            <div className="eyebrow">01 · Camera angle</div>
            <h3>Pilih sudut berdasarkan relasi kuasa dan informasi</h3>
          </div>
          <p>Elevasi kamera relatif terhadap titik fokus</p>
        </div>
        <div className="learn-grid">
          {ANGLE_CARDS.map((c) => (
            <article className="learn-card" key={c.title}>
              <div className="card-kicker">{c.kicker}</div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
              <div className="use">
                <b>{c.use}</b> {c.useRest}
              </div>
              <button type="button" onClick={() => tryAngle(c.el, c.roll)}>
                Coba di Editor
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* 02 · Shot size */}
      <section className="guide-section">
        <div className="guide-section-head">
          <div>
            <div className="eyebrow">02 · Shot size</div>
            <h3>Atur seberapa banyak informasi yang boleh masuk</h3>
          </div>
          <p>Dihitung dari tinggi subjek, jarak, dan FOV</p>
        </div>
        <div className="learn-grid">
          {SHOT_CARDS.map((c) => (
            <article className="learn-card" key={c.title}>
              <div className="card-kicker">{c.kicker}</div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
              <div className="use">
                <b>{c.use}</b> {c.useRest}
              </div>
              <button type="button" onClick={() => tryShot(c.r)}>
                Coba di Editor
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* 03 · Workflow */}
      <section className="guide-section">
        <div className="guide-section-head">
          <div>
            <div className="eyebrow">03 · Workflow</div>
            <h3>Dari ide menjadi briefing produksi</h3>
          </div>
        </div>
        <div className="workflow-grid">
          {WORKFLOW.map((w) => (
            <article className="workflow-step" key={w.step}>
              <b>{w.step}</b>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="guide-note">
        <b>Prinsip penting:</b> jangan memilih angle karena “terlihat keren”. Mulai dari informasi apa
        yang perlu dipahami penonton, emosi apa yang perlu dirasakan, lalu pilih posisi kamera yang
        paling jujur menyampaikan keduanya.
      </div>
    </div>
  );
}

export default GuidePage;
