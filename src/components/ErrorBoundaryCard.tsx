"use client";
// Shared route-error-boundary card. Next requires a default-export component per
// segment, so each error.tsx stays as a thin wrapper that renders this with its
// own i18n keys + console tag. The card markup/behavior is identical everywhere.
import { useEffect } from "react";
import { Button } from "@/components/ds/Button";
import { useT } from "@/i18n";

export function ErrorBoundaryCard({
  error,
  reset,
  titleKey,
  descKey,
  logTag,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  titleKey: string;
  descKey: string;
  logTag: string;
}) {
  const { t } = useT();
  useEffect(() => {
    console.error(logTag, error);
  }, [logTag, error]);

  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div style={{ font: "800 22px var(--font-sans)", color: "var(--foreground)" }}>{t(titleKey)}</div>
        <p style={{ font: "400 14px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
          {t(descKey)}
        </p>
        <Button variant="primary" onClick={reset}>
          {t("chrome.tryAgain")}
        </Button>
      </div>
    </div>
  );
}
