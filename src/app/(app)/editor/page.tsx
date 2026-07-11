import React from "react";
import { EditorStateProvider } from "@/state/EditorState";
import { EditorScreen } from "@/components/editor/EditorScreen";

export default function EditorPage() {
  return (
    <EditorStateProvider>
      <EditorScreen />
    </EditorStateProvider>
  );
}
