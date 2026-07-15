"use client";
import React from "react";
import type { EditorContextValue } from "@/state/EditorState";
import type { EditorFrame } from "@/lib/editorModel";
import { useT } from "@/i18n";
import { IconCopy } from "@/components/editor/EditorIcons";
import { ChevronUp, ChevronDown, LayoutGrid } from "lucide-react";
import { IcoButton, ArmDeleteButton } from "./IcoButton";

// One frame row: click loads the camera, inline rename, per-row actions (C/↑↓/✕).
export function FrameRow({
  ctx,
  frame,
  index,
  current,
}: {
  ctx: EditorContextValue;
  frame: EditorFrame;
  index: number;
  current: boolean;
}) {
  const { t } = useT();
  return (
    <div
      className={"frow" + (current ? " current" : "")}
      data-fid={frame.id}
      onClick={() => ctx.loadFrame(frame.id)}
    >
      <span className="fidx">#{index + 1}</span>
      {/* Studio-captured frames carry a jpeg thumb; template/import frames don't →
          show a placeholder tile instead of a broken <img src="">. */}
      {frame.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frame.thumb} alt="" />
      ) : (
        <div className="fthumb ph"><LayoutGrid size={16} aria-hidden /></div>
      )}
      <input
        className="fname2"
        value={frame.name}
        title={t("panel.renameFrame")}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => ctx.renameFrame(frame.id, e.target.value)}
      />
      <span className="facts">
        <IcoButton title={t("panel.duplicateFrame")} onClick={() => ctx.dupFrame(frame.id)}>
          <IconCopy size={12} />
        </IcoButton>
        <IcoButton title={t("panel.moveUp")} onClick={() => ctx.moveFrame(frame.id, -1)}>
          <ChevronUp size={13} aria-hidden />
        </IcoButton>
        <IcoButton title={t("panel.moveDown")} onClick={() => ctx.moveFrame(frame.id, 1)}>
          <ChevronDown size={13} aria-hidden />
        </IcoButton>
        <ArmDeleteButton title={t("panel.deleteTwice")} onConfirm={() => ctx.delFrame(frame.id)} />
      </span>
    </div>
  );
}
