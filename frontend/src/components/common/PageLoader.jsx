// src/components/common/PageLoader.jsx
import React from "react";

export default function PageLoader({ label = "Loading…" }) {
  return (
    <div style={{
      minHeight: "40vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12
    }}>
      <div className="animate-spin h-5 w-5 rounded-full border-2 border-zinc-300 border-t-transparent" />
      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}