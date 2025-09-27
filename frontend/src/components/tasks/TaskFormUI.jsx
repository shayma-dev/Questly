// ==============================
// src/components/tasks/TaskFormUI.jsx
// Refactored to use Modal, unified buttons, consistent styling
// ==============================
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Card, { CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import AddSubjectButton from "../common/AddSubjectButton.jsx";

export default function TaskFormUI({
  open = false,
  mode = "add",
  saving = false,
  subjects = [],
  initialValues = { title: "", description: "", subject_id: "", due_date: "" },
  onClose = () => {},
  onSubmit = () => {},
  // Optional: bubble subject creation to parent page so filters update immediately
  onSubjectAdded = () => {},
}) {
  // Keep a local copy so we can update immediately when a subject is added
  const [localSubjects, setLocalSubjects] = useState(subjects || []);

  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [subjectId, setSubjectId] = useState(
    initialValues.subject_id || subjects[0]?.id || ""
  );
  const [dueDate, setDueDate] = useState(initialValues.due_date || "");

  // Sync local subjects when modal opens or parents change subjects
  useEffect(() => {
    if (open) {
      setLocalSubjects(subjects || []);
      setTitle(initialValues.title || "");
      setDescription(initialValues.description || "");
      setSubjectId(initialValues.subject_id || subjects[0]?.id || "");
      setDueDate(initialValues.due_date || "");
    }
  }, [open, initialValues, subjects]);

  // HARD GUARD to prevent accidental/invalid submits
  const handleSubmit = (e) => {
    e.preventDefault();
    const t = (title || "").trim();
    const s = subjectId;
    const d = dueDate;
    if (!t || !s || !d) {
      return; // refuse submit if any required field is empty
    }
    const payload = {
      title: t,
      description: (description || "").trim(),
      subject_id: Number(s),
      due_date: d,
    };
    onSubmit(payload);
  };

  // When a subject is added via the modal button
  const handleSubjectAdded = (s) => {
    // Update local list (avoid duplicates by id)
    setLocalSubjects((prev) => {
      const exists = prev.some((p) => Number(p.id) === Number(s.id));
      return exists ? prev : [...prev, s];
    });
    // Select it immediately
    setSubjectId(s.id);
    // Bubble to page so filters and subjects list update without reload
    onSubjectAdded?.(s);
  };

  // Keep the list stable order (by name) for UX
  const sortedSubjects = useMemo(() => {
    return [...(localSubjects || [])].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [localSubjects]);

  return (
    <Modal open={open} onClose={onClose} ariaLabel={mode === "add" ? "Add Task" : "Edit Task"}>
      <div className="w-full max-w-lg">
        <Card className="border border-[rgb(var(--border))] shadow-xl">
          <CardHeader
            title={mode === "add" ? "Add Task" : "Edit Task"}
            actions={
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ×
              </button>
            }
          />
          <CardBody>
            <form
              onSubmit={handleSubmit}
              className="grid gap-3"
              onKeyDown={(e) => {
                // Contain Enter inside fields; only submit via the buttons
                if (e.key === "Enter") e.stopPropagation();
              }}
            >
              <label className="grid gap-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-300">Title</span>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-300">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="min-h-[90px] resize-y rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--fg))] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                {/* Subject + AddSubject icon button */}
                <div className="grid gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Subject</span>
                  <div className="flex items-center gap-2">
                    <select
                      required
                      value={subjectId}
                      onChange={(e) => setSubjectId(Number(e.target.value))}
                      className="flex-1 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--fg))] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:bg-gray-900 dark:text-gray-100"
                    >
                      {sortedSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    {/* AddSubjectButton is already form-safe */}
                    <AddSubjectButton size="md" onAdded={handleSubjectAdded} />
                  </div>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Due date</span>
                  <Input
                    required
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" onClick={onClose} variant="secondary">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} variant="primary">
                  {saving ? "Saving…" : mode === "add" ? "Add Task" : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Modal>
  );
}