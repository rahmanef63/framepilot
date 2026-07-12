"use client";
// useProjectSync.ts — cloud-sync seam for saved projects (Task C). Signed-in
// Convex users get their project list / save / load / delete routed to the
// deployed convex/projects.* functions; anonymous users keep the existing
// localStorage flow untouched. One hook shared by EditorHeaderActions (the "Simpan
// Proyek" button) and SavedProjects (list/load/delete) so the auth branch lives
// in exactly one place — DRY, not a duplicated component.

import { useCallback } from "react";
import { useConvexAuth, useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useEditor } from "@/state/EditorState";

export function useProjectSync() {
  const ctx = useEditor();
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const saveMutation = useMutation(api.projects.save);
  const removeMutation = useMutation(api.projects.remove);

  // Reactive list of the signed-in user's cloud projects; skipped (no query)
  // for anonymous callers so localStorage stays the sole source of truth.
  const cloudList = useQuery(api.projects.listMine, isAuthenticated ? {} : "skip");

  // Save always writes localStorage first (keeps the autosave indicator working
  // and preserves exact anonymous behavior), then upserts to Convex when signed
  // in. The doc is the serialized ctx.exportProjectObject().
  const saveCurrent = useCallback(async () => {
    ctx.saveCurrentProject();
    if (!isAuthenticated) return;
    const p = ctx.exportProjectObject();
    await saveMutation({ name: p.name, doc: JSON.stringify(p) });
  }, [ctx, isAuthenticated, saveMutation]);

  // Load one cloud project into the editor: fetch its serialized doc on demand
  // (get is owner-scoped), then hand it to the same importer the JSON-file path
  // uses.
  const loadCloud = useCallback(
    async (id: Id<"projects">) => {
      const doc = await convex.query(api.projects.get, { id });
      if (!doc) return;
      ctx.importProjectObject(JSON.parse(doc));
    },
    [convex, ctx],
  );

  const removeCloud = useCallback(
    (id: Id<"projects">) => removeMutation({ id }),
    [removeMutation],
  );

  return {
    signedIn: isAuthenticated,
    cloudList, // undefined while loading, else [{ _id, name, updatedAt }]
    saveCurrent,
    loadCloud,
    removeCloud,
  };
}
