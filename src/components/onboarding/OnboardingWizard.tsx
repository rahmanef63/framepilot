"use client";
// OnboardingWizard.tsx — a tiny step-by-step coach-mark tour (no library). Each
// step spotlights a [data-tour="…"] element (dim surround via a big box-shadow +
// a highlight ring) and floats a tooltip card near it with Kembali / Lewati /
// Lanjut. Auto-runs ONCE per browser (localStorage) on the Studio; replay by
// firing the `cag:start-tour` window event (the header "Tur" button does this).
// Steps that live in the Prompt tab flip the panel to it before measuring.
// Targets that are hidden (collapsed sidebar / mobile drawer) degrade to a
// centered card instead of a broken spotlight.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@/state/EditorState";
import "./onboarding.css";

type Step = { target?: string; title: string; body: string; promptTab?: boolean };

const STEPS: Step[] = [
  {
    title: "Selamat datang di Studio 3D 👋",
    body: "Alur inti cuma 3 langkah: atur kamera → tambah frame → salin Prompt Kamera. Tur singkat ini nunjukin tombolnya. Klik Lanjut, atau Lewati kapan saja.",
  },
  {
    target: "viewport",
    title: "1 · Atur kamera di 3D",
    body: "Drag untuk orbit, scroll untuk zoom, klik-kanan untuk pan (WASD/QE juga jalan). Ini menentukan sudut & posisi kamera shot kamu.",
  },
  {
    target: "drag",
    title: "2 · Mode geser",
    body: "Pilih apa yang digeser saat drag: Navigasi (kamera bebas), Subjek (geser objek), atau Kamera (posisi kamera presisi).",
  },
  {
    target: "add-frame",
    title: "3 · Tambah frame",
    body: "Puas dengan angle? Klik + Frame untuk menyimpannya sebagai satu shot. Ulangi untuk tiap angle yang kamu mau.",
  },
  {
    target: "shots",
    title: "4 · Kelola scene & frame",
    body: "Semua shot ada di sidebar ini — putar berurutan, urutkan, duplikat, hapus, atau kelompokkan per scene.",
  },
  {
    target: "panel-prompt",
    title: "5 · Tab Prompt",
    body: "Buka tab Prompt untuk melihat Prompt Kamera siap-tempel dari shot yang terpilih.",
  },
  {
    target: "platform",
    promptTab: true,
    title: "6 · Pilih platform video-AI",
    body: "Runway, Kling, Veo, Sora, Luma, Hailuo, dll. Prompt langsung di-tune mengikuti gaya platform yang kamu pilih.",
  },
  {
    target: "detail-prompt",
    promptTab: true,
    title: "7 · Atur detail prompt",
    body: "Centang / hapus klausa (lensa, jarak, gerakan kamera, rasio…) — prompt diperbarui langsung saat kamu ubah.",
  },
  {
    target: "copy",
    promptTab: true,
    title: "8 · Salin & tempel",
    body: "Klik Salin, lalu tempel ke platform video-AI pilihanmu. Selesai — shot kamu siap dibuat! 🎬",
  },
];

const KEY = "cag.onboarded";
const TIP_W = 320;

export function OnboardingWizard() {
  const ctx = useEditor();
  const setPanelTab = ctx.setPanelTab;
  const [run, setRun] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const stop = useCallback((markDone: boolean) => {
    setRun(false);
    if (markDone && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, []);

  const start = useCallback(() => {
    setI(0);
    setRun(true);
  }, []);

  // auto-run once per browser (desktop only — the tour highlights a desktop
  // layout; mobile users replay via the header 🎓 button). Mark seen the moment
  // we decide to run so a reload BEFORE finishing never relaunches it.
  useEffect(() => {
    let seen = "1";
    try {
      seen = window.localStorage.getItem(KEY) || "";
    } catch {
      /* ignore */
    }
    if (!seen && window.innerWidth >= 900) {
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      const t = window.setTimeout(start, 700); // let the 3D + panel settle first
      return () => window.clearTimeout(t);
    }
  }, [start]);

  useEffect(() => {
    const onStart = () => start();
    window.addEventListener("cag:start-tour", onStart);
    return () => window.removeEventListener("cag:start-tour", onStart);
  }, [start]);

  const step = STEPS[i];

  // Flip to the Prompt tab for the steps whose target lives there.
  useEffect(() => {
    if (run && step?.promptTab) setPanelTab("shot");
  }, [run, i, step?.promptTab, setPanelTab]);

  // Measure the target (after the panel/tab settles); re-measure on scroll/resize.
  const measure = useCallback(() => {
    if (!run || !step) return;
    if (!step.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const offscreen = r.right < 8 || r.bottom < 8 || r.left > vw - 8 || r.top > vh - 8;
    if (r.width < 4 || r.height < 4 || offscreen) {
      setRect(null); // hidden / off-screen (collapsed sidebar, mobile drawer) → centered card
      return;
    }
    setRect(r);
  }, [run, step]);

  useEffect(() => {
    if (!run) return;
    const t = window.setTimeout(measure, step?.promptTab ? 90 : 40);
    return () => window.clearTimeout(t);
  }, [run, i, measure, step?.promptTab]);

  useEffect(() => {
    if (!run) return;
    const h = () => measure();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("scroll", h, true);
    };
  }, [run, measure]);

  const next = useCallback(() => {
    setI((v) => {
      if (v >= STEPS.length - 1) {
        stop(true);
        return v;
      }
      return v + 1;
    });
  }, [stop]);

  // keyboard: Esc = skip, → / Enter = next, ← = back
  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop(true);
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, next, stop]);

  if (!run || !step) return null;

  const pad = 6;
  const ring = rect
    ? {
        left: rect.left - pad,
        top: rect.top - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  // tooltip placement: below the target if room, else above, else centered
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const tipH = tipRef.current?.offsetHeight ?? 168;
  let tipStyle: React.CSSProperties;
  if (!ring) {
    tipStyle = { left: "50%", top: "50%", transform: "translate(-50%,-50%)" };
  } else {
    const below = ring.top + ring.height + 12;
    const above = ring.top - tipH - 12;
    const top = below + tipH <= vh - 8 ? below : above >= 8 ? above : Math.max(8, (vh - tipH) / 2);
    const left = Math.min(Math.max(pad, ring.left), vw - TIP_W - pad);
    tipStyle = { left, top };
  }

  return (
    <div className="ob-root" role="dialog" aria-modal="true" aria-label="Tur onboarding">
      {/* full-screen click blocker (modal). Dims itself only when there is no
          spotlight; with a spotlight the dim comes from .ob-spot's box-shadow. */}
      <div className={"ob-catch" + (ring ? "" : " ob-catch--dim")} />
      {/* spotlight: a transparent box whose huge box-shadow dims everything else,
          with a ring outline around the highlighted control. */}
      {ring ? <div className="ob-spot" style={ring} /> : null}

      <div ref={tipRef} className="ob-tip" style={{ width: TIP_W, maxWidth: "calc(100vw - 16px)", ...tipStyle }}>
        <div className="ob-tip-h">{step.title}</div>
        <p className="ob-tip-b">{step.body}</p>
        <div className="ob-tip-f">
          <span className="ob-count">
            {i + 1} / {STEPS.length}
          </span>
          <div className="ob-btns">
            <button className="ob-skip" onClick={() => stop(true)}>
              Lewati
            </button>
            {i > 0 ? (
              <button className="ob-back" onClick={() => setI((v) => Math.max(0, v - 1))}>
                Kembali
              </button>
            ) : null}
            <button className="ob-next" onClick={next}>
              {i >= STEPS.length - 1 ? "Selesai" : "Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
