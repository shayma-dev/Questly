// ==============================
// src/components/tasks/TasksPageUI.jsx
// Presentational UI only
// ==============================
/**

Props contract (keep stable):
loading: boolean
error: string
tasks: Array<{
id: number|string,
title: string,
description?: string,
subject_id: number|string,
subject_name?: string,
due_date: string, // ISO or YYYY-MM-DD
is_completed: boolean
}>
allSubjects: Array<{ id: number|string, name: string }>
filters: {
time: "all" | "today" | "week",
subjectId: number|string|null
}
onFilterChange: {
onTimeChange(value: "all" | "today" | "week"): void,
onSubjectChange(value: number|string|null): void
}
onAddClick(): void
onEditClick(task: {
id: number|string,
title: string,
description?: string,
subject_id: number|string,
subject_name?: string,
due_date: string,
is_completed: boolean
}): void
onDeleteClick(id: number|string): void
onToggleClick(id: number|string): void
*/

import React, { useMemo } from "react";

function DueBadge({ dueDate, isCompleted }) {
  if (isCompleted) {
    return <div style={{ fontSize: 12, color: "#10b981" }}>Completed</div>;
  }

  const due = new Date(dueDate);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const oneDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round(
    (new Date(due.getFullYear(), due.getMonth(), due.getDate()) - start) /
      oneDay
  );

  let text = "";
  let color = "#6b7280";
  if (diffDays === 0) {
    text = "Due Today";
    color = "#2563eb";
  } else if (diffDays === 1) {
    text = "Due Tomorrow";
    color = "#2563eb";
  } else if (diffDays > 1) {
    text = `Due in ${diffDays} Days`;
    color = "#2563eb";
  } else {
    text = `Overdue by ${Math.abs(diffDays)} Days`;
    color = "#dc2626";
  }

  const style = {
    fontSize: 12,
    color,
    textDecoration: isCompleted ? "line-through" : "none",
  };

  return <div style={style}>{text}</div>;
}

export default function TasksPageUI({
  loading = false,
  error = "",
  tasks = [],
  allSubjects = [],
  filters = { time: "all", subjectId: null },
  onFilterChange = { onTimeChange: () => {}, onSubjectChange: () => {} },
  onAddClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
  onToggleClick = () => {},
}) {
  const subjectMap = useMemo(() => {
    const m = new Map();
    (allSubjects || []).forEach((s) => m.set(Number(s.id), s.name));
    return m;
  }, [allSubjects]);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>Tasks</h1>
        <button
          onClick={onAddClick}
          style={{
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}
      >
        {[
          { key: "all", label: "All" },
          { key: "today", label: "Today" },
          { key: "week", label: "This Week" },
        ].map((tab) => {
          const active = filters.time === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange.onTimeChange(tab.key)}
              style={{
                padding: "6px 10px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: active ? "#111827" : "white",
                color: active ? "white" : "#111827",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Subject filter */}
        <div style={{ marginLeft: 8 }}>
          <label style={{ fontSize: 12, color: "#6b7280", marginRight: 6 }}>
            Subject
          </label>
          <select
            value={filters.subjectId || ""}
            onChange={(e) =>
              onFilterChange.onSubjectChange(
                e.target.value ? Number(e.target.value) : null
              )
            }
            style={{
              padding: "6px 10px",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "white",
            }}
          >
            <option value="">All</option>
            {allSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div
          role="status"
          aria-live="polite"
          style={{ color: "crimson", marginTop: 12 }}
        >
          {error}
        </div>
      ) : null}

      {/* Loading */}
      {loading ? <p style={{ marginTop: 12 }}>Loading…</p> : null}

      {/* Empty state */}
      {!loading && tasks.length === 0 ? (
        <div
          style={{
            marginTop: 24,
            background: "#f3f4f6",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ color: "#6b7280" }}>No tasks found.</div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={onAddClick}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
              }}
            >
              Add your first task
            </button>
          </div>
        </div>
      ) : null}

      {/* Task list */}
      {tasks.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Task List</h3>

          <div style={{ display: "grid", gap: 4 }}>
            {tasks.map((t) => {
              const isCompleted = !!t.is_completed;
              const subjectName =
                t.subject_name || subjectMap.get(Number(t.subject_id)) || "—";
              return (
                <div
                  key={t.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 1fr auto",
                    alignItems: "start",
                    gap: 8,
                    padding: "10px 6px",
                    borderBottom: "1px solid #e5e7eb",
                    background: isCompleted ? "#f9fafb" : "white",
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 4,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleClick(t.id)}
                      aria-label={`Mark "${t.title}" as ${
                        isCompleted ? "incomplete" : "complete"
                      }`}
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  {/* Main content */}
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: isCompleted ? "#6b7280" : "#111827",
                        textDecoration: isCompleted ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </div>
                    {t.description ? (
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: 12,
                          marginTop: 2,
                          textDecoration: isCompleted ? "line-through" : "none",
                        }}
                      >
                        {t.description}
                      </div>
                    ) : null}
                    <div style={{ marginTop: 4 }}>
                      <DueBadge
                        dueDate={t.due_date}
                        isCompleted={isCompleted}
                      />
                    </div>
                    <div
                      style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}
                    >
                      {subjectName}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onEditClick(t)}
                      title="Edit task"
                      aria-label="Edit task"
                      style={{
                        background: "transparent",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        padding: "6px 8px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteClick(t.id)}
                      title="Delete task"
                      aria-label="Delete task"
                      style={{
                        background: "transparent",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        padding: "6px 8px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
