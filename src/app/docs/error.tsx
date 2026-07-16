"use client";
// Docs-segment error boundary (rr P1 "route boundaries"). The docs chrome lives in
// its own layout (outside the app Shell), so it gets its own boundary.
import { ErrorBoundaryCard } from "@/components/ErrorBoundaryCard";

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundaryCard
      error={error}
      reset={reset}
      titleKey="chrome.docsErrorTitle"
      descKey="chrome.docsErrorDesc"
      logTag="[docs:error]"
    />
  );
}
