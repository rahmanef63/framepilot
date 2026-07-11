"use client";

import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ds/Button";

/**
 * AuthPanel — email + password sign in / sign up form backed by the
 * @convex-dev/auth Password provider. No reset flow yet.
 * ponytail: add password reset (needs an email provider like Resend) when users ask.
 * Modeled on framepilot-video-src/components/auth-panel.tsx, ported to ds tokens.
 */
export function AuthPanel({
  title = "Masuk untuk menyimpan proyek",
  onDone,
}: {
  title?: string;
  onDone?: () => void;
}) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow });
      onDone?.();
    } catch {
      setError(
        flow === "signIn"
          ? "Email atau kata sandi salah."
          : "Gagal membuat akun. Gunakan email yang valid dan kata sandi minimal 8 karakter."
      );
    } finally {
      setBusy(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginTop: "16px",
    marginBottom: "6px",
    font: "600 11px var(--font-mono)",
    color: "var(--muted-foreground)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "var(--radius-md)",
    border: "var(--border-width) solid var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
    padding: "9px 12px",
    font: "400 13px var(--font-sans)",
    outline: "none",
  };

  return (
    <form onSubmit={submit} style={{ width: "100%" }}>
      <h2 style={{ font: "800 16px var(--font-sans)", color: "var(--foreground)", margin: 0 }}>{title}</h2>
      <p style={{ marginTop: "4px", font: "400 12px var(--font-sans)", color: "var(--muted-foreground)" }}>
        {flow === "signIn" ? "Selamat datang kembali." : "Buat akun — email + kata sandi."}
      </p>

      <label style={labelStyle}>Email</label>
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        placeholder="kamu@contoh.com"
      />

      <label style={labelStyle}>Kata sandi</label>
      <input
        type="password"
        required
        minLength={8}
        autoComplete={flow === "signIn" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        placeholder="••••••••"
      />
      <p style={{ marginTop: "6px", font: "400 11px var(--font-mono)", color: "var(--subtle-foreground)" }}>
        Minimal 8 karakter.
      </p>

      {error ? (
        <p style={{ marginTop: "12px", font: "500 12px var(--font-sans)", color: "var(--destructive, #d4483b)" }}>
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy} style={{ marginTop: "18px", width: "100%" }}>
        {busy ? "…" : flow === "signIn" ? "Masuk" : "Buat akun"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setFlow(flow === "signIn" ? "signUp" : "signIn");
          setError(null);
        }}
        style={{ marginTop: "10px", width: "100%" }}
      >
        {flow === "signIn" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </Button>
    </form>
  );
}
