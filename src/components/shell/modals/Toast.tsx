"use client";
// Toast — the transient bottom-center message (copy/save confirmations). Split out
// of GlobalModals (rr single-responsibility). Reads app.toast from useApp.
import React from "react";
import { useApp } from "@/state/AppState";

export function Toast() {
  const app = useApp();
  if (!app.toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--foreground)",
        color: "var(--background)",
        padding: "10px 18px",
        borderRadius: "var(--radius-pill)",
        font: "600 12px var(--font-sans)",
        zIndex: 60,
        boxShadow: "var(--elevation-modal)",
        animation: "ds-ovin var(--motion) var(--ease)",
      }}
    >
      {app.toast}
    </div>
  );
}
