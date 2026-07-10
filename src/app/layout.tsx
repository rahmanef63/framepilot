import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Prompt · Camera Angle Guide Pro",
  description:
    "Kelola data prompt hasil AI — impor foto/YouTube/JSON, unduh skema, terapkan ke Camera Angle Guide Pro, pratinjau 3D.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-preset="rupa" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
