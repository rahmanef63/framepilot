"use client";
// Route-group error boundary (rr P1 "route boundaries"): a thrown render error in
// any (app) route surfaces here — inside the app shell chrome — instead of Next's
// bare default screen. Happy path is untouched; only the error state changes.
import { useEffect } from "react";
import { Button } from "@/components/ds/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <div style={{ font: "800 22px var(--font-sans)", color: "var(--foreground)" }}>Ada yang tidak beres</div>
        <p style={{ font: "400 14px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
          Terjadi kesalahan saat memuat halaman ini. Coba muat ulang bagian ini.
        </p>
        <Button variant="primary" onClick={reset}>
          Coba lagi
        </Button>
      </div>
    </div>
  );
}
