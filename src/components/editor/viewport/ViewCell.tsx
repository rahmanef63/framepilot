"use client";
// ViewCell.tsx — transparent HTML chrome for one viewport cell over the single
// WebGL canvas (concept .cell ~505-969). Carries the data-view attribute the
// engine maps to a scissor rect + pointer target, the corner label (.vname),
// and the maximize button (.maxbtn). The 3D itself is drawn by the shared
// canvas underneath; this layer is pointer-interactive chrome only.

import React from "react";
import type { ViewId } from "@/lib/editor/engineApi";

export function ViewCell({
  view,
  label,
  maxTitle,
  onMax,
  head,
  children,
}: {
  view: ViewId;
  label: string;
  maxTitle?: string;
  onMax: () => void;
  // Optional head node — the reconfigurable quad slots pass a <CellViewMenu/> here
  // to replace the static .vname chip with a view-picker dropdown.
  head?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="cell" data-view={view}>
      <div className="cell-head">
        {head ?? <span className="vname">{label}</span>}
        <span className="vspace" />
        <button className="maxbtn" title={maxTitle} onClick={onMax}>
          MAX
        </button>
      </div>
      {children}
    </div>
  );
}

export default ViewCell;
