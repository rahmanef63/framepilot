// editorModel — barrel. Keeps the stable @/lib/editorModel import path while the
// camera-angle-guide/v2 document model lives in per-concern files (rr modularity):
// types · constructors · sanitize · query · convert. Pure, NO React, NO three.
export * from "./types";
export * from "./constructors";
export * from "./sanitize";
export * from "./query";
export * from "./convert";
