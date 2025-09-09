// ==============================
// src/components/tasks/TaskFormUI.jsx
// Simple modal form used for Add/Edit
// ==============================
import React, { useEffect, useState } from "react";

export default function TaskFormUI({
  open = false,
  mode = "add", // "add" | "edit"
  saving = false,
  subjects = [],
  initialValues = { title: "", description: "", subject_id: "", due_date: "" }, // due_date YYYY-MM-DD
  onClose = () => {},
  onSubmit = () => {},
}) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(
    initialValues.description || ""
  );
  const [subjectId, setSubjectId] = useState(
    initialValues.subject_id || subjects[0]?.id || ""
  );
  const [dueDate, setDueDate] = useState(initialValues.due_date || "");

  useEffect(() => {
    if (open) {
      setTitle(initialValues.title || "");
      setDescription(initialValues.description || "");
      setSubjectId(initialValues.subject_id || subjects[0]?.id || "");
      setDueDate(initialValues.due_date || "");
    }
  }, [open, initialValues, subjects]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      description: description.trim(),
      subject_id: subjectId,
      due_date: dueDate, // backend expects YYYY-MM-DD
    };
    onSubmit(payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {mode === "add" ? "Add Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 10, marginTop: 12 }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              style={{
                padding: "8px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              style={{
                padding: "8px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                resize: "vertical",
              }}
            />
          </label>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Subject</span>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(Number(e.target.value))}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Due date</span>
              <input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "8px 12px",
                border: "1px solid #111827",
                borderRadius: 6,
                background: "#111827",
                color: "white",
                cursor: "pointer",
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving
                ? "Saving…"
                : mode === "add"
                ? "Add Task"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
