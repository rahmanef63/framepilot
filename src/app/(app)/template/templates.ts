// templates.ts — starter camera-angle-guide/v2 project presets, as DATA only.
// Each template is authored in the lightweight RawFrame shape (dataPrompt.raw)
// and converted to a full EditorProject on demand via toEditorProject — so the
// heavy `s` RigSnapshot is synthesized by the SAME converter Studio 3D uses (DRY,
// no hand-written snapshots to drift). page.tsx opens the result in Studio 3D.
//
// Aspect ratio rides alongside because toEditorProject's Project branch forces
// default settings; page.tsx applies `aspectRatio` after conversion.

import { raw, type Meta, type Project } from "@/lib/dataPrompt";

export interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  /** Studio 3D output ratio for this preset (validated against v2 ASPECTS). */
  aspectRatio: string;
  /** RawFrame-based project — converted with toEditorProject at use time. */
  project: Project;
}

// scene id "" → toEditorProject fills a fresh uid() at conversion time, so every
// "Gunakan Template" click yields unique ids (no cross-template collisions).
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "wawancara-3-shot",
    title: "Wawancara 3-shot",
    description:
      "Rig wawancara duduk klasik: master medium, reverse over-the-shoulder, dan insert close-up untuk potongan dinamis.",
    aspectRatio: "16:9",
    project: {
      scenes: [
        {
          id: "",
          name: "Wawancara",
          frames: [
            raw({
              name: "Master",
              angle: "EYE LEVEL",
              shot: "MEDIUM SHOT",
              lens: 50,
              az: 20,
              el: 3,
              dist: 2.4,
              meta: {
                intent: "Perkenalan narasumber",
                action: "Narasumber duduk menghadap kamera",
                movement: "Static / Locked-off",
              } as Meta,
            }),
            raw({
              name: "Reverse OTS",
              angle: "EYE LEVEL",
              shot: "MEDIUM CLOSE-UP",
              lens: 65,
              az: -28,
              el: 3,
              dist: 2.0,
              meta: { movement: "Static / Locked-off" } as Meta,
            }),
            raw({
              name: "Insert CU",
              angle: "EYE LEVEL",
              shot: "CLOSE-UP",
              lens: 85,
              az: 15,
              el: 2,
              dist: 1.3,
              meta: { intent: "Emosi & detail", movement: "Handheld" } as Meta,
            }),
          ],
        },
      ],
    },
  },
  {
    id: "establisher-drone",
    title: "Establisher drone",
    description:
      "Pembuka udara: bird's-eye lebar untuk skala, orbit tinggi, lalu turun ke eye-level — menegakkan lokasi sebelum masuk aksi.",
    aspectRatio: "2.39:1",
    project: {
      scenes: [
        {
          id: "",
          name: "Opening",
          frames: [
            raw({
              name: "Wide top",
              angle: "BIRD'S EYE",
              shot: "EXTREME WIDE SHOT",
              lens: 24,
              az: 0,
              el: 78,
              dist: 12,
              subj: "object",
              meta: { intent: "Menetapkan skala lokasi", movement: "Crane / Jib" } as Meta,
            }),
            raw({
              name: "Orbit",
              angle: "HIGH ANGLE",
              shot: "WIDE SHOT",
              lens: 35,
              az: 60,
              el: 35,
              dist: 8,
              subj: "object",
              meta: { movement: "Orbit / Arc" } as Meta,
            }),
            raw({
              name: "Descend",
              angle: "EYE LEVEL",
              shot: "MEDIUM WIDE SHOT",
              lens: 35,
              az: 90,
              el: 6,
              dist: 5,
              subj: "object",
              meta: { movement: "Pedestal down" } as Meta,
            }),
          ],
        },
      ],
    },
  },
  {
    id: "produk-hero",
    title: "Produk hero",
    description:
      "Paket iklan produk: hero low-angle yang megah, macro detail, dan top-down flat-lay — semua dengan subjek objek.",
    aspectRatio: "4:5",
    project: {
      scenes: [
        {
          id: "",
          name: "Produk",
          frames: [
            raw({
              name: "Hero",
              angle: "LOW ANGLE",
              shot: "MEDIUM CLOSE-UP",
              lens: 35,
              az: 12,
              el: -28,
              dist: 0.9,
              subj: "object",
              meta: {
                intent: "Kesan megah & premium",
                style: "Dramatic, high-contrast",
                movement: "Static / Locked-off",
              } as Meta,
            }),
            raw({
              name: "Macro detail",
              angle: "EYE LEVEL",
              shot: "EXTREME CLOSE-UP",
              lens: 100,
              az: 32,
              el: 5,
              dist: 0.5,
              subj: "object",
              meta: { intent: "Tekstur & material", movement: "Static / Locked-off" } as Meta,
            }),
            raw({
              name: "Top-down",
              angle: "BIRD'S EYE",
              shot: "MEDIUM SHOT",
              lens: 50,
              az: 0,
              el: 80,
              dist: 1.2,
              subj: "object",
              meta: { intent: "Flat-lay komposisi", movement: "Static / Locked-off" } as Meta,
            }),
          ],
        },
      ],
    },
  },
  {
    id: "aksi-handheld",
    title: "Aksi handheld",
    description:
      "Adegan kejar energik: low-angle dutch handheld, wide chase, dan high-angle tangga — miring dan gelisah untuk ketegangan.",
    aspectRatio: "2.39:1",
    project: {
      scenes: [
        {
          id: "",
          name: "Lorong",
          frames: [
            raw({
              name: "Run",
              angle: "LOW ANGLE",
              shot: "MEDIUM SHOT",
              lens: 28,
              az: 10,
              el: -18,
              dist: 1.8,
              roll: 14,
              meta: { action: "Subjek berlari ke kamera", movement: "Handheld" } as Meta,
            }),
            raw({
              name: "Chase wide",
              angle: "EYE LEVEL",
              shot: "WIDE SHOT",
              lens: 24,
              az: 180,
              el: 2,
              dist: 4,
              meta: { movement: "Handheld" } as Meta,
            }),
          ],
        },
        {
          id: "",
          name: "Tangga",
          frames: [
            raw({
              name: "Down",
              angle: "HIGH ANGLE",
              shot: "WIDE SHOT",
              lens: 24,
              az: 200,
              el: 42,
              dist: 4,
              meta: { movement: "Tilt down" } as Meta,
            }),
          ],
        },
      ],
    },
  },
  {
    id: "dialog-ots-2-shot",
    title: "Dialog OTS 2-shot",
    description:
      "Percakapan dua orang: sepasang reverse over-the-shoulder simetris — dasar coverage dialog yang siap dipotong bolak-balik.",
    aspectRatio: "16:9",
    project: {
      scenes: [
        {
          id: "",
          name: "Dialog",
          frames: [
            raw({
              name: "OTS A",
              angle: "EYE LEVEL",
              shot: "MEDIUM SHOT",
              lens: 50,
              az: 35,
              el: 2,
              dist: 2.2,
              meta: { intent: "Karakter A bicara", movement: "Static / Locked-off" } as Meta,
            }),
            raw({
              name: "OTS B",
              angle: "EYE LEVEL",
              shot: "MEDIUM SHOT",
              lens: 50,
              az: -35,
              el: 2,
              dist: 2.2,
              meta: { intent: "Karakter B merespons", movement: "Static / Locked-off" } as Meta,
            }),
          ],
        },
      ],
    },
  },
  {
    id: "reels-vertikal",
    title: "Reels vertikal",
    description:
      "Konten sosial 9:16: talking-head medium close-up plus b-roll close-up handheld — pas untuk Reels/Shorts/TikTok.",
    aspectRatio: "9:16",
    project: {
      scenes: [
        {
          id: "",
          name: "Reels",
          frames: [
            raw({
              name: "Talking head",
              angle: "EYE LEVEL",
              shot: "MEDIUM CLOSE-UP",
              lens: 35,
              az: 0,
              el: 2,
              dist: 1.6,
              meta: { intent: "Sapaan langsung ke kamera", movement: "Static / Locked-off" } as Meta,
            }),
            raw({
              name: "B-roll CU",
              angle: "EYE LEVEL",
              shot: "CLOSE-UP",
              lens: 50,
              az: 20,
              el: 3,
              dist: 1.1,
              meta: { intent: "Detail produk/tangan", movement: "Handheld" } as Meta,
            }),
          ],
        },
      ],
    },
  },
];
