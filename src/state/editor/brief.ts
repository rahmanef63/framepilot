// editor/brief.ts — the data-shot brief draft + frame selectors.
// currentFrame is a pure selector over core refs so both playback and frames can
// depend on it without creating a cycle between those groups.

import { useCallback } from "react";
import type { Meta } from "@/lib/dataPrompt";
import { EditorFrame, defaultShotMeta, snapState } from "@/lib/editorModel";
import type { EditorCore } from "./core";

export interface BriefActions {
  setDraftMetaField: (k: keyof Meta, v: string | number) => void;
  currentFrame: () => EditorFrame | null;
  frameIsDirty: (f: EditorFrame | null) => boolean;
}

export function useBriefActions(core: EditorCore): BriefActions {
  const { projectRef, rigRef, currentFrameIdRef, draftMetaRef, bump } = core;

  const setDraftMetaField = useCallback(
    (k: keyof Meta, v: string | number) => {
      (draftMetaRef.current as unknown as Record<string, unknown>)[k] = v;
      bump();
    },
    [draftMetaRef, bump]
  );

  const currentFrame = useCallback((): EditorFrame | null => {
    const id = currentFrameIdRef.current;
    if (!id) return null;
    for (const sc of projectRef.current.scenes) {
      const f = sc.frames.find((x) => x.id === id);
      if (f) return f;
    }
    return null;
  }, [projectRef, currentFrameIdRef]);

  const frameIsDirty = useCallback(
    (f: EditorFrame | null): boolean => {
      if (!f) return false;
      const liveS = JSON.stringify(snapState(rigRef.current));
      const savedS = JSON.stringify(f.s);
      if (liveS !== savedS) return true;
      const liveMeta = JSON.stringify({ ...defaultShotMeta(), ...draftMetaRef.current });
      const savedMeta = JSON.stringify({ ...defaultShotMeta(), ...f.meta });
      return liveMeta !== savedMeta;
    },
    [rigRef, draftMetaRef]
  );

  return { setDraftMetaField, currentFrame, frameIsDirty };
}
