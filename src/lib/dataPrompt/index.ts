// Data Prompt — barrel. Keeps the stable @/lib/dataPrompt import path while the
// implementation lives in per-concern files (rr modularity: types · core · seeds ·
// schema · parse). Domain logic for the Data Prompt feature, ported from the ds-a
// prototype; pure functions + types, no React.
export * from "./types";
export * from "./core";
export * from "./seeds";
export * from "./schema";
export * from "./parse";
