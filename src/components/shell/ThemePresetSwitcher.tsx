"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ds/Button";
import { ModalDialog } from "@/components/ds/Modal";
import {
  applyPreset,
  bootPreset,
  getSavedPreset,
  loadRegistry,
  presetSwatches,
  previewPreset,
  restoreSavedPreset,
  type ThemePresetItem,
  type ThemeRegistry,
} from "@/lib/theme/theme-presets";
import { groupPresets, type PresetGroup } from "@/lib/theme/preset-groups";

/**
 * ThemePresetSwitcher — picks a tweakcn theme preset at runtime.
 * Ported from Rahman Resources, rebuilt on framepilot ds primitives
 * (Button + ModalDialog) and app tokens. localStorage-only, no Convex.
 * Base Rupa (globals.css) is the default; "Default (Rupa)" clears the
 * preset. Boots the saved preset once on mount.
 */
export function ThemePresetSwitcher({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  const [open, setOpen] = useState(false);
  const [registry, setRegistry] = useState<ThemeRegistry | null>(null);
  const [active, setActive] = useState<string | null>(null);

  // Boot the saved preset once on mount + seed active state.
  useEffect(() => {
    void bootPreset();
    setActive(getSavedPreset());
  }, []);

  // Lazy-load registry when the dialog first opens.
  useEffect(() => {
    if (open && !registry) void loadRegistry().then(setRegistry);
  }, [open, registry]);

  const groups: PresetGroup<ThemePresetItem>[] = useMemo(
    () => (registry ? groupPresets(registry.items) : []),
    [registry],
  );

  const commit = (name: string | null) => {
    void applyPreset(name);
    setActive(name);
    setOpen(false);
  };

  const compact = orientation === "vertical";

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon="◐"
        onClick={() => setOpen(true)}
        title="Preset warna"
        style={{ width: "100%", justifyContent: compact ? "center" : "flex-start" }}
      >
        {compact ? null : "Tema"}
      </Button>

      <ModalDialog
        open={open}
        onClose={() => {
          void restoreSavedPreset();
          setOpen(false);
        }}
        title="Preset Warna"
        width="min(560px, 96vw)"
        height="min(620px, 90vh)"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ font: "500 12px var(--font-mono)", color: "var(--muted-foreground)", margin: 0 }}>
              Tema dari registry tweakcn. Rupa = bawaan.
            </p>
            <span
              onMouseEnter={() => previewPreset(null)}
              onMouseLeave={() => restoreSavedPreset()}
            >
              <Button
                variant={active ? "outline" : "primary"}
                size="sm"
                onClick={() => commit(null)}
              >
                Default (Rupa)
              </Button>
            </span>
          </div>

          {!registry ? (
            <p style={{ font: "500 13px var(--font-sans)", color: "var(--muted-foreground)" }}>Memuat…</p>
          ) : (
            groups.map((g) => (
              <div key={g.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div
                  style={{
                    font: "700 10px var(--font-mono)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {g.label}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {g.items.map((p) => {
                    const isActive = active === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => commit(p.name)}
                        onMouseEnter={() => previewPreset(p.name)}
                        onMouseLeave={() => restoreSavedPreset()}
                        title={p.title}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          textAlign: "left",
                          padding: "8px 10px",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          background: isActive ? "var(--primary-soft)" : "var(--card)",
                          border: `var(--border-width) solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                          color: "var(--foreground)",
                          font: "600 12px var(--font-sans)",
                        }}
                      >
                        <span style={{ display: "flex", flex: "none" }}>
                          {presetSwatches(p).map((c, i) => (
                            <span
                              key={i}
                              style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "999px",
                                background: c,
                                border: "1.5px solid var(--card)",
                                marginLeft: i === 0 ? 0 : "-5px",
                              }}
                            />
                          ))}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ModalDialog>
    </>
  );
}
