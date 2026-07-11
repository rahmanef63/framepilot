import Link from "next/link";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";

/**
 * Proyek — akan menyimpan daftar proyek framepilot (kumpulan shot + scene 3D
 * yang sudah kamu susun). Belum ada fitur simpan/muat, jadi layar ini jujur
 * "segera hadir" sambil mengarahkan ke tempat kerja sebenarnya.
 */
export default function ProyekPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 40, display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <Badge tone="outline">Segera hadir</Badge>
        <h1 style={{ font: "800 24px/1.25 var(--font-sans)", color: "var(--foreground)", margin: 0 }}>Proyek</h1>
        <p style={{ font: "400 14px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: 0 }}>
          Di sini akan tampil daftar proyek tersimpan — tiap proyek berisi kumpulan sudut kamera dari Pustaka plus rig
          dan frame yang kamu susun di Studio 3D, siap dibuka kembali dan diekspor. Untuk sekarang, mulai kerja langsung
          di Pustaka atau Studio 3D.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">Buka Pustaka →</Button>
          </Link>
          <Link href="/editor" style={{ textDecoration: "none" }}>
            <Button variant="outline" size="sm">Buka Studio 3D</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
