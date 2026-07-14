// app/types — the AppState context value + library view-model types. Split out of
// AppState.tsx (rr modularity); the @/state/AppState barrel/provider re-exports them.
import type React from "react";
import type { Project, SchemaMode, SourceKind } from "@/lib/dataPrompt";

// Lean card view-model for the single /library grid. Only the fields the collapsed
// card actually renders (name, scene/shot counts, updated date, cheap 3D thumbnail
// via the pAz/… first-frame snapshot, source badge) plus its two actions.
export interface EntryView {
  id: string;
  name: string;
  when: string;
  sourceGlyph: string;
  sourceLabel: string;
  sourceTone: "new" | "highlight" | "outline" | "default";
  thumbCaption: string;
  sceneCount: number;
  frameCount: number;
  pAz: number;
  pEl: number;
  pDist: number;
  pRoll: number;
  pLens: number;
  pSubj: string;
  /** true = a read-only "Contoh" seed demo (shown only when the store is empty). */
  example: boolean;
  onOpenStudio: () => void;
  onDelete: () => void;
}

/** Library layout the user picked: card grid, dense table, or list+inspector split. */
export type LibraryView = "grid" | "table" | "split";

export interface AppContextValue {
  // shell
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // library list (single view of the SSOT store)
  entriesAll: EntryView[];
  /** chosen library layout + its setter (grid default). */
  view: LibraryView;
  setView: (v: LibraryView) => void;
  entriesCountText: string;
  projStats: string;
  /** DataPrompt library staging project — read-only, for export + the header stat. */
  project: Project;
  // header actions
  openImport: (tab?: string) => void;
  openSchema: () => void;
  exportProject: () => void;
  // import modal (single collapsed panel)
  importOpen: boolean;
  closeImport: () => void;
  pasteText: string;
  setPasteText: (v: string) => void;
  doParsePaste: () => void;
  fillSamplePaste: () => void;
  fileName: string;
  onFileTab: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** source hint that tunes the collapsible extraction-prompt helper. */
  extractSrc: SourceKind;
  setExtractSrc: (s: SourceKind) => void;
  extractPrompt: string;
  copyExtractPrompt: () => void;
  ioMsg: string;
  ioOk: boolean;
  // schema modal
  schemaOpen: boolean;
  closeSchema: () => void;
  schemaMode: SchemaMode;
  setSchemaMode: (m: SchemaMode) => void;
  downloadSchema: () => void;
  copySchemaPrompt: () => void;
  // toast
  toast: string;
  showToast: (m: string) => void;
}
