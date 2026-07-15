"use client";
import React from "react";
import { useT } from "@/i18n";
import { Badge } from "@/components/ds/Badge";
import { GUIDE_INTRO, GUIDE_SECTIONS } from "./content";

export default function PanduanPage() {
  const { t } = useT();
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 64px" }}>
        <header style={{ marginBottom: 36 }}>
          <Badge tone="new">{t(GUIDE_INTRO.eyebrowKey)}</Badge>
          <h1 style={{ font: "800 26px/1.25 var(--font-sans)", color: "var(--foreground)", margin: "14px 0 10px" }}>
            {t(GUIDE_INTRO.titleKey)}
          </h1>
          <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
            {t(GUIDE_INTRO.descKey)}
          </p>
        </header>

        <div style={{ display: "grid", gap: 20 }}>
          {GUIDE_SECTIONS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              style={{
                background: "var(--card)",
                border: "var(--border-width) solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "22px 24px",
              }}
            >
              <div style={{ font: "700 10px var(--font-mono)", color: "var(--subtle-foreground)", letterSpacing: "0.04em", marginBottom: 6 }}>
                {t(`${s.key}.kicker`)}
              </div>
              <h2 style={{ font: "800 18px/1.3 var(--font-sans)", color: "var(--foreground)", margin: "0 0 10px" }}>
                {t(`${s.key}.title`)}
              </h2>

              {s.intro ? (
                <p style={{ font: "400 13.5px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: "0 0 14px" }}>
                  {t(`${s.key}.intro`)}
                </p>
              ) : null}

              {s.steps ? (
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
                  {s.steps.map((_step, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span
                        style={{
                          flexShrink: 0,
                          width: 24,
                          height: 24,
                          borderRadius: "var(--radius-pill)",
                          background: "var(--primary-soft)",
                          color: "var(--primary)",
                          display: "grid",
                          placeItems: "center",
                          font: "700 12px var(--font-mono)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ paddingTop: 1 }}>
                        <div style={{ font: "700 13.5px var(--font-sans)", color: "var(--foreground)", marginBottom: 2 }}>
                          {t(`${s.key}.step${i + 1}.title`)}
                        </div>
                        <div style={{ font: "400 13px/1.55 var(--font-sans)", color: "var(--muted-foreground)" }}>
                          {t(`${s.key}.step${i + 1}.detail`)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}

              {s.bullets ? (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                  {s.bullets.map((_b, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span aria-hidden style={{ color: "var(--primary)", font: "700 13px var(--font-mono)", lineHeight: "1.55" }}>
                        →
                      </span>
                      <span style={{ font: "400 13px/1.55 var(--font-sans)", color: "var(--muted-foreground)" }}>{t(`${s.key}.bullet${i + 1}`)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {s.tip ? (
                <div
                  style={{
                    marginTop: 14,
                    background: "var(--highlight)",
                    color: "var(--highlight-foreground)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 13px",
                    font: "400 12.5px/1.5 var(--font-sans)",
                  }}
                >
                  <strong style={{ fontWeight: 800 }}>{t("guide.tipsLabel")}</strong>
                  {t(`${s.key}.tip`)}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
