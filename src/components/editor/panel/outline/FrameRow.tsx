"use client";
import React from "react";
import type { EditorContextValue } from "@/state/EditorState";
import type { EditorFrame } from "@/lib/editorModel";
import { IconCopy } from "@/components/editor/EditorIcons";
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
        <div className="fthumb ph">▦</div>
      )}
      <input
        className="fname2"
        value={frame.name}
        title="Rename frame"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => ctx.renameFrame(frame.id, e.target.value)}
      />
      <span className="facts">
        <IcoButton title="Duplikat frame" onClick={() => ctx.dupFrame(frame.id)}>
          <IconCopy size={12} />
        </IcoButton>
        <IcoButton title="Naik" onClick={() => ctx.moveFrame(frame.id, -1)}>
          ↑
        </IcoButton>
        <IcoButton title="Turun" onClick={() => ctx.moveFrame(frame.id, 1)}>
          ↓
        </IcoButton>
        <ArmDeleteButton title="Hapus (klik 2×)" onConfirm={() => ctx.delFrame(frame.id)} />
      </span>
    </div>
  );
}
