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
        height: "100vh",
        minHeight: 0,
        width: "100%",
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
