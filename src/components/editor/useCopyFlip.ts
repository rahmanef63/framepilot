"use client";
// useCopyFlip.ts — shared copy-then-flip state for the editor's copy buttons.
// copy(text) writes `text` to the clipboard via the shared helper and flips
// `copied` true for 1200ms, so callers can render a transient "copied ✓"
// confirmation while keeping their own label/markup.
import { useState } from "react";
import { copyText } from "./panel/outline/clipboard";

export function useCopyFlip() {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    if (!text) return;
    copyText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return { copied, copy };
}
