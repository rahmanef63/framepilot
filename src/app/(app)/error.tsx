"use client";
// Route-group error boundary (rr P1 "route boundaries"): a thrown render error in
// any (app) route surfaces here — inside the app shell chrome — instead of Next's
// bare default screen. Happy path is untouched; only the error state changes.
import { useEffect } from "react";
import { Button } from "@/components/ds/Button";
import { useT } from "@/i18n";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();
  useEffect(() => {
    console.error("[app:error]", error);
  }, [error]);

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
        <div style={{ font: "800 22px var(--font-sans)", color: "var(--foreground)" }}>{t("chrome.errorTitle")}</div>
        <p style={{ font: "400 14px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
          {t("chrome.errorDesc")}
        </p>
        <Button variant="primary" onClick={reset}>
          {t("chrome.tryAgain")}
        </Button>
      </div>
    </div>
  );
}
