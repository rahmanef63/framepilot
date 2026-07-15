"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { CreateMenu } from "@/components/shell/CreateMenu";
import { useApp } from "@/state/AppState";
import { useT } from "@/i18n";
import { Camera, Library } from "lucide-react";

/**
 * HeaderNav — the app's primary navigation, moved OUT of the left rail into the
 * header's center section: a "Buat" create dropdown + the two real destinations
 * (Studio 3D `/`, Pustaka `/library`). The left rail is now dedicated to the
 * scene/frame manager, so this is where you switch screens.
 */
export function HeaderNav() {
  const app = useApp();
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="app-hnav" aria-label={t("shell.nav.primary")}>
      <CreateMenu
        orientation="horizontal"
        fill={false}
        onNew3D={() => router.push("/")}
        onFromImage={() => app.openImport("photo")}
        onFromTemplate={() => router.push("/library")}
      />
      <HeaderTab icon={<Camera size={16} />} label={t("header.crumb.studio")} active={pathname === "/"} onClick={() => router.push("/")} />
      <HeaderTab icon={<Library size={16} />} label={t("header.crumb.library")} active={pathname === "/library"} onClick={() => router.push("/library")} />
    </nav>
  );
}

function HeaderTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-current={active ? "page" : undefined}
      className="app-htab"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        border: 0,
        borderRadius: "var(--radius-pill)",
        padding: "7px 13px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        font: `${active ? 700 : 500} 13px var(--font-sans)`,
        background: active ? "var(--primary-soft)" : hover ? "var(--muted)" : "transparent",
        color: active ? "var(--primary)" : "var(--foreground)",
        transition: "background var(--motion) var(--ease), color var(--motion) var(--ease)",
      }}
    >
      <span aria-hidden style={{ fontFamily: "var(--font-mono)", fontSize: "0.92em", opacity: 0.9 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}
