// EditorIcons.tsx — tiny inline-SVG icon set for the Studio transport + row
// actions. Zero deps, currentColor fill so they inherit button/text color and
// theme automatically. 16px default, sized down where space is tight. Replaces
// the text labels ("Play"/"Prompt"/"Note"/"C") so the dense controls stop eating
// horizontal room. Material-ish 24-grid paths.

import React from "react";

type P = { size?: number; title?: string };

function Svg({ size = 16, title, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      style={{ display: "block", flex: "none" }}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const IconPlay = (p: P) => (
  <Svg {...p}>
    <path d="M8 5v14l11-7z" />
  </Svg>
);
export const IconPause = (p: P) => (
  <Svg {...p}>
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </Svg>
);
export const IconPrev = (p: P) => (
  <Svg {...p}>
    <path d="M6 5h2v14H6zM20 5v14L9 12z" />
  </Svg>
);
export const IconNext = (p: P) => (
  <Svg {...p}>
    <path d="M16 5h2v14h-2zM4 5l11 7L4 19z" />
  </Svg>
);
export const IconStop = (p: P) => (
  <Svg {...p}>
    <path d="M6 6h12v12H6z" />
  </Svg>
);
export const IconLoop = (p: P) => (
  <Svg {...p}>
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
  </Svg>
);
// "cut vs smooth" transition — a scissors-ish glyph for the CUT/HALUS toggle
export const IconTransition = (p: P) => (
  <Svg {...p}>
    <path d="M3 6h7v12H3zM14 6h7v12h-7zm-2 3 2 3-2 3z" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
  </Svg>
);
export const IconUpdate = (p: P) => (
  <Svg {...p}>
    <path d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z" />
  </Svg>
);
export const IconCopy = (p: P) => (
  <Svg {...p}>
    <path d="M15 1H4a2 2 0 0 0-2 2v12h2V3h11V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h10v14z" />
  </Svg>
);
export const IconNote = (p: P) => (
  <Svg {...p}>
    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.58z" />
  </Svg>
);
// clipboard — "copy the prompt text" (distinct from the stacked-pages duplicate)
export const IconClipboard = (p: P) => (
  <Svg {...p}>
    <path d="M16 3h-1.18A3 3 0 0 0 9.18 3H8a2 2 0 0 0-2 2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2zm-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 17H5V7h2v2h10V7h2v13z" />
  </Svg>
);
