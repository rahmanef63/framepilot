"use client";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalModals } from "./GlobalModals";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        // dvh (not vh) = the CURRENTLY visible height, so the app never hides its
        // bottom behind mobile Safari's URL bar. Safe-area padding keeps the
        // header clear of the status bar and the tail clear of the home indicator
        // (real values only because layout.tsx sets viewport-fit=cover; 0 on desktop).
        height: "100dvh",
        minHeight: 0,
        width: "100%",
        boxSizing: "border-box",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        overflow: "hidden",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
      <GlobalModals />
    </div>
  );
}
