// src/components/common/AddSubjectButton.jsx
import React, { useRef, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { Input, Label } from "../ui/Input.jsx";
import { addSubject } from "../../api/profileApi.js";
import { toast } from "sonner";

export default function AddSubjectButton({
  onAdded,               // (subject) => void
  size = "md",
  className = "",
  toastOnSuccess = true, // set false when parent will toast to avoid double toasts
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const sizes = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-10 w-10" };
  const btnSize = sizes[size] || sizes.md;

  function reset() {
    setName("");
    setBusy(false);
    setError("");
  }

  function close() {
    setOpen(false);
    reset();
  }

  // SAFETY: prevent accidental form submits in any parent form
  function openModalSafe(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setOpen(true);
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const n = String(name || "").trim();
    if (!n) {
      setError("Please enter a subject name.");
      inputRef.current?.focus();
      return;
    }

    setBusy(true);
    setError("");
    try {
      // API returns { message, id }
      const res = await addSubject(n);
      const newSubject = { id: res?.id, name: n }; // canonical subject

      onAdded?.(newSubject);

      if (toastOnSuccess) {
        toast.success(`Subject “${n}” added`);
      }

      close();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to add subject. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Add subject"
        title="Add subject"
        onMouseDown={(e) => e.preventDefault()} // avoid focus/implicit submit quirks
        onClick={openModalSafe}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openModalSafe(e);
          }
        }}
        className={[
          "inline-flex items-center justify-center rounded-md",
          btnSize,
          "border border-[rgb(var(--border))] bg-[rgb(var(--card))]",
          "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          className,
        ].join(" ")}
      >
        <PlusCircleIcon className="h-5 w-5" />
      </button>

      <Modal open={open} onClose={close} ariaLabel="Add subject" size="sm">
        {/* Guard against backdrop handlers capturing events */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            // prevent Enter/Escape from leaking to parent forms
            if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
              e.stopPropagation();
            }
          }}
        >
          <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-3">
            <h3 className="text-base font-semibold">Add Subject</h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                close();
              }}
              aria-label="Close"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-5 py-4 grid gap-3"
            // prevent implicit submit by Enter on inputs from bubbling
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // allow submit only if inside this form (it is)
                // but stop propagation to parent
                e.stopPropagation();
              }
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="new-subject-name">Subject name</Label>
              <Input
                id="new-subject-name"
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Algebra"
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="mt-1 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  close();
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Adding…" : "Add Subject"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

function PlusCircleIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}