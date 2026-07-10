"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";

/**
 * StubScreen — placeholder for the platform routes that aren't the focus of
 * this build. Mirrors the prototype's "sample screen in the shell" placeholder,
 * with a little route-specific chrome so the shell feels complete.
 */
export function StubScreen({
  title,
  desc,
  cards = 0,
  cardLabel = "Item",
}: {
  title: string;
  desc: string;
  cards?: number;
  cardLabel?: string;
}) {
  const router = useRouter();
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", placeItems: "center", padding: 40 }}>
      <div style={{ textAlign: "center", maxWidth: 620, width: "100%" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "var(--radius-pill)",
            border: "var(--border-width) solid var(--border)",
            background: "var(--muted)",
            display: "grid",
            placeItems: "center",
            font: "600 22px var(--font-mono)",
            color: "var(--subtle-foreground)",
            margin: "0 auto 16px",
          }}
        >
          ◍
        </div>
        <div style={{ font: "700 16px var(--font-sans)", color: "var(--foreground)", marginBottom: 6 }}>{title}</div>
        <p style={{ font: "400 13px/1.5 var(--font-sans)", color: "var(--muted-foreground)", margin: "0 auto 18px", maxWidth: 420 }}>
          {desc}
        </p>

        {cards > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: 12,
              margin: "0 auto 22px",
              maxWidth: 520,
            }}
          >
            {Array.from({ length: cards }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card)",
                  border: "var(--border-width) solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="ds-hatch"
                  style={{
                    height: 88,
                    borderBottom: "var(--border-width) solid var(--border)",
                    display: "grid",
                    placeItems: "center",
                    font: "600 10px var(--font-mono)",
                    color: "var(--subtle-foreground)",
                  }}
                >
                  [ {cardLabel} {i + 1} ]
                </div>
                <div style={{ padding: "9px 11px", textAlign: "left" }}>
                  <div style={{ font: "700 12px var(--font-sans)", color: "var(--foreground)" }}>
                    {cardLabel} {i + 1}
                  </div>
                  <div style={{ font: "400 10px var(--font-mono)", color: "var(--muted-foreground)" }}>contoh · sample</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <Button variant="primary" size="sm" onClick={() => router.push("/")}>
          Ke Data Prompt · Go to Data Prompt
        </Button>
      </div>
    </div>
  );
}
