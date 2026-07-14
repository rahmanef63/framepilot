// Shared inline styles + source-hint list for the library modals (ImportModal /
// SchemaModal). Pure style data — extracted so each modal component stays a single
// responsibility under the rr ≤200-LOC cap.
import type React from "react";
import type { SourceKind } from "@/lib/dataPrompt";

export const textareaStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  background: "var(--background)",
  border: "var(--border-width) solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "12px",
  font: "400 12px/1.5 var(--font-mono)",
  color: "var(--foreground)",
  outline: "none",
};

export const hint: React.CSSProperties = {
  font: "400 12px/1.5 var(--font-sans)",
  color: "var(--muted-foreground)",
};

export const capLabel: React.CSSProperties = {
  font: "600 10px var(--font-mono)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
};

// read-only box that SHOWS the extraction prompt (the text you send TO an AI to get
// camera JSON — NOT the camera prompt), so the user sees exactly what "Salin" copies.
export const promptBoxStyle: React.CSSProperties = {
  width: "100%",
  height: 150,
  resize: "vertical",
  background: "var(--muted)",
  border: "var(--border-width) solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: 11,
  font: "400 11px/1.55 var(--font-mono)",
  color: "var(--foreground)",
  outline: "none",
};

// The four source hints only ever differed by ONE line of the extraction prompt
// (aiPrompt's srcTxt), so they collapse to a source-hint selector inside the helper.
export const SRC_HINTS: { key: SourceKind; label: string }[] = [
  { key: "photo", label: "Foto" },
  { key: "youtube", label: "YouTube" },
  { key: "file", label: "File / lain" },
  { key: "paste", label: "Teks" },
];
