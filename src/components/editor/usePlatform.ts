"use client";
// usePlatform.ts — the ONE shared "target AI video platform" selection for the
// Studio. A module-level store (useSyncExternalStore) so the Prompt Kamera dock,
// the Preview panel, and every "copy prompt" call site all skin against the SAME
// platform, persisted per-browser. Zero deps, no EditorState surgery.

import { useSyncExternalStore } from "react";
import { PLATFORMS } from "@/lib/prompt/platforms";
import type { PlatformId } from "@/lib/prompt/types";

const KEY = "cag.platform";
const DEFAULT: PlatformId = "runway";
const isValid = (v: unknown): v is PlatformId => PLATFORMS.some((p) => p.id === v);

let current: PlatformId = DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): PlatformId {
  if (!hydrated) {
    hydrated = true;
    if (typeof window !== "undefined") {
      const v = window.localStorage.getItem(KEY);
      if (isValid(v)) current = v;
    }
  }
  return current;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setPlatform(id: PlatformId): void {
  if (id === current) return;
  current = id;
  hydrated = true;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, id);
  listeners.forEach((l) => l());
}

// [selectedPlatformId, setPlatform]. Server snapshot is the stable DEFAULT; the
// client re-reads localStorage on first paint (useSyncExternalStore handles it).
export function usePlatform(): [PlatformId, (id: PlatformId) => void] {
  const id = useSyncExternalStore(subscribe, read, () => DEFAULT);
  return [id, setPlatform];
}
