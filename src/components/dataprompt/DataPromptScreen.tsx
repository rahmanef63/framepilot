"use client";
import React from "react";
import { Button } from "@/components/ds/Button";
import { useApp } from "@/state/AppState";
import { GridView } from "./GridView";
import { TableView } from "./TableView";
import { SplitView } from "./SplitView";

export function DataPromptScreen() {
  const app = useApp();
  const filtered = app.filtered;
  const hasFiltered = filtered.length > 0;
  const trulyEmpty = app.entriesAll.length === 0;
  const filterEmpty = app.entriesAll.length > 0 && filtered.length === 0;

  const sourceTiles = [
    { glyph: "▦", label: "Foto · Photo", sub: "AI baca angle dari gambar", onClick: () => app.openImport("photo") },
    { glyph: "▷", label: "YouTube", sub: "Screenshot per scene", onClick: () => app.openImport("youtube") },
    { glyph: "≡", label: "Unggah .json", sub: "File ekspor / hasil AI", onClick: () => app.openImport("file") },
    { glyph: "▧", label: "Tempel JSON", sub: "Paste hasil AI", onClick: () => app.openImport("paste") },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* sub-header */}
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "11px 20px",
          borderBottom: "var(--border-width) solid var(--border)",
          background: "var(--background)",
        }}
      >
        <b style={{ font: "700 15px var(--font-sans)", color: "var(--foreground)" }}>Pustaka data prompt</b>
        <span style={{ font: "500 12px var(--font-mono)", color: "var(--muted-foreground)" }}>{app.entriesCountText}</span>
        {app.filterActive ? (
          <button
            onClick={app.clearFilter}
            title="Hapus filter"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "var(--border-width) solid var(--primary)",
              background: "var(--primary-soft)",
              color: "var(--foreground)",
              borderRadius: "var(--radius-pill)",
              padding: "3px 10px",
              font: "600 11px var(--font-mono)",
              cursor: "pointer",
            }}
          >
            {app.filterLabel} ✕
          </button>
        ) : null}
        <div style={{ flex: 1 }} />
        <span
          style={{
            font: "600 10px var(--font-mono)",
            letterSpacing: ".05em",
            textTransform: "uppercase",
            color: "var(--subtle-foreground)",
          }}
        >
          Tampilan
        </span>
        <div style={{ display: "inline-flex", gap: 3, padding: 3, background: "var(--muted)", borderRadius: "var(--radius-pill)" }}>
          <Button variant={app.view === "grid" ? "primary" : "ghost"} size="sm" onClick={() => app.setView("grid")}>
            Grid
          </Button>
          <Button variant={app.view === "table" ? "primary" : "ghost"} size="sm" onClick={() => app.setView("table")}>
            Tabel
          </Button>
          <Button variant={app.view === "split" ? "primary" : "ghost"} size="sm" onClick={() => app.setView("split")}>
            Split
          </Button>
        </div>
      </div>

      {/* selection bar */}
      {app.selectedCount > 0 ? (
        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 20px",
            borderBottom: "var(--border-width) solid var(--border)",
            background: "var(--primary-soft)",
          }}
        >
          <b style={{ font: "700 12px var(--font-sans)", color: "var(--foreground)" }}>
            {app.selectedCount} dipilih · selected
          </b>
          <div style={{ flex: 1 }} />
          <Button variant="primary" size="sm" onClick={app.bulkApply}>
            Terapkan · Apply
          </Button>
          <Button variant="outline" size="sm" onClick={app.bulkExport}>
            Ekspor
          </Button>
          <Button variant="ghost" size="sm" onClick={app.bulkDelete}>
            Hapus
          </Button>
          <Button variant="ghost" size="sm" onClick={app.clearSel}>
            Bersihkan
          </Button>
        </div>
      ) : null}

      {/* content */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {hasFiltered ? (
          <>
            {app.view === "grid" ? <GridView entries={filtered} /> : null}
            {app.view === "table" ? <TableView entries={filtered} /> : null}
            {app.view === "split" ? (
              <SplitView entries={filtered} activeEntry={app.activeEntry} onOpen3d={app.openView3d} />
            ) : null}
          </>
        ) : (
          <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "30px 30px 40px" }}>
            {trulyEmpty ? (
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <div
                  style={{
                    font: "700 17px var(--font-sans)",
                    color: "var(--foreground)",
                    textAlign: "center",
                    marginBottom: 6,
                  }}
                >
                  Impor data prompt pertama · Import your first
                </div>
                <p
                  style={{
                    font: "400 13px/1.6 var(--font-sans)",
                    color: "var(--muted-foreground)",
                    textAlign: "center",
                    margin: "0 auto 22px",
                    maxWidth: 520,
                  }}
                >
                  Kirim foto atau tautan YouTube ke AI, minta JSON sesuai skema, lalu impor lewat salah satu sumber. · Send
                  a photo or YouTube link to your AI, then import via one of these sources.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {sourceTiles.map((s) => (
                    <div
                      key={s.label}
                      onClick={s.onClick}
                      style={{
                        cursor: "pointer",
                        background: "var(--card)",
                        border: "var(--border-width) solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: 15,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "var(--radius-md)",
                          border: "var(--border-width) solid var(--border)",
                          display: "grid",
                          placeItems: "center",
                          font: "700 16px var(--font-mono)",
                          color: "var(--primary)",
                        }}
                      >
                        {s.glyph}
                      </div>
                      <div>
                        <div style={{ font: "700 13px var(--font-sans)", color: "var(--foreground)" }}>{s.label}</div>
                        <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted-foreground)" }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {filterEmpty ? (
              <div style={{ textAlign: "center", padding: 30 }}>
                <div style={{ font: "700 15px var(--font-sans)", color: "var(--foreground)", marginBottom: 6 }}>
                  Tidak ada hasil · No results
                </div>
                <p
                  style={{
                    font: "400 13px var(--font-sans)",
                    color: "var(--muted-foreground)",
                    margin: "0 auto 16px",
                    maxWidth: 320,
                  }}
                >
                  Tidak ada data prompt untuk filter {app.filterLabel}.
                </p>
                <Button variant="outline" size="sm" onClick={app.clearFilter}>
                  Hapus filter · Clear
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
