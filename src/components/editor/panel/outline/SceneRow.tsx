"use client";
import React from "react";
import type { EditorContextValue } from "@/state/EditorState";
import type { EditorScene } from "@/lib/editorModel";
import { useT } from "@/i18n";
import { sceneDuration } from "@/lib/editorModel";
import { scenePrompt } from "@/lib/editorPrompt";
import { usePlatform } from "@/components/editor/usePlatform";
import { getPromptOptions } from "@/components/editor/usePromptOptions";
import { IconPlay, IconClipboard, IconNote, IconCopy } from "@/components/editor/EditorIcons";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { IcoButton, ArmDeleteButton } from "./IcoButton";
import { FrameRow } from "./FrameRow";
import { copyText } from "./clipboard";

// One scene node: fold/thumb/inline-rename/meta head + action row (Play/Prompt/Note/
// Copy/↑↓/✕) + optional notes textarea + frame rows. Purely presentational over ctx.
export function SceneRow({
  ctx,
  showToast,
  sc,
  active,
  currentFrameId,
}: {
  ctx: EditorContextValue;
  showToast: (m: string) => void;
  sc: EditorScene;
  active: boolean;
  currentFrameId: string | null;
}) {
  const { t } = useT();
  const [platform] = usePlatform();
  const cls =
    "snode" + (active ? " activeScene" : "") + (sc.collapsed ? " collapsed" : "");
  const head = sc.frames[0];
  return (
    <div className={cls}>
      {/* baris judul scene */}
      <div className="srow" onClick={() => ctx.setActiveSceneId(sc.id, true)}>
        <button
          className="fold ico"
          title={t("panel.expandCollapse")}
          onClick={(e) => {
            e.stopPropagation();
            ctx.toggleSceneCollapsed(sc.id);
          }}
        >
          {sc.collapsed ? <ChevronRight size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
        </button>
        {head && head.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="sthumb" src={head.thumb} alt="" />
        ) : (
          <div className="sthumb ph">SC</div>
        )}
        <input
          className="sname"
          value={sc.name}
          title={t("panel.renameScene")}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => ctx.renameScene(sc.id, e.target.value)}
        />
        <span className="smeta">
          {sc.frames.length}f · {sceneDuration(sc).toFixed(1)}s
        </span>
      </div>

      {/* baris aksi scene */}
      <div className="sacts">
        <IcoButton
          title={t("panel.playScene")}
          onClick={() => {
            ctx.setActiveSceneId(sc.id, false);
            ctx.play();
          }}
        >
          <IconPlay size={13} />
        </IcoButton>
        <IcoButton
          title={t("panel.copyScenePrompt")}
          onClick={() => {
            copyText(scenePrompt(sc, ctx.project.settings, platform, getPromptOptions()));
            showToast(t("panel.scenePromptCopied"));
          }}
        >
          <IconClipboard size={13} />
        </IcoButton>
        <IcoButton title={t("panel.sceneNotes")} onClick={() => ctx.toggleSceneNotesOpen(sc.id)}>
          <IconNote size={13} />
        </IcoButton>
        <IcoButton title={t("panel.duplicateScene")} onClick={() => ctx.dupScene(sc.id)}>
          <IconCopy size={13} />
        </IcoButton>
        <IcoButton title={t("panel.moveUp")} onClick={() => ctx.moveScene(sc.id, -1)}>
          <ChevronUp size={13} aria-hidden />
        </IcoButton>
        <IcoButton title={t("panel.moveDown")} onClick={() => ctx.moveScene(sc.id, 1)}>
          <ChevronDown size={13} aria-hidden />
        </IcoButton>
        <ArmDeleteButton title={t("panel.deleteSceneTwice")} onConfirm={() => ctx.delScene(sc.id)} />
      </div>

      {/* catatan scene */}
      {sc.notesOpen || sc.notes ? (
        <textarea
          className="snotes"
          placeholder={t("panel.sceneNotesPlaceholder")}
          value={sc.notes}
          onChange={(e) => ctx.setSceneNotes(sc.id, e.target.value)}
        />
      ) : null}

      {/* anak: frames */}
      <div className="fchildren">
        {!sc.frames.length ? (
          <div className="empty-tree">{t("panel.emptyScene")}</div>
        ) : null}
        {sc.frames.map((f, fi) => (
          <FrameRow
            key={f.id}
            ctx={ctx}
            frame={f}
            index={fi}
            current={f.id === currentFrameId}
          />
        ))}
      </div>
    </div>
  );
}
