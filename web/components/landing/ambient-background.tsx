"use client";

import * as React from "react";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Vertical 35mm film sprocket strips on gutters */}
      <div className="vertical-sprocket-left hidden xl:block" aria-hidden="true" />
      <div className="vertical-sprocket-right hidden xl:block" aria-hidden="true" />

      {/* Top cinema projector light beam - static, subtle, zero jitter */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl h-[500px] opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(212, 160, 84, 0.20) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle secondary ambient glows */}
      <div
        className="absolute top-[40%] -left-48 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute top-[65%] -right-48 w-96 h-96 rounded-full bg-accent/5 blur-[120px]"
        aria-hidden="true"
      />

      {/* Subtle digital grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(to right, #e8e9eb 1px, transparent 1px), linear-gradient(to bottom, #e8e9eb 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
