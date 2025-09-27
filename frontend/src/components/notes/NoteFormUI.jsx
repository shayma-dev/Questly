// src/components/notes/NoteFormUI.jsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Card, { CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { Label, Input, TextArea } from "../ui/Input";
import { IconClose } from "../icons/Icons";
import { toast } from "sonner";
import AddSubjectButton from "../common/AddSubjectButton.jsx";

export default function NoteFormUI({
  open = false,
  mode = "add", // "add" | "edit"
  subjects = [],
  initialValues = { title: "", content: "", subject_id: "" },
  errorText = "",
  onClose = () => {},
  onSubmit = () => {},
  onViewRequest = () => {},
  // NEW: bubble subject creation to the page (so page-level subjects update immediately)
  onSubjectAdded = () => {},
}) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Keep a local copy to update immediately after adding a subject
  const [localSubjects, setLocalSubjects] = useState(subjects || []);
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialValues.title || "");
      setContent(initialValues.content || "");
      setLocalSubjects(subjects || []);
      setSubjectId(initialValues.subject_id || subjects[0]?.id || "");
    }
  }, [open, initialValues, subjects]);

  useEffect(() => {
    if (errorText) toast.error(errorText);
  }, [errorText]);

  const sortedSubjects = useMemo(() => {
    return [...(localSubjects || [])].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [localSubjects]);

  const handleSubjectAdded = (s) => {
    // Update local list and select the new subject
    setLocalSubjects((prev) => {
      const exists = prev.some((p) => Number(p.id) === Number(s.id));
      return exists ? prev : [...prev, s];
    });
    setSubjectId(s.id); // Select it immediately

    // Bubble up to page so filters/labels reflect immediately
    onSubjectAdded(s);
  };

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Hard guards to avoid accidental invalid submits
    const t = title.trim();
    const c = content.trim();

    if (t.length < 3) return toast.error("Title must be at least 3 characters long");
    if (t.length > 120) return toast.error("Title must be less than 120 characters");
    if (!c) return toast.error("Content is required");
    if (c.length > 12000) return toast.error("Content is too long (maximum 12,000 characters)");
    if (!subjectId) return toast.error("Please select a subject");

    const payload = {
      title: t,
      content: c,
      subject_id: Number(subjectId),
    };

    await onSubmit(payload, { setSaving });
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" backdrop="blur" titleId="note-form-title">
      <Card className="border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <CardHeader
          title={<span id="note-form-title">{mode === "add" ? "Create New Note" : "Edit Note"}</span>}
          right={
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewRequest();
                  }}
                  title="View note"
                >
                  View Note
                </Button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <IconClose />
              </button>
            </div>
          }
        />
        {/* Make the inner area scrollable within modal bounds */}
        <CardBody className="max-h-[calc(85vh-4rem-4rem)] overflow-auto">
          <form
            onSubmit={validateAndSubmit}
            className="grid gap-4"
            onKeyDown={(e) => {
              // Keep submit within this form only; do not bubble to any parent container
              if (e.key === "Enter") e.stopPropagation();
            }}
          >
            {/* Title + Subject */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                  maxLength={120}
                />
                <div className="mt-1 text-right text-[11px] text-gray-500 dark:text-gray-400">
                  {title.length}/120
                </div>
              </div>

              <div>
                <Label htmlFor="note-subject">Subject</Label>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    id="note-subject"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="h-10 w-full rounded-md border bg-[rgb(var(--card))] text-[rgb(var(--fg))] border-[rgb(var(--border))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    {sortedSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  {/* Inline Add Subject (button itself is form-safe) */}
                  <AddSubjectButton onAdded={handleSubjectAdded} size="md" toastOnSuccess={true} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="note-content">Content (Markdown supported)</Label>
              <TextArea
                id="note-content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here. You can use Markdown formatting..."
                maxLength={12000}
                className="font-mono"
              />
              <div className="mt-1 text-right text-[11px] text-gray-500 dark:text-gray-400">
                {content.length}/12,000 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : mode === "add" ? "Create Note" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </Modal>
  );
}