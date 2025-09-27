// src/components/common/AuthGateFallback.jsx
import React from "react";

export default function AuthGateFallback() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 12
    }}>
      <div className="animate-spin h-6 w-6 rounded-full border-2 border-zinc-300 border-t-transparent" />
      <div style={{ color: "var(--muted-foreground)" }}>Checking your session…</div>
    </div>
  );
}