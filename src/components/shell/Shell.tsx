"use client";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalModals } from "./GlobalModals";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    // NOTE: the root frame (height / overflow / safe-area padding) MUST live in
    // the `.app-shell` CSS class (globals.css), NOT as an inline style here — an
    // inline style beats any class media-query, so keeping it inline would make
    // the ≤820 mobile natural-scroll override impossible to apply.
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
      <GlobalModals />
    </div>
  );
}
