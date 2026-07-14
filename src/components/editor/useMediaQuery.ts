"use client";
// useMediaQuery — subscribe to a CSS media query (SSR-safe via useSyncExternalStore;
// server snapshot = false = desktop). Used to swap the controller between the desktop
// tab layout and the mobile accordion (≤820) without mounting both.

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false
  );
}
