"use client";
// Root global-error boundary (rr P1 "route boundaries"): the last resort when the
// ROOT layout itself throws — so it must render its own <html>/<body> and cannot
// rely on the app chrome, the token stylesheet (globals.css lives in the crashed
// root layout), or client design-system components. Tokens are used with literal
// fallbacks so it degrades gracefully when the stylesheet never loaded.
//
// TODO(rr): raw <button> + literal color fallbacks here violate "shadcn primitives
// only" + "theme tokens not hex" — unavoidable in the root-crash boundary, which
// runs without the design-system CSS/context. Compliant version is impossible here.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          background: "var(--background, #262624)",
          color: "var(--foreground, #F4F3EE)",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>Aplikasi bermasalah</h1>
          <p style={{ opacity: 0.7, margin: "0 0 16px", lineHeight: 1.5 }}>
            Terjadi kesalahan tak terduga. Muat ulang untuk mencoba lagi.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: 0,
              cursor: "pointer",
              fontWeight: 700,
              background: "var(--primary, #D97757)",
              color: "var(--primary-foreground, #fff)",
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
