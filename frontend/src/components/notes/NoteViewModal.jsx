// src/components/notes/NoteViewModal.jsx
import React from "react";
import Modal from "../ui/Modal";
import Card, { CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { IconClose } from "../icons/Icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

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

export default function NoteViewModal({
  open = false,
  note = null,
  onClose = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  if (!open || !note) return null;
  const timeAgo = relativeTime(note.created_at);

  return (
    <Modal open={open} onClose={onClose} size="lg" backdrop="blur" titleId="note-view-title">
      <Card>
        <CardHeader
          title={
            <div>
              <h1 id="note-view-title" className="text-xl font-semibold">
                {note.title}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="rounded-full bg-[var(--banner-card)] px-2 py-0.5 dark:bg-white/5">
                  {note.subject_name || "Unknown Subject"}
                </span>
                <span>{timeAgo}</span>
              </div>
            </div>
          }
          right={
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <IconClose />
            </button>
          }
        />
        {/* Scrollable content within modal bounds */}
        <CardBody className="max-h-[calc(85vh-4rem-4rem)] overflow-auto">
          <div className="prose-note prose max-w-none prose-pre:overflow-x-auto dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {note.content}
            </ReactMarkdown>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="primary" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </CardBody>
      </Card>
    </Modal>
  );
}