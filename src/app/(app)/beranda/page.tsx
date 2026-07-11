import Link from "next/link";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";

/**
 * Beranda — the home screen. States the purpose of framepilot in one glance,
 * then walks the user through the core flow: Impor → Studio 3D → Ekspor.
 */

const STEPS = [
  {
    n: "01",
    tag: "Impor",
    title: "Impor data di Pustaka",
    href: "/",
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

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "var(--border-width) solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ font: "700 12px var(--font-mono)", color: "var(--subtle-foreground)" }}>{step.n}</span>
        <Badge tone={index === 0 ? "new" : "outline"}>{step.tag}</Badge>
      </div>
      <div style={{ font: "700 15px var(--font-sans)", color: "var(--foreground)" }}>{step.title}</div>
      <p style={{ font: "400 13px/1.55 var(--font-sans)", color: "var(--muted-foreground)", margin: 0, flex: 1 }}>
        {step.desc}
      </p>
      <Link href={step.href} style={{ textDecoration: "none" }}>
        <Button variant="outline" size="sm" style={{ width: "100%" }}>
          {step.cta} →
        </Button>
      </Link>
    </div>
  );
}

export default function BerandaPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 40 }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Hero */}
        <header style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 660 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge tone="new">framepilot</Badge>
            <Badge tone="outline">Camera Angle Guide Pro</Badge>
          </div>
          <h1 style={{ font: "800 30px/1.2 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>
            Ubah ide & referensi shot jadi data sudut kamera + prompt AI siap pakai.
          </h1>
          <p style={{ font: "400 15px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
            framepilot untuk sineas, kreator konten, dan storyboard artist: impor ide shot atau referensi (foto ·
            YouTube · teks · JSON), rapikan jadi data sudut kamera terstruktur, lalu rancang dan tangkap tiap angle di
            studio 3D interaktif. Hasil akhir: prompt AI, CSV, atau storyboard yang tinggal ditempel.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md">
                Mulai di Pustaka →
              </Button>
            </Link>
            <Link href="/editor" style={{ textDecoration: "none" }}>
              <Button variant="outline" size="md">
                Buka Studio 3D
              </Button>
            </Link>
            <Link href="/panduan" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="md">
                Baca Panduan
              </Button>
            </Link>
          </div>
        </header>

        {/* Quick start */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 style={{ font: "700 14px var(--font-sans)", color: "var(--foreground)", margin: 0 }}>
              Mulai cepat · 3 langkah
            </h2>
            <span style={{ font: "400 12px var(--font-mono)", color: "var(--subtle-foreground)" }}>
              Impor → Studio 3D → Ekspor
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {STEPS.map((step, i) => (
              <StepCard key={step.n} step={step} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
