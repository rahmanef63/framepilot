// Data Prompt — demo library seed + the Studio starter project. Pure DATA (the
// library's first-run fixtures), so exempt from the file-size cap.
import { raw, uid } from "./core";
import type { Entry, Meta, Project } from "./types";

export function seed(now: number): Entry[] {
  const t = now;
  return [
    {
      id: uid(),
      name: "Wawancara duduk",
      en: "Seated interview",
      source: "photo",
      ref: "referensi_wawancara.jpg",
      created: t - 1000 * 60 * 60 * 3,
      data: {
        scenes: [
          {
            name: "Wawancara",
            frames: [
              raw({
                name: "Master",
                angle: "EYE LEVEL",
                shot: "MEDIUM SHOT",
                lens: 50,
                az: 22,
                el: 3,
                dist: 2.4,
                meta: {
                  intent: "Perkenalan narasumber",
                  action: "Narasumber duduk menghadap kamera",
                  movement: "Static / Locked-off",
                } as Meta,
              }),
              raw({
                name: "Insert CU",
                angle: "EYE LEVEL",
                shot: "CLOSE-UP",
                lens: 85,
                az: 18,
                el: 2,
                dist: 1.2,
                meta: { movement: "Handheld" } as Meta,
              }),
            ],
          },
        ],
      },
    },
    {
      id: uid(),
      name: "Estab. drone kota",
      en: "City drone establisher",
      source: "youtube",
      ref: "youtu.be/aX3kR",
      created: t - 1000 * 60 * 60 * 26,
      data: {
        scenes: [
          {
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
                meta: { intent: "Menetapkan skala kota", movement: "Crane / Jib" } as Meta,
              }),
              raw({
                name: "Orbit",
                angle: "HIGH ANGLE",
                shot: "WIDE SHOT",
                lens: 35,
                az: 60,
                el: 35,
                dist: 8,
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
                meta: { movement: "Pedestal down" } as Meta,
              }),
            ],
          },
        ],
      },
    },
    {
      id: uid(),
      name: "Produk hero",
      en: "Product hero low-angle",
      source: "photo",
      ref: "sepatu_hero.png",
      created: t - 1000 * 60 * 60 * 49,
      data: {
        scenes: [
          {
            name: "Produk",
            frames: [
              raw({
                name: "Hero",
                angle: "LOW ANGLE",
                shot: "MEDIUM CLOSE-UP",
                lens: 35,
                az: 12,
                el: -30,
                dist: 0.9,
                meta: {
                  intent: "Kesan megah & premium",
                  style: "Dramatic, high-contrast",
                  movement: "Static / Locked-off",
                } as Meta,
              }),
            ],
          },
        ],
      },
    },
    {
      id: uid(),
      name: "Aksi kejar",
      en: "Chase — dutch handheld",
      source: "file",
      ref: "chase_plan.json",
      created: t - 1000 * 60 * 60 * 72,
      data: {
        scenes: [
          {
            name: "Lorong",
            frames: [
              raw({
                name: "Run",
                angle: "LOW ANGLE",
                shot: "MEDIUM SHOT",
                lens: 28,
                az: 10,
                el: -20,
                dist: 1.8,
                roll: 16,
                meta: { action: "Subjek berlari ke kamera", movement: "Handheld" } as Meta,
              }),
            ],
          },
          {
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
  ];
}

export function seedProject(): Project {
  return {
    scenes: [
      {
        id: "p1",
        name: "Scene 1 — Intro",
        frames: [
          raw({
            name: "Establisher",
            angle: "WIDE SHOT",
            shot: "WIDE SHOT",
            lens: 35,
            az: 20,
            el: 8,
            dist: 5,
            meta: { intent: "Menetapkan lokasi" } as Meta,
          }),
        ],
      },
      {
        id: "p2",
        name: "Scene 2 — Dialog",
        frames: [
          raw({ name: "OTS", angle: "EYE LEVEL", shot: "MEDIUM SHOT", lens: 50, az: 35, el: 2, dist: 2.2 }),
          raw({ name: "CU", angle: "EYE LEVEL", shot: "CLOSE-UP", lens: 85, az: 25, el: 2, dist: 1.2 }),
        ],
      },
    ],
  };
}
