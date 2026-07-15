// editorModel/convert — one-way converters (plan §3.3) between the v2 EditorProject
// and the lightweight library/AppState shapes. Pure, on demand.

import { tr } from "@/i18n";
import {
  DEF,
  entryProject,
  projFrame,
  raw,
  uid,
  type Entry,
  type ProjectScene,
  type RawFrame,
  type SourceKind,
} from "../dataPrompt";
import { defaultProjectSettings, newProject } from "./constructors";
import { ensureProjectShape } from "./sanitize";
import { deepCopy, type EditorFrame, type EditorProject, type RigSnapshot } from "./types";

// Accepts: v2 JSON | library Entry | AppState Project (lightweight).
export function toEditorProject(src: unknown): EditorProject {
  const o = src as Record<string, unknown> | null;
  if (!o || typeof o !== "object") return newProject();

  // 1) already v2 (schema/settings present)
  if (o.schema === "camera-angle-guide/v2" || (o.settings && Array.isArray(o.scenes))) {
    return ensureProjectShape(deepCopy(o));
  }

  // 2) library Entry -> entryProject (already v2)
  if (o.data && Array.isArray((o.data as Record<string, unknown>).scenes)) {
    return ensureProjectShape(entryProject(o as unknown as Entry));
  }

  // 3) AppState Project: { scenes:[{id,name,frames:RawFrame[]}] } — wrap.
  if (Array.isArray(o.scenes)) {
    const scenes = (o.scenes as ProjectScene[]).map((sc) => ({
      id: sc.id || uid(),
      name: sc.name || "Scene",
      notes: "",
      frameSeq: sc.frames.length + 1,
      collapsed: false,
      notesOpen: false,
      frames: sc.frames.map((fr) => {
        const pf = projFrame(fr) as unknown as EditorFrame;
        // object frames come from synth at ty 1.35 — normalize to 1.0 (plan §3.3)
        if (pf.s.subj === "object") pf.s.target.y = 1.0;
        return pf;
      }),
    }));
    const ep = {
      schema: "camera-angle-guide/v2",
      name: typeof o.name === "string" ? (o.name as string) : "",
      settings: defaultProjectSettings(),
      scenes,
      activeSceneId: scenes[0]?.id || null,
    };
    return ensureProjectShape(ep);
  }

  return newProject();
}

// EditorFrame -> RawFrame (the AppState/library frame shape). Reverse of the
// projFrame + synth path in toEditorProject: pulls roll/fov/subj back out of the
// rig snapshot so a round-trip preserves the visible fields.
function editorFrameToRaw(f: EditorFrame): RawFrame {
  const s = f.s || ({} as RigSnapshot);
  const num = (v: unknown, d: number) => (Number.isFinite(+(v as number)) ? +(v as number) : d);
  return {
    name: f.name || "Shot",
    angle: f.angle || "EYE LEVEL",
    shot: f.shot || "MEDIUM SHOT",
    lens: num(f.lens, 50),
    az: num(f.az, 30),
    el: num(f.el, 4),
    dist: num(f.dist, 3),
    roll: num(s.roll, 0),
    fov: num(s.fov, 40),
    subj: s.subj || "person",
    meta: { ...DEF, ...(f.meta || {}) },
  };
}

export interface ProjectEntryMeta {
  id: string; // the stable Pustaka entry id (e.g. "local:<id>" / "cloud:<_id>")
  source?: SourceKind; // defaults to "studio" (a Studio-3D-authored doc)
  created?: number; // defaults to Date.now()
  ref?: string;
  en?: string;
}

// The MISSING direction (plan §3.3 was one-way editor<-library): EditorProject
// (or a stored SavedEntry.project) -> AppState library Entry, so the Pustaka can
// render the persistent projects store as Entry cards. Reuses editorFrameToRaw
// for the frame shape; guarantees at least one scene with one frame so the
// Pustaka's derived view (scenes[0].frames[0]) is always safe.
export function projectToEntry(project: EditorProject, meta: ProjectEntryMeta): Entry {
  const scenes = (project.scenes || [])
    .map((sc) => ({ name: sc.name || "Scene", frames: (sc.frames || []).map(editorFrameToRaw) }))
    .filter((sc) => sc.frames.length);
  return {
    id: meta.id,
    name: project.name || tr("sys.untitled"),
    en: meta.en || "",
    source: meta.source || project.source || "studio",
    ref: meta.ref || "",
    created: meta.created ?? Date.now(),
    data: { scenes: scenes.length ? scenes : [{ name: "Scene 1", frames: [raw()] }] },
  };
}

// True when a project has at least one real frame — used to hide empty (freshly
// created, no-shot) projects from the Pustaka.
export function projectHasFrames(project: EditorProject): boolean {
  return (project.scenes || []).some((sc) => (sc.frames || []).length > 0);
}
