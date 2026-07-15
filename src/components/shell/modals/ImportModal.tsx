"use client";
// ImportModal — paste/upload the AI's camera JSON (schema camera-angle-guide/v2) or
// reveal the collapsible extraction-prompt helper. Split out of GlobalModals (rr
// single-responsibility). All state comes from useApp; styling from ./modalStyles.
import React, { useState } from "react";
import { ChevronDown, ChevronRight, Menu, Braces } from "lucide-react";
import { ModalDialog } from "@/components/ds/Modal";
import { Button } from "@/components/ds/Button";
import { useApp } from "@/state/AppState";
import { useT } from "@/i18n";
import { textareaStyle, hint, capLabel, promptBoxStyle, SRC_HINTS } from "./modalStyles";

export function ImportModal() {
  const app = useApp();
  const { t } = useT();
  const [helperOpen, setHelperOpen] = useState(false);
  return (
    <ModalDialog
      open={app.importOpen}
      onClose={app.closeImport}
      title={t("shell.import.title")}
      width="min(620px,94vw)"
      height="min(560px,88vh)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={hint}>{t("shell.import.hint")}</div>
        <textarea
          value={app.pasteText}
          onChange={(e) => app.setPasteText(e.target.value)}
          placeholder={'{ "scenes": [ { "frames": [ ... ] } ] }'}
          style={{ ...textareaStyle, height: 190 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary" size="sm" onClick={app.doParsePaste}>
            {t("shell.import.parseAdd")}
          </Button>
          <label>
            <input type="file" accept=".json,application/json" onChange={app.onFileTab} style={{ display: "none" }} />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                border: "var(--border-width) solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "6px 12px",
                font: "600 12px var(--font-sans)",
                color: "var(--foreground)",
                background: "var(--card)",
              }}
            >
              <Menu size={14} aria-hidden /> {t("shell.import.uploadJson")}
            </span>
          </label>
          <Button variant="ghost" size="sm" onClick={app.fillSamplePaste}>
            {t("shell.import.sample")}
          </Button>
        </div>
        {app.fileName ? (
          <div style={{ font: "500 12px var(--font-mono)", color: "var(--muted-foreground)" }}>{t("shell.import.fileLabel", { name: app.fileName })}</div>
        ) : null}

        {/* collapsible extraction-prompt helper */}
        <div
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-md)",
            background: "var(--card)",
          }}
        >
          <button
            onClick={() => setHelperOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              font: "700 12px var(--font-sans)",
              color: "var(--foreground)",
              textAlign: "left",
            }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>{helperOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}</span>
            {t("shell.import.helperToggle")}
          </button>
          {helperOpen ? (
            <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={hint}>{t("shell.import.helperHint")}</div>
              <div>
                <div style={{ ...capLabel, marginBottom: 6 }}>{t("shell.import.source")}</div>
                <div style={{ display: "inline-flex", gap: 4, padding: 3, background: "var(--muted)", borderRadius: "var(--radius-pill)", flexWrap: "wrap" }}>
                  {SRC_HINTS.map((s) => (
                    <Button
                      key={s.key}
                      variant={app.extractSrc === s.key ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => app.setExtractSrc(s.key)}
                    >
                      {t("shell.import.src." + s.key)}
                    </Button>
                  ))}
                </div>
              </div>
              <textarea readOnly spellCheck={false} value={app.extractPrompt} style={promptBoxStyle} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="primary" size="sm" icon={<Braces size={14} aria-hidden />} onClick={app.copyExtractPrompt}>
                  {t("shell.import.copyExtraction")}
                </Button>
                <Button variant="ghost" size="sm" onClick={app.openSchema}>
                  {t("shell.import.viewSchema")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {app.ioMsg ? (
        <div
          style={{
            marginTop: 14,
            padding: "9px 12px",
            borderRadius: "var(--radius-md)",
            border: `var(--border-width) solid ${app.ioOk ? "var(--border)" : "var(--destructive)"}`,
            background: "var(--muted)",
            font: "600 11px var(--font-mono)",
            color: app.ioOk ? "var(--foreground)" : "var(--destructive)",
          }}
        >
          {app.ioMsg}
        </div>
      ) : null}
    </ModalDialog>
  );
}
