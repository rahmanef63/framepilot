import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { closing, features, hero, screens, steps } from "./landing-content";

export const metadata: Metadata = {
  title: "Camera Angle Guide Pro — ide shot jadi data sudut kamera + prompt AI",
  description:
    "Ubah ide & referensi shot (foto · YouTube · teks · JSON) jadi data sudut kamera terstruktur + prompt AI siap tempel, lalu rancang & tangkap tiap angle di studio 3D interaktif.",
};

const card = {
  background: "var(--card)",
  border: "var(--border-width) solid var(--border)",
  borderRadius: "var(--radius-lg)",
} as const;

const sectionH2 = {
  font: "700 14px var(--font-sans)",
  color: "var(--foreground)",
  margin: 0,
} as const;

function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {children}
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 40, display: "flex", flexDirection: "column", gap: 48 }}>
      {/* (a) HERO */}
      <header style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {hero.badges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </div>
        <h1 style={{ font: "800 32px/1.2 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>{hero.title}</h1>
        <p style={{ font: "400 15px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
          {hero.purpose}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          {hero.ctas.map((c) => (
            <CtaLink key={c.href + c.label} href={c.href}>
              <Button variant={c.variant} size="md">
                {c.label}
                {c.arrow ? " →" : ""}
              </Button>
            </CtaLink>
          ))}
        </div>
      </header>

      {/* (b) DUA LAYAR */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionH2}>Dua layar terhubung</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {screens.map((s) => (
            <div key={s.href} style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 96,
                  borderRadius: "var(--radius-md)",
                  background: "var(--muted)",
                  border: "var(--border-width) solid var(--border)",
                  font: "700 40px var(--font-mono)",
                  color: "var(--subtle-foreground)",
                }}
              >
                {s.glyph}
              </div>
              <Badge tone={s.tone}>{s.tag}</Badge>
              <div style={{ font: "700 16px var(--font-sans)", color: "var(--foreground)" }}>{s.title}</div>
              <p style={{ font: "400 13px/1.55 var(--font-sans)", color: "var(--muted-foreground)", margin: 0, flex: 1 }}>
                {s.desc}
              </p>
              <CtaLink href={s.href}>
                <Button variant="outline" size="sm" style={{ width: "100%" }}>
                  {s.cta} →
                </Button>
              </CtaLink>
            </div>
          ))}
        </div>
      </section>

      {/* (c) ALUR 3-LANGKAH */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h2 style={sectionH2}>Alur · 3 langkah</h2>
          <span style={{ font: "400 12px var(--font-mono)", color: "var(--subtle-foreground)" }}>
            Impor → Studio 3D → Ekspor
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {steps.map((step, i) => (
            <div key={step.n} style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ font: "700 12px var(--font-mono)", color: "var(--subtle-foreground)" }}>{step.n}</span>
                <Badge tone={i === 0 ? "new" : "outline"}>{step.tag}</Badge>
              </div>
              <div style={{ font: "700 15px var(--font-sans)", color: "var(--foreground)" }}>{step.title}</div>
              <p style={{ font: "400 13px/1.55 var(--font-sans)", color: "var(--muted-foreground)", margin: 0, flex: 1 }}>
                {step.desc}
              </p>
              <CtaLink href={step.href}>
                <Button variant="outline" size="sm" style={{ width: "100%" }}>
                  {step.cta} →
                </Button>
              </CtaLink>
            </div>
          ))}
        </div>
      </section>

      {/* (d) FITUR */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionH2}>Fitur inti</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          {features.map((f) => (
            <div key={f.title} style={{ ...card, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ font: "700 13px var(--font-sans)", color: "var(--foreground)" }}>{f.title}</div>
              <p style={{ font: "400 12px/1.5 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* (e) CTA band */}
      <section
        style={{
          ...card,
          background: "var(--muted)",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <h2 style={{ font: "800 22px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>
          {closing.title}
        </h2>
        <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0, maxWidth: 560 }}>
          {closing.desc}
        </p>
        <CtaLink href={closing.cta.href}>
          <Button variant="primary" size="lg">
            {closing.cta.label} →
          </Button>
        </CtaLink>
      </section>
    </div>
  );
}
