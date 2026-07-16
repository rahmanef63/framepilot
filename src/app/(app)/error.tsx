"use client";
// Route-group error boundary (rr P1 "route boundaries"): a thrown render error in
// any (app) route surfaces here — inside the app shell chrome — instead of Next's
// bare default screen. Happy path is untouched; only the error state changes.
import { ErrorBoundaryCard } from "@/components/ErrorBoundaryCard";

export default function AppError({
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
      titleKey="chrome.errorTitle"
      descKey="chrome.errorDesc"
      logTag="[app:error]"
    />
  );
}
