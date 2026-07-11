"use client";
// Slider — themed range (concept .slider + paintRange). Reports value imperatively
// on input (no React re-render per tick) and paints its own fill + output text.
// The `value` prop is the source of truth for external updates (presets/frame load).
import React, { useCallback, useEffect, useRef } from "react";

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  format = (v) => String(v),
  onInput,
  onCommit,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  format?: (v: number) => string;
  onInput: (v: number) => void; // fired every input tick (imperative)
  onCommit?: (v: number) => void; // fired on change (pointer up / keyboard commit)
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const outRef = useRef<HTMLOutputElement | null>(null);

  const paint = useCallback(
    (v: number) => {
      const el = inputRef.current;
      if (el) el.style.setProperty("--fill", `${((v - min) / (max - min)) * 100}%`);
      if (outRef.current) outRef.current.textContent = format(v);
    },
    [min, max, format]
  );

  // external value -> reflect into the DOM without a controlled re-render loop
  useEffect(() => {
    const el = inputRef.current;
    if (el && document.activeElement !== el) el.value = String(value);
    paint(value);
  }, [value, paint]);

  return (
    <div className="slider">
      <label>
        <span>{label}</span>
        <output ref={outRef}>{format(value)}</output>
      </label>
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        onInput={(e) => {
          const v = +(e.target as HTMLInputElement).value;
          paint(v);
          onInput(v);
        }}
        onChange={(e) => onCommit?.(+(e.target as HTMLInputElement).value)}
      />
    </div>
  );
}
