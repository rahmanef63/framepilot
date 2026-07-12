import React from "react";
import { EditorStateProvider } from "@/state/EditorState";
import { EditorScreen } from "@/components/editor/EditorScreen";

// The Studio IS the app home now (the marketing landing was removed; its copy
// moved to /docs). `/` renders the 3D shot-planner inside the app Shell.
export default function HomePage() {
  return (
    <EditorStateProvider>
      <EditorScreen />
    </EditorStateProvider>
  );
}
