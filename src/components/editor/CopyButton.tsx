"use client";
// CopyButton.tsx — a small, reusable copy affordance. Used for SECONDARY
// (muted/optional) copy actions like "Salin detail" that sit next to a primary
// hero copy button. Resolves `text` (a string or a lazy () => string), copies it
// via the shared clipboard helper, and flips to a "Tersalin" confirmation for
// 1200ms. Style it "off" by passing the ghost Button variant.
import React, { CSSProperties, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, ButtonVariant, ButtonSize } from "@/components/ds/Button";
import { copyText } from "./panel/outline/clipboard";

export function CopyButton({
  text,
  label,
  copiedLabel = "Tersalin",
  variant = "ghost",
  size = "sm",
  disabled = false,
  iconSize = 14,
  style,
}: {
  text: string | (() => string);
  label: string;
  copiedLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  iconSize?: number;
  style?: CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = () => {
    const t = typeof text === "function" ? text() : text;
    if (!t) return;
    copyText(t);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {copied ? (
        <>
          {copiedLabel} <Check size={iconSize} aria-hidden />
        </>
      ) : (
        <>
          <Copy size={iconSize} aria-hidden /> {label}
        </>
      )}
    </Button>
  );
}
