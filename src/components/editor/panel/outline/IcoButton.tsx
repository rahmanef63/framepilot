"use client";
import React, { type CSSProperties } from "react";
import { Button } from "@/components/ds/Button";

// Compact micro footprint so the dense outline action rows keep the light Rupa
// look on the ds/Button primitive.
const micro: CSSProperties = {
  padding: "3px 7px",
  fontSize: "11px",
  fontWeight: 500,
  borderRadius: "6px",
  fontFamily: "var(--e-mono)",
  lineHeight: 1.3,
};

// mirrors concept mk(txt,title,fn) — a per-row action button (ds/Button ghost/sm)
// that never bubbles to the scene/frame row click handler.
export function IcoButton({
  children,
  title,
  onClick,
  style,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  style?: CSSProperties;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      title={title}
      style={{ ...micro, ...style }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}

// mirrors concept armDelete: first click arms (label ✕? + red fill), second click
// within 2600ms confirms, otherwise it disarms itself.
export function ArmDeleteButton({
  title,
  onConfirm,
}: {
  title: string;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const armStyle: CSSProperties = armed
    ? {
        background: "var(--rec)",
        borderColor: "var(--rec)",
        color: "var(--destructive-foreground)",
      }
    : {};
  return (
    <IcoButton
      title={title}
      style={armStyle}
      onClick={() => {
        if (armed) {
          if (timer.current) clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 2600);
      }}
    >
      {armed ? "✕?" : "✕"}
    </IcoButton>
  );
}
