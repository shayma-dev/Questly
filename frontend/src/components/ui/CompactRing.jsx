// ==============================
// src/components/ui/CompactRing.jsx
// Subtle progress ring for KPI badges
// ==============================
import React from "react";

export default function CompactRing({ size = 36, stroke = 6, pct = 0, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const dash = (clamped / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="var(--progress-color)"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      {label ? (
        <span className="absolute text-[10px] font-semibold tabular-nums">{label}</span>
      ) : null}
    </div>
  );
}