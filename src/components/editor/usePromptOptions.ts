"use client";
// usePromptOptions.ts — the ONE shared "which clauses go into the camera prompt"
// toggle set for the Studio. A module-level store (useSyncExternalStore, mirrors
// usePlatform) so the Prompt dock's shown+copied prompt, the Preview panel, and
// the per-scene copy all skin the SAME prompt against the SAME options, persisted
// per-browser. Zero deps, no EditorState surgery.

import { useSyncExternalStore } from "react";
import { ALL_ON, type ShotOptions } from "@/lib/prompt/types";

const KEY = "cag.promptOpts";

let current: ShotOptions = ALL_ON;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): ShotOptions {
  if (!hydrated) {
    hydrated = true;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(KEY);
        // merge over ALL_ON so a stored file missing a newer key still validates
        if (raw) current = { ...ALL_ON, ...(JSON.parse(raw) as Partial<ShotOptions>) };
      } catch {
        /* ignore malformed json — keep ALL_ON */
      }
    }
  }
  return current;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getPromptOptions(): ShotOptions {
  return read();
}

function setPromptOption(key: keyof ShotOptions, val: boolean): void {
  current = { ...current, [key]: val };
  hydrated = true;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(current));
  listeners.forEach((l) => l());
}

// [options, setOption]. Server snapshot is the stable ALL_ON const; the client
// re-reads localStorage on first paint (useSyncExternalStore handles the swap).
export function usePromptOptions(): [ShotOptions, (k: keyof ShotOptions, v: boolean) => void] {
  const opts = useSyncExternalStore(subscribe, read, () => ALL_ON);
  return [opts, setPromptOption];
}
