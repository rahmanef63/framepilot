"use client";
// GlobalModals — composition of the library's app-level overlays. Each modal is its
// own single-responsibility file under modals/ (rr ≤200-LOC + single-responsibility);
// this stays the stable barrel Shell mounts (@/components/shell/GlobalModals).
import React from "react";
import { ImportModal } from "./modals/ImportModal";
import { SchemaModal } from "./modals/SchemaModal";
import { Toast } from "./modals/Toast";

export function GlobalModals() {
  return (
    <>
      <ImportModal />
      <SchemaModal />
      <Toast />
    </>
  );
}
