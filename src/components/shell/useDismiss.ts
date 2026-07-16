import React from "react";

/**
 * useDismiss — the shared "close on outside-click / Esc" effect for the header +
 * rail menus (LanguageSwitcher, CreateMenu, NavUserMenu). Gated on `open`: wires a
 * mousedown handler that closes when the click lands outside `ref`, plus an Escape
 * keydown, and tears both down on cleanup. Each menu keeps its own toggle/position
 * logic — only the dismiss wiring is shared.
 */
export function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
}
