// src/components/planner/SessionFormUI.jsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Label, Input, FieldError } from "../ui/Input";
import AddSubjectButton from "../common/AddSubjectButton.jsx";

function minutesFromTime(t) {
  if (!t) return 0;
  const [hh = "0", mm = "0"] = String(t).split(":");
  return Number(hh) * 60 + Number(mm);
}

export default function SessionFormUI({
  open = false,
  mode = "add",
  days = [],
  subjects = [],
  initialValues = { day: "Mon", subject_id: "", start_time: "", end_time: "" },
  errorText = "",
  onClose = () => {},
  onSubmit = () => {},
  onSubjectAdded = () => {}, // NEW: bubble subject to page
}) {
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  // Keep a local copy so we can update immediately when a subject is added
  const [localSubjects, setLocalSubjects] = useState(subjects || []);

  const [day, setDay] = useState(initialValues.day || "Mon");
  const [subjectId, setSubjectId] = useState(
    initialValues.subject_id || subjects[0]?.id || ""
  );
  const [startTime, setStartTime] = useState(initialValues.start_time || "");
  const [endTime, setEndTime] = useState(initialValues.end_time || "");

  useEffect(() => {
    if (open) {
      setLocalSubjects(subjects || []);
      setDay(initialValues.day || "Mon");
      setSubjectId(initialValues.subject_id || subjects[0]?.id || "");
      setStartTime(initialValues.start_time || "");
      setEndTime(initialValues.end_time || "");
      setLocalError("");
    }
  }, [open, initialValues, subjects]);

  const sortedSubjects = useMemo(() => {
    return [...(localSubjects || [])].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [localSubjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalError("");

    // Hard guard to avoid accidental invalid submissions
    if (!day || !subjectId || !startTime || !endTime) {
      setLocalError("All fields are required.");
      return;
    }

    if (minutesFromTime(endTime) <= minutesFromTime(startTime)) {
      setLocalError("End time must be after start time.");
      return;
    }

    const payload = {
      day,
      subject_id: Number(subjectId),
      start_time: startTime,
      end_time: endTime,
    };

    await onSubmit(payload, { setSaving });
  };

  // When a subject is added from the inline modal
  const handleSubjectAdded = (s) => {
    setLocalSubjects((prev) => {
      const exists = prev.some((p) => Number(p.id) === Number(s.id));
      return exists ? prev : [...prev, s];
    });
    setSubjectId(s.id); // immediately select the newly added subject

    // Also update the page-level subjects so labels resolve instantly
    onSubjectAdded(s);
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" titleId="planner-form-title">
      {/* Vibrant header tint */}
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-4 bg-[var(--bg-soft-a)]/50 dark:bg-[rgb(var(--bg-soft-a))]/40">
        <h2 id="planner-form-title" className="text-lg font-semibold">
          {mode === "add" ? "Add Session" : "Edit Session"}
        </h2>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="rounded-md p-1 text-gray-700 hover:bg-[var(--bg-soft-c)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="inline-block text-xl leading-none">×</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-5 py-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.stopPropagation();
        }}
      >
        {(localError || errorText) && (
          <FieldError>{localError || errorText}</FieldError>
        )}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <Label>Day</Label>
            <select
              required
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className={[
                "h-10 w-full rounded-md border px-3 text-sm",
                "border-[rgb(var(--border))] bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
              ].join(" ")}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <div className="block">
            <Label>Subject</Label>
            <div className="flex items-center gap-2">
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className={[
                  "h-10 w-full rounded-md border px-3 text-sm",
                  "border-[rgb(var(--border))] bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
                ].join(" ")}
              >
                {sortedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Inline Add Subject button */}
              <AddSubjectButton onAdded={handleSubjectAdded} size="md" toastOnSuccess={true} />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <Label>Start time</Label>
            <Input
              required
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>

          <label className="block">
            <Label>End time</Label>
            <Input
              required
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} variant="primary">
            {saving
              ? "Saving…"
              : mode === "add"
              ? "Add Session"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}