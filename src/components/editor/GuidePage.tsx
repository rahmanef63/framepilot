"use client";
// GuidePage.tsx — "Guide Belajar" (plan G25). Faithful port of the concept
// LEARNING GUIDE page (concept #guidePage, DOM lines ~913-966). Static camera-grammar
// content: hero + score tiles, 6 angle cards, 6 shot cards, 4 workflow steps, closing note.
// Each "Coba di Editor" CTA applies its preset to the live rig then jumps to the Editor tab.
// Rendered inside EditorScreen's `.page.guide-page` wrapper (that div owns .active toggling),
// so this component only emits the inner `.guide-shell`. Reuses editor.css classes 1:1.
// Static reference tables live in ./guide-content (pure data, excluded from the LOC cap).

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Button } from "@/components/ds/Button";
import { ANGLE_CARDS, SHOT_CARDS, WORKFLOW } from "./guide-content";

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
              <Button variant="outline" size="sm" onClick={() => tryAngle(c.el, c.roll)}>
                Coba di Editor
              </Button>
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
              <Button variant="outline" size="sm" onClick={() => tryShot(c.r)}>
                Coba di Editor
              </Button>
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
