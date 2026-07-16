// useDismissablePopover.ts — shared popover wiring for the viewport cell menus
// (ViewportCameraMenu + CellViewMenu). Bundles the two effects both menus need:
//   (a) isolate the open popover from the cell's native pointer/wheel handlers so
//       clicking/scrolling the menu never starts a drag or zooms the 3D view;
//   (b) close on outside click / Escape via the supplied onClose callback.
// NOTE: separate from the shell's useDismiss — this one adds pointer/wheel isolation.

import { useEffect, useRef, type RefObject } from "react";

export function useDismissablePopover(
  open: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  popRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  // Keep the latest onClose without re-subscribing listeners on every render;
  // the effects below re-run only when `open` flips, matching the originals.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Isolate the open popover from the cell's native pointer/wheel handlers so
  // clicking/scrolling the menu never starts a drag or zooms the 3D view.
  useEffect(() => {
    const el = popRef.current;
    if (!el || !open) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("pointerdown", stop);
    el.addEventListener("wheel", stop, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
    };
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onCloseRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
}
