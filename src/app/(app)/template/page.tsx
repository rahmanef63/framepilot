import Link from "next/link";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";

/**
 * Template — akan berisi preset scene & shot siap pakai (mis. rig 3-titik,
 * over-the-shoulder, dolly-in) untuk dijadikan titik awal di Studio 3D.
 * Belum ada preset yang di-bundle, jadi layar ini jujur "segera hadir".
 */
export default function TemplatePage() {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 40, display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <Badge tone="outline">Segera hadir</Badge>
        <h1 style={{ font: "800 24px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>Template</h1>
        <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
          Di sini akan tersedia preset scene &amp; shot siap pakai — misalnya rig pencahayaan 3-titik,
          over-the-shoulder, atau dolly-in — sebagai titik awal cepat untuk Studio 3D. Sementara preset belum
          di-bundle, susun angle-mu sendiri dari nol di Studio 3D.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          <Link href="/editor" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">Buka Studio 3D →</Button>
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="outline" size="sm">Buka Pustaka</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
