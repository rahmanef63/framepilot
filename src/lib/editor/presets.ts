// presets.ts — camera authoring presets shared by the control-panel PresetRows and
// the viewport corner camera menu, so the two never drift. Pure data, no imports.

// angle presets [el, roll] (G7)
export const ANGLE_PRESETS: { label: string; el: number; roll: number }[] = [
  { label: "Eye", el: 0, roll: 0 },
  { label: "High", el: 35, roll: 0 },
  { label: "Low", el: -25, roll: 0 },
  { label: "Bird", el: 80, roll: 0 },
  { label: "Worm", el: -55, roll: 0 },
  { label: "Dutch", el: 5, roll: 18 },
];

// shot-size presets [r] (G8)
export const SHOT_PRESETS: { label: string; r: number }[] = [
  { label: "ECU", r: 0.22 },
  { label: "CU", r: 0.45 },
  { label: "MCU", r: 0.75 },
  { label: "MS", r: 1.15 },
  { label: "FS", r: 1.8 },
  { label: "WS", r: 3.0 },
];

// lens presets [mm] (G9)
export const LENS_PRESETS = [18, 24, 35, 50, 85, 135];
