/* eslint-disable no-unused-vars */
// src/components/notes/NoteKeeperUI.jsx
import React from "react";
import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";
import { Label, Input } from "../ui/Input";
import { IconEdit, IconTrash } from "../icons/Icons";
import { subjectStyle } from "../../utils/subjectColor";
import { motion, AnimatePresence } from "framer-motion";

function relativeTime(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function stripMarkdownForPreview(markdown, maxLength = 160) {
  if (!markdown) return "";
  const stripped = markdown
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "[code]")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + "...";
}

function NoteCard({ note, onView, onEdit, onDelete }) {
  const preview = stripMarkdownForPreview(note.content);
  const timeAgo = relativeTime(note.created_at);
  const subj = subjectStyle(note.subject_id ?? note.subject ?? 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 0.8, 0.24, 1] }}
    >
      <div
        className="group relative cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onView(note)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onView(note);
          }
        }}
      >
        {/* Subject-accent top border */}
        <div
          className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
          style={{ background: subj.borderColor }}
        />
        <Card className="transition-shadow hover:shadow-md">
          <CardBody>
            {/* Removed initials avatar column to keep things neat */}
            <div className="grid grid-cols-[1fr_auto] items-start gap-3">
              {/* Text */}
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background: subj.backgroundColor,
                      color: subj.color,
                      borderColor: subj.borderColor,
                    }}
                    title={note.subject_name || "Unknown"}
                  >
                    {note.subject_name || "Unknown"}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{timeAgo}</span>
                </div>

                <h3 className="truncate text-[15px] font-semibold">{note.title}</h3>
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{preview}</p>
              </div>

              {/* Actions */}
              <div
                className="flex items-start gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onEdit(note)}
                  title="Edit note"
                  aria-label="Edit note"
                  className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--fg))] transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => onDelete(note.id)}
                  title="Delete note"
                  aria-label="Delete note"
                  className="inline-flex items-center justify-center rounded-md p-2 text-[rgb(var(--fg))] transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
}

function EmptyState({ title, description }) {
  return (
    <Card>
      <CardBody>
        <div className="grid place-items-center gap-2 py-8 text-center">
          <div className="text-4xl">📝</div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default function NoteKeeperUI({
  loading = false,
  error = "",
  notes = [],
  subjects = [],
  selectedSubject = "All",
  searchQuery = "",
  onSubjectSelect = () => {},
  onSearchChange = () => {},
  onAddClick = () => {},
  onViewClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
}) {
  // Group notes by subject to create subtle “stacks”
  const grouped = React.useMemo(() => {
    if (!notes?.length) return [];
    const map = new Map();
    notes.forEach((n) => {
      const sid = String(n.subject_id ?? "0");
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid).push(n);
    });
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      map.set(k, arr);
    }
    const order = subjects.map((s) => String(s.id));
    const stacks = Array.from(map.entries())
      .filter(([sid]) => selectedSubject === "All" || sid === String(selectedSubject))
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    return stacks;
  }, [notes, subjects, selectedSubject]);

  return (
    <div data-ui="note-keeper" className="mx-auto max-w-5xl px-4 py-6">
      {/* Banner Header — unchanged */}
      <div className="banner-card">
        <div className="banner-content flex items-center justify-between gap-4">
          <div>
            <h1 className="banner-title">Note Keeper</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Capture ideas, organize by subject.
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {notes.length} note{notes.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button onClick={onAddClick} variant="primary" aria-label="Add Note">
            Add Note
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mt-4">
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSubjectSelect("All")}
                className={[
                  "relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                  selectedSubject === "All"
                    ? "border border-[var(--pill-selected-bg)] bg-[var(--pill-selected-bg)] text-[var(--pill-selected-fg)] shadow-[var(--pill-selected-shadow)]"
                    : "border border-[rgb(var(--day-pill-border))] bg-[rgb(var(--day-pill-bg))] text-[rgb(var(--day-pill-fg))] hover:bg-[rgb(var(--day-pill-hover))]",
                ].join(" ")}
              >
                All
              </button>

              {subjects
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((subject) => {
                  const active = selectedSubject === String(subject.id);
                  return (
                    <button
                      key={subject.id}
                      onClick={() => onSubjectSelect(String(subject.id))}
                      className={[
                        "relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                        active
                          ? "border border-[var(--pill-selected-bg)] bg-[var(--pill-selected-bg)] text-[var(--pill-selected-fg)] shadow-[var(--pill-selected-shadow)]"
                          : "border border-[rgb(var(--day-pill-border))] bg-[rgb(var(--day-pill-bg))] text-[rgb(var(--day-pill-fg))] hover:bg-[rgb(var(--day-pill-hover))]",
                      ].join(" ")}
                    >
                      {subject.name}
                    </button>
                  );
                })}
            </div>

            {/* Search */}
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="note-search">Search</Label>
              <Input
                id="note-search"
                type="text"
                placeholder="Title or content..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-[min(100%,280px)] rounded-full"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 0.8, 0.24, 1] }}
      >
        {/* Loading */}
        {loading && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]"
              />
            ))}
          </div>
        )}

        {/* Empty or Stacks */}
        {!loading && (
          <div className="mt-4">
            {notes.length === 0 ? (
              <EmptyState
                title={
                  selectedSubject !== "All" || (searchQuery && searchQuery.trim())
                    ? "No notes found"
                    : "No notes yet"
                }
                description={
                  selectedSubject !== "All"
                    ? "No notes in this subject. Create your first note."
                    : searchQuery && searchQuery.trim()
                    ? `No notes match "${searchQuery}". Try adjusting your search or create a new note.`
                    : "Create your first note to start building your knowledge base."
                }
              />
            ) : (
              <AnimatePresence initial={true} mode="popLayout">
                <motion.div layout className="grid gap-4 md:grid-cols-2" transition={{ duration: 0.18 }}>
                  {(selectedSubject === "All"
                    ? subjects
                        .map((s) => String(s.id))
                        .filter((sid) => notes.some((n) => String(n.subject_id) === sid))
                    : [String(selectedSubject)]
                  ).map((sid) => {
                    const subject = subjects.find((s) => String(s.id) === sid);
                    const subjColors = subjectStyle(Number(sid) || 0);
                    const stackNotes = notes
                      .filter((n) => String(n.subject_id) === sid)
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    return (
                      <div key={sid} className="flex flex-col">
                        {/* Stack header — lightly highlighted with subject background color */}
                        <div
                          className="mb-2 flex items-center justify-between rounded-lg border px-3 py-2"
                          style={{
                            borderColor: subjColors.borderColor,
                            background: subjColors.backgroundColor, // subtle pastel bg
                          }}
                        >
                          <span className="text-sm font-medium" style={{ color: subjColors.color }}>
                            {subject?.name || "Subject"}
                          </span>
                          <span className="text-xs" style={{ color: subjColors.color }}>
                            {stackNotes.length} note{stackNotes.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        {/* Stack list */}
                        <div className="grid gap-3">
                          {stackNotes.map((note) => (
                            <NoteCard
                              key={note.id}
                              note={note}
                              onView={onViewClick}
                              onEdit={onEditClick}
                              onDelete={onDeleteClick}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}