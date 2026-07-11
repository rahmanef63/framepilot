"use client";

import React from "react";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { ModalDialog } from "@/components/ds/Modal";
import { Button } from "@/components/ds/Button";
import { AuthPanel } from "@/components/auth/AuthPanel";

/** Signed-in view: shows the account email + a Keluar (sign out) button. */
function SignedIn({ onDone }: { onDone: () => void }) {
  const { signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);

  return (
    <div style={{ width: "100%" }}>
      <h2 style={{ font: "800 16px var(--font-sans)", color: "var(--foreground)", margin: 0 }}>Akun</h2>
      <p style={{ marginTop: "4px", font: "400 12px var(--font-sans)", color: "var(--muted-foreground)" }}>
        Kamu sudah masuk.
      </p>

      <div
        style={{
          marginTop: "16px",
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          border: "var(--border-width) solid var(--border)",
          background: "var(--background)",
        }}
      >
        <div style={{ font: "600 10px var(--font-mono)", color: "var(--subtle-foreground)" }}>Email</div>
        <div style={{ marginTop: "3px", font: "600 13px var(--font-sans)", color: "var(--foreground)", wordBreak: "break-all" }}>
          {user?.email ?? "—"}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={async () => {
          await signOut();
          onDone();
        }}
        style={{ marginTop: "18px", width: "100%" }}
      >
        Keluar
      </Button>
    </div>
  );
}

/** Account overlay — gates on auth state, showing sign-in form or the account panel. */
export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <ModalDialog open={open} onClose={onClose} width="min(420px, 94vw)" height="auto">
      <AuthLoading>
        <p style={{ font: "500 12px var(--font-mono)", color: "var(--muted-foreground)", margin: 0 }}>
          Memuat · Loading…
        </p>
      </AuthLoading>
      <Unauthenticated>
        <AuthPanel onDone={onClose} />
      </Unauthenticated>
      <Authenticated>
        <SignedIn onDone={onClose} />
      </Authenticated>
    </ModalDialog>
  );
}
