// src/components/ui/ConfirmDialog.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Reusable Confirm Dialog
// Props:
// - open: boolean
// - title: string
// - message: string | ReactNode
// - confirmText: string = "Confirm"
// - cancelText: string = "Cancel"
// - danger: boolean = false (styles confirm button red)
// - onCancel(): void
// - onConfirm(): void
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onCancel,
  onConfirm,
}) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel?.();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onCancel]);

  // Initial focus
  useEffect(() => {
    if (open) {
      // Focus cancel by default to prevent accidental destructive action
      setTimeout(() => cancelRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-[10000] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className={[
          "relative w-full max-w-sm rounded-xl border",
          "border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))]",
          "shadow-xl",
        ].join(" ")}
      >
        <div className="px-5 py-4">
          <h2 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h2>
          <p
            id="confirm-desc"
            className="mt-2 text-sm text-gray-600 dark:text-gray-300"
          >
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[rgb(var(--border))] px-5 py-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className={[
              "rounded-md border px-3 py-1.5 text-sm",
              "border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))]",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            ].join(" ")}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={[
              "rounded-md px-3 py-1.5 text-sm text-white",
              danger
                ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                : "bg-gray-900 hover:bg-black/80 dark:bg-gray-800 dark:hover:bg-gray-700 focus-visible:ring-brand",
              "focus:outline-none focus-visible:ring-2",
            ].join(" ")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}