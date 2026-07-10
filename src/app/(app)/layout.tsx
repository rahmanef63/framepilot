"use client";
import React from "react";
import { AppStateProvider } from "@/state/AppState";
import { Shell } from "@/components/shell/Shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <Shell>{children}</Shell>
    </AppStateProvider>
  );
}
