// ==============================
// src/components/tasks/TasksPageUI.jsx
// Banner-styled header (no ring), unified buttons, subject chips (no dot)
// ==============================
/**
Props contract unchanged.
*/
import React, { useMemo } from "react";
import Card, { CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { Label } from "../ui/Input";
import { IconEdit, IconTrash } from "../icons/Icons";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { subjectStyle } from "../../utils/subjectColor";

function DueBadge({ dueDate, isCompleted }) {
  if (isCompleted) {
    return (
      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Completed
      </div>
    );
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
  let cls = "text-gray-500 dark:text-gray-400";
  if (diffDays === 0) {
    text = "Due Today";
    cls = "text-blue-600 dark:text-blue-400";
  } else if (diffDays === 1) {
    text = "Due Tomorrow";
    cls = "text-blue-600 dark:text-blue-400";
  } else if (diffDays > 1) {
    text = `Due in ${diffDays} Days`;
    cls = "text-blue-600 dark:text-blue-400";
  } else {
    text = `Overdue by ${Math.abs(diffDays)} Days`;
    cls = "text-red-600 dark:text-red-400";
  }

  return <div className={`text-xs ${cls}`}>{text}</div>;
}

function MotionTaskRow({ children }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 0.8, 0.24, 1] }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

function TaskRow({ task, subjectName, onToggle, onEdit, onDelete }) {
  const isCompleted = !!task.is_completed;
  const subjStyle = subjectStyle(task.subject_id ?? task.subject ?? 0);

  return (
    <div
      className={[
        "group grid grid-cols-[28px_1fr_auto] items-start gap-2 rounded-md px-2 py-2 transition-colors",
        "hover:bg-[var(--bg-soft-d)]/40 dark:hover:bg-[rgb(var(--bg-soft-c))]/25",
        isCompleted ? "opacity-90" : "",
      ].join(" ")}
    >
      {/* Checkbox */}
      <div className="flex justify-center pt-1">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={onToggle}
          aria-label={`Mark "${task.title}" as ${
            isCompleted ? "incomplete" : "complete"
          }`}
          className={[
            "h-4 w-4 cursor-pointer accent-gray-800 dark:accent-gray-200",
            "transition-transform duration-150",
            isCompleted ? "scale-105" : "scale-100",
          ].join(" ")}
        />
      </div>

      {/* Main content */}
      <div>
        <div
          className={[
            "font-medium transition-all",
            isCompleted
              ? "text-gray-500 line-through"
              : "text-[rgb(var(--fg))]",
          ].join(" ")}
        >
          {task.title}
        </div>

        {task.description ? (
          <div
            className={[
              "mt-0.5 text-xs transition-all",
              isCompleted
                ? "text-gray-400 line-through"
                : "text-gray-600 dark:text-gray-300",
            ].join(" ")}
          >
            {task.description}
          </div>
        ) : null}

        <div className="mt-1 flex items-center gap-2">
          <DueBadge dueDate={task.due_date} isCompleted={isCompleted} />
          <span className="text-[10px] text-gray-400">•</span>

          {/* Subject chip (no dot) */}
          <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
            style={subjStyle}
            title={subjectName}
          >
            {subjectName}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          title="Edit task"
          aria-label="Edit task"
          className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-2 py-1 transition-colors hover:bg-[var(--bg-soft-c)]/60 dark:hover:bg-gray-800"
        >
          <IconEdit />
        </button>
        <button
          onClick={onDelete}
          title="Delete task"
          aria-label="Delete task"
          className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

export default function TasksPageUI({
  loading = false,
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

  const todo = useMemo(() => tasks.filter((t) => !t.is_completed), [tasks]);
  const done = useMemo(() => tasks.filter((t) => !!t.is_completed), [tasks]);

  // We removed the ring and keep clear KPIs in text
  return (
    <div data-ui="tasks-page-ui" className="mx-auto max-w-5xl px-4 py-6 text-[rgb(var(--fg))]">
      {/* Banner Header — subtle, no ring */}
      <div className="banner-card">
        <div className="banner-content flex items-center justify-between gap-4">
          <div>
            <h1 className="banner-title">Tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Plan your day, track your progress.
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {todo.length} to‑do {done.length} completed
            </p>
          </div>
          <Button onClick={onAddClick} aria-label="Add Task" variant="primary">
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mt-4">
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            {/* Time filters */}
            <div className="flex flex-wrap items-center gap-2">
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
                    className={[
                      "relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                      active
                        ? "border border-[var(--pill-selected-bg)] bg-[var(--pill-selected-bg)] text-[var(--pill-selected-fg)] shadow-[var(--pill-selected-shadow)]"
                        : "border border-[rgb(var(--day-pill-border))] bg-[rgb(var(--day-pill-bg))] text-[rgb(var(--day-pill-fg))] hover:bg-[rgb(var(--day-pill-hover))]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Subject filter */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 dark:text-gray-300">Subject</Label>
              <select
                value={filters.subjectId || ""}
                onChange={(e) =>
                  onFilterChange.onSubjectChange(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-sm",
                  "border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                ].join(" ")}
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
        </CardBody>
      </Card>

      {/* Loading */}
      {loading ? <p className="mt-3 text-gray-600 dark:text-gray-300">Loading…</p> : null}

      {/* Empty state */}
      {!loading && tasks.length === 0 ? (
        <Card className="mt-4">
          <CardBody>
            <div className="text-sm text-gray-500 dark:text-gray-400">No tasks found.</div>
            <div className="mt-3">
              <Button onClick={onAddClick} variant="secondary">
                Add your first task
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Split lists */}
      {tasks.length > 0 && (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {/* To‑Do */}
          <Card>
            <CardHeader
              title="To‑Do"
              subtitle={todo.length === 0 ? "You're all caught up!" : "Pending tasks"}
            />
            <CardBody>
              {todo.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No pending tasks.</div>
              ) : (
                <div className="divide-y divide-[rgb(var(--border))]">
                  <AnimatePresence initial={false} mode="popLayout">
                    {todo.map((t) => (
                      <MotionTaskRow key={t.id}>
                        <TaskRow
                          task={t}
                          subjectName={
                            t.subject_name || subjectMap.get(Number(t.subject_id)) || "—"
                          }
                          onToggle={() => onToggleClick(t.id)}
                          onEdit={() => onEditClick(t)}
                          onDelete={() => onDeleteClick(t.id)}
                        />
                      </MotionTaskRow>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader
              title="Completed"
              subtitle={done.length === 0 ? "Nothing completed yet" : "Nice work, keep it up!"}
            />
            <CardBody>
              {done.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed tasks will appear here.</div>
              ) : (
                <div className="divide-y divide-[rgb(var(--border))]">
                  <AnimatePresence initial={false} mode="popLayout">
                    {done.map((t) => (
                      <MotionTaskRow key={t.id}>
                        <TaskRow
                          task={t}
                          subjectName={
                            t.subject_name || subjectMap.get(Number(t.subject_id)) || "—"
                          }
                          onToggle={() => onToggleClick(t.id)}
                          onEdit={() => onEditClick(t)}
                          onDelete={() => onDeleteClick(t.id)}
                        />
                      </MotionTaskRow>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  );
}