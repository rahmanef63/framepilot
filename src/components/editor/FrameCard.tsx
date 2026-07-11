"use client";
// FrameCard.tsx — one card in the frames filmstrip (plan G20). Presentational
// over useEditor(): shows the jpeg thumb + rename field + angle/shot/lens/dur
// badges + notes + dup/del actions. `.current` (amber ring) when this frame is
// the loaded one, `.dirty` (brown) when the loaded frame diverges from the live
// rig. Mirrors concept renderFramesStrip() card markup (~1973-2011).

import React from "react";
import { useEditor } from "@/state/EditorState";
import { EditorFrame, frameDuration } from "@/lib/editorModel";

export function FrameCard({ frame, index }: { frame: EditorFrame; index: number }) {
  const ctx = useEditor();
  const isCurrent = ctx.currentFrameId === frame.id;
  const isDirty = isCurrent && ctx.frameIsDirty(frame);

  return (
    <div className={"frame-card" + (isCurrent ? " current" : "") + (isDirty ? " dirty" : "")}>
      <div className="frame-thumb" onClick={() => ctx.loadFrame(frame.id)}>
        <img src={frame.thumb ?? undefined} alt={frame.name} />
        <span className="fnum">#{index + 1}</span>
      </div>
      <div className="frame-body">
        <input
          className="fname"
          title="Rename frame"
          value={frame.name}
          onChange={(e) => ctx.renameFrame(frame.id, e.target.value)}
        />
        <div className="frame-tags">
          {frame.angle} · {frame.shot} · {Number(frame.lens) || 0}mm · {frameDuration(frame).toFixed(1)}s
        </div>
        <textarea
          placeholder="Catatan shot… (blocking, lighting, movement)"
          value={frame.notes}
          onChange={(e) => ctx.setFrameNotes(frame.id, e.target.value)}
        />
        <div className="frame-actions">
          <button
            className="small"
            data-act="dup"
            title="Duplikat"
            onClick={() => ctx.dupFrame(frame.id)}
          >
            Copy
          </button>
          <button
            className="small danger"
            data-act="del"
            title="Hapus"
            onClick={() => ctx.delFrame(frame.id)}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default FrameCard;
