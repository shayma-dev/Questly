// src/components/ui/Modal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  titleId,
  descId,
  size = "md",
  backdrop = "blur",
  children,
}) {
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement;
      setTimeout(() => {
        const el =
          panelRef.current?.querySelector(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
          ) || panelRef.current;
        el?.focus?.();
      }, 0);
    } else {
      lastActiveRef.current?.focus?.();
    }
  }, [open]);

  if (!open) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-md",   // changed from lg to md for compact auth panels
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 transition-opacity",
          backdrop === "blur"
            ? "bg-black/35 dark:bg-black/55 backdrop-blur-[1.5px]"
            : "bg-black/35 dark:bg-black/55",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Panel (single width authority) */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={[
          // keep small side gutters on tiny screens
          "relative box-border",
          "w-[calc(100vw-2rem)]", // prevents right overhang due to borders
          widths,
          "rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] shadow-xl",
          "max-h-[85vh] overflow-hidden",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}