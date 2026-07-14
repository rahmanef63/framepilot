"use client";
// SchemaModal — shows the camera-angle-guide/v2 JSON schema (full / simplified) to
// hand to an AI, with download + copy-prompt. Split out of GlobalModals (rr
// single-responsibility). State from useApp; styling from ./modalStyles.
import React from "react";
import { ModalDialog } from "@/components/ds/Modal";
import { Button } from "@/components/ds/Button";
import { schemaJson } from "@/lib/dataPrompt";
import { useApp } from "@/state/AppState";
import { hint } from "./modalStyles";

export function SchemaModal() {
  const app = useApp();
  return (
    <ModalDialog
      open={app.schemaOpen}
      onClose={app.closeSchema}
      title="Skema JSON · Schema"
      width="min(660px,94vw)"
      height="min(600px,90vh)"
    >
      <div style={{ ...hint, marginBottom: 12 }}>
        Berikan skema ini ke AI Anda bersama foto/video. Template lengkap — AI cukup mengisi field yang terlihat. · Hand
        this schema to your AI with the photo/video; the template is complete, the AI fills only what it sees.
      </div>
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 3,
          background: "var(--muted)",
          borderRadius: "var(--radius-pill)",
          marginBottom: 12,
        }}
      >
        <Button variant={app.schemaMode === "full" ? "primary" : "ghost"} size="sm" onClick={() => app.setSchemaMode("full")}>
          Lengkap · Full
        </Button>
        <Button
          variant={app.schemaMode === "simplified" ? "primary" : "ghost"}
          size="sm"
          onClick={() => app.setSchemaMode("simplified")}
        >
          Ringkas · Simplified
        </Button>
      </div>
      <pre
        style={{
          margin: "0 0 14px",
          background: "var(--muted)",
          border: "var(--border-width) solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: 14,
          height: 300,
          overflow: "auto",
          font: "400 11px/1.55 var(--font-mono)",
          color: "var(--foreground)",
          whiteSpace: "pre",
        }}
      >
        {schemaJson(app.schemaMode)}
      </pre>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="primary" size="sm" onClick={app.downloadSchema}>
          Unduh .json · Download
        </Button>
        <Button variant="outline" size="sm" onClick={app.copySchemaPrompt}>
          Salin prompt + skema · Copy prompt
        </Button>
      </div>
    </ModalDialog>
  );
}
