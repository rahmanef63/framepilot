"use client";
// Hud.tsx — the viewfinder HUD overlay for a POV cell (concept DOM ~505-969).
// Letterbox (format-border), crop corners, rule-of-thirds, angle/shot/play
// badges, and the telemetry readout. The engine writes the *text* of
// .angleBadge / .shotBadge / .readout / .formatLabel imperatively via refs
// (concept updateHUD), so those nodes are rendered EMPTY here — React never
// competes for their content. --frame-* letterbox vars are inherited from the
// hosting .cell (set by the engine's updateFormatGuide).

import React from "react";

export function Hud({ thirdsOn }: { thirdsOn: boolean }) {
  return (
    <div className="hud">
      <div className="format-border">
        <span className="formatLabel" />
      </div>
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />
      <div className={"thirds" + (thirdsOn ? "" : " off")}>
        <i className="v1" />
        <i className="v2" />
        <i className="h1" />
        <i className="h2" />
      </div>
      <div className="toplabel">
        <span className="badge playBadge">▶ PLAY</span>
        <span className="badge angleBadge" />
        <span className="badge shotBadge" />
      </div>
      <div className="readout" />
    </div>
  );
}

export default Hud;
