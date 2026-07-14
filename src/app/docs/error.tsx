"use client";
// Docs-segment error boundary (rr P1 "route boundaries"). The docs chrome lives in
// its own layout (outside the app Shell), so it gets its own boundary.
import { useEffect } from "react";
import { Button } from "@/components/ds/Button";

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[docs:error]", error);
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
        <div style={{ font: "800 22px var(--font-sans)", color: "var(--foreground)" }}>Dokumentasi gagal dimuat</div>
        <p style={{ font: "400 14px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
          Terjadi kesalahan saat memuat dokumentasi. Coba lagi.
        </p>
        <Button variant="primary" onClick={reset}>
          Coba lagi
        </Button>
      </div>
    </div>
  );
}
