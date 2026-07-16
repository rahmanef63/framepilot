// app/useLibraryStore — the persistent projects store (SSOT for /library). Signed-in
// reads Convex (reactive listMine + per-doc get); anonymous reads localStorage. Owns
// persistEntry (write), del, and the library->Studio handoff. Split out of AppState.
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Entry, seed } from "@/lib/dataPrompt";
import { tr } from "@/i18n";
import {
  EditorProject,
  ensureProjectShape,
  projectHasFrames,
  projectToEntry,
  toEditorProject,
} from "@/lib/editorModel";
import { AUTOKEY, PROJECTS_CHANGED, SavedEntry, deleteProject, listProjects, saveProject } from "@/lib/editorStorage";

export interface LibraryStore {
  entries: Entry[];
  showingExamples: boolean;
  persistEntry: (en: Entry) => string;
  del: (id: string) => void;
  openInStudio3d: (id: string) => void;
}

export function useLibraryStore(deps: { now: number; showToast: (m: string) => void }): LibraryStore {
  const { now, showToast } = deps;
  const router = useRouter();

  // seedEntries = ONLY the "Contoh" demo shown as an empty-state. Imports + Studio 3D
  // saves write the store, NOT this state.
  const [seedEntries, setSeedEntries] = useState<Entry[]>(() => seed(now));

  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const saveMutation = useMutation(api.projects.save);
  const removeMutation = useMutation(api.projects.remove);
  const cloudList = useQuery(api.projects.listMine, isAuthenticated ? {} : "skip");
  const [cloudDocs, setCloudDocs] = useState<Record<string, EditorProject>>({});
  const [localSaved, setLocalSaved] = useState<SavedEntry[]>([]);

  // anonymous store: re-read localStorage on mount / focus / save event
  useEffect(() => {
    const read = () => setLocalSaved(listProjects());
    read();
    window.addEventListener("focus", read);
    window.addEventListener(PROJECTS_CHANGED, read);
    return () => {
      window.removeEventListener("focus", read);
      window.removeEventListener(PROJECTS_CHANGED, read);
    };
  }, []);

  // signed-in store: fetch each cloud project's doc (get is owner-scoped). Re-runs
  // whenever listMine changes (reactive), so a Studio 3D save refreshes the library.
  useEffect(() => {
    if (!isAuthenticated || !cloudList) {
      setCloudDocs({});
      return;
    }
    let cancelled = false;
    (async () => {
      const next: Record<string, EditorProject> = {};
      for (const p of cloudList) {
        try {
          const doc = await convex.query(api.projects.get, { id: p._id });
          if (doc) next[p._id] = ensureProjectShape(JSON.parse(doc));
        } catch {
          /* skip unreadable */
        }
      }
      if (!cancelled) setCloudDocs(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, cloudList, convex]);

  // the library's real content = the persistent store, converted to Entry. Empty
  // projects (no frames) are hidden. This is the SSOT; seedEntries are examples-only.
  const storeEntries = useMemo<Entry[]>(() => {
    if (isAuthenticated && cloudList) {
      return cloudList
        .map((p) => {
          const doc = cloudDocs[p._id];
          if (!doc || !projectHasFrames(doc)) return null;
          return projectToEntry(doc, { id: "cloud:" + p._id, source: doc.source || "studio", created: p.updatedAt });
        })
        .filter((e): e is Entry => e !== null);
    }
    return localSaved
      .filter((s) => projectHasFrames(s.project))
      .map((s) => projectToEntry(s.project, { id: "local:" + s.id, source: s.project.source || "studio", created: s.updated }));
  }, [isAuthenticated, cloudList, cloudDocs, localSaved]);

  const showingExamples = storeEntries.length === 0;
  const entries = showingExamples ? seedEntries : storeEntries;

  // Persist a library Entry to the SSOT store (localStorage always + Convex when
  // signed in). Returns the localStorage id so callers can refresh the list.
  const persistEntry = useCallback(
    (en: Entry): string => {
      const editorProj = toEditorProject(en);
      editorProj.name = en.name;
      editorProj.source = en.source;
      const res = saveProject(editorProj); // dispatches PROJECTS_CHANGED
      if (isAuthenticated) {
        saveMutation({ name: editorProj.name || tr("state.defaultProjectName"), doc: JSON.stringify(editorProj) }).catch(() => {});
      }
      return res.id;
    },
    [isAuthenticated, saveMutation]
  );

  const del = useCallback(
    (id: string) => {
      if (id.startsWith("local:")) {
        deleteProject(id.slice(6));
        setLocalSaved(listProjects());
      } else if (id.startsWith("cloud:")) {
        removeMutation({ id: id.slice(6) as Id<"projects"> }).catch(() => {});
      } else {
        setSeedEntries((cur) => cur.filter((e) => e.id !== id));
      }
      showToast(tr("state.io.deleted"));
    },
    [removeMutation, showToast]
  );

  // library -> Studio 3D handoff: convert to EditorProject, seed the editor's autosave
  // key (EditorStateProvider hydrates it on mount), then navigate home.
  const openInStudio3d = useCallback(
    (id: string) => {
      let proj: EditorProject | null = null;
      if (id.startsWith("local:")) {
        const se = localSaved.find((s) => "local:" + s.id === id);
        proj = se ? se.project : null;
      } else if (id.startsWith("cloud:")) {
        proj = cloudDocs[id.slice(6)] ?? null;
      } else {
        const en = entries.find((e) => e.id === id);
        if (en) proj = toEditorProject(en);
      }
      if (!proj) return;
      try {
        localStorage.setItem(AUTOKEY, JSON.stringify(proj));
      } catch {
        /* ignore quota/private-mode */
      }
      router.push("/");
    },
    [entries, localSaved, cloudDocs, router]
  );

  return { entries, showingExamples, persistEntry, del, openInStudio3d };
}
