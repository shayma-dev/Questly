// src/components/landing-page/FancyLoader.jsx
import React from "react";

export default function FancyLoader({ show = false }) {
  if (!show) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999] grid place-items-center
        bg-[rgb(var(--bg))] text-[rgb(var(--fg))]
      "
      aria-label="Loading"
      aria-live="polite"
      // Important: no focus capture, no tabIndex, no scroll
    >
      {/* Soft gradient backdrop (fixed, won’t push layout) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(45% 45% at 20% 25%, var(--hero-from) 0%, transparent 60%), radial-gradient(45% 45% at 80% 20%, var(--hero-via) 0%, transparent 60%), radial-gradient(55% 55% at 60% 70%, var(--hero-to) 0%, transparent 60%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* Centered tile */}
      <div className="relative grid place-items-center gap-4">
        <div
          className="
            grid h-20 w-20 place-items-center rounded-2xl
            bg-[rgb(var(--card))]
            border border-[rgb(var(--border))]
            shadow-[0_18px_50px_-18px_rgba(2,6,23,0.35)]
          "
        >
          <img
            src="/QuestlyLogo.svg"
            alt=""
            className="h-10 w-10"
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </div>

        <div className="h-2 w-44 overflow-hidden rounded-full bg-[rgb(var(--border))]/70">
          <div
            className="h-2 w-1/3 rounded-full bg-gradient-to-r from-[var(--hero-from)] via-[var(--hero-via)] to-[var(--hero-to)]"
            style={{ animation: "bar-move 1.35s ease-in-out infinite" }}
          />
        </div>

        <div className="text-xs text-[rgb(var(--muted))]">Loading…</div>
      </div>

      <style>{`
        @keyframes bar-move {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(40%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
