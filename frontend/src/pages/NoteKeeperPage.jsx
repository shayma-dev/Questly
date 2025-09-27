// src/pages/NoteKeeperPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import RequireAuthReady from "../utils/RequireAuthReady";
import PageLoader from "../components/common/PageLoader";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import NoteKeeperUI from "../components/notes/NoteKeeperUI";
import NoteFormUI from "../components/notes/NoteFormUI";
import NoteViewModal from "../components/notes/NoteViewModal";
import {
  getNotes as apiGetNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  getNotesApiError,
} from "../api/noteKeeperApi";
import { toast } from "sonner";
import { useConfirm } from "../components/ui/useConfirm.jsx";

function NoteKeeperPageInner() {
  const confirm = useConfirm();

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formError, setFormError] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetNotes();
      setNotes(data.notes || []);
      setSubjects(data.subjects || []);
    } catch (e) {
      toast.error(getNotesApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs only after auth is ready
  useEffect(() => {
    load();
  }, [load]);

  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(Number(s.id), s.name));
    return map;
  }, [subjects]);

  const enrichNote = (note) => {
    if (!note) return note;
    if (!note.subject_name && note.subject_id) {
      return { ...note, subject_name: subjectsMap.get(Number(note.subject_id)) || null };
    }
    return note;
  };

  const filteredNotes = useMemo(() => {
    let filtered = [...notes];
    if (selectedSubject !== "All") {
      const subjectId = Number(selectedSubject);
      filtered = filtered.filter((n) => Number(n.subject_id) === subjectId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [notes, selectedSubject, searchQuery]);

  // View modal
  const openViewModal = (note) => {
    const enriched = enrichNote(note);
    setViewingNote(enriched);
    setViewModalOpen(true);
  };
  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingNote(null);
  };

  // Form modal
  const openAddModal = () => {
    setFormMode("add");
    setEditingNote(null);
    setFormError("");
    setFormModalOpen(true);
  };
  const openEditModal = (note) => {
    setFormMode("edit");
    setEditingNote(note);
    setFormError("");
    setFormModalOpen(true);
  };
  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingNote(null);
    setFormError("");
  };

  // CRUD handlers with toasts
  const handleCreate = async (values, { setSaving }) => {
    setFormError("");
    setSaving(true);
    try {
      const created = await apiCreateNote(values);
      const enriched = enrichNote(created);
      setNotes((prev) => [enriched, ...prev]);
      closeFormModal();
      toast.success("Note created");
    } catch (e) {
      const msg = getNotesApiError(e);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values, { setSaving }) => {
    if (!editingNote) return;
    setFormError("");
    setSaving(true);
    try {
      const updated = await apiUpdateNote(editingNote.id, values);
      const enriched = enrichNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? enriched : n)));
      closeFormModal();
      if (viewingNote && viewingNote.id === editingNote.id) setViewingNote(enriched);
      toast.success("Note updated");
    } catch (e) {
      const msg = getNotesApiError(e);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Use confirm dialog instead of native confirm
  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete this note?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });
    if (!ok) return;

    try {
      await apiDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (viewingNote && viewingNote.id === id) closeViewModal();
      toast.success("Note deleted");
    } catch (e) {
      toast.error(getNotesApiError(e));
    }
  };

  const formInitialValues = useMemo(() => {
    if (!editingNote) {
      return { title: "", content: "", subject_id: subjects[0]?.id || "" };
    }
    return {
      title: editingNote.title,
      content: editingNote.content,
      subject_id: editingNote.subject_id,
    };
  }, [editingNote, subjects]);

  const handleFormSubmit = async (values, helpers) => {
    if (formMode === "add") await handleCreate(values, helpers);
    else await handleUpdate(values, helpers);
  };

  // From edit modal, jump to view modal
  const handleViewRequestFromEdit = () => {
    if (!editingNote) return;
    const enriched = enrichNote(editingNote);
    closeFormModal();
    setTimeout(() => openViewModal(enriched), 0);
  };

  // NEW: update page-level subjects immediately when a subject is added in the form
  const handleSubjectAddedAtPage = (s) => {
    setSubjects((prev) => {
      const exists = prev.some((p) => Number(p.id) === Number(s.id));
      return exists ? prev : [...prev, s];
    });
  };

  // Page-level loading UI
  if (loading) {
    return <PageLoader label="Loading your notes…" />;
  }

  return (
    <RequireAuthReady>
      <FocusAlarmWatcher />

      <NoteKeeperUI
        loading={loading}
        error=""
        notes={filteredNotes}
        subjects={subjects}
        selectedSubject={selectedSubject}
        searchQuery={searchQuery}
        onSubjectSelect={setSelectedSubject}
        onSearchChange={setSearchQuery}
        onAddClick={openAddModal}
        onViewClick={openViewModal}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
      />

      <NoteFormUI
        open={formModalOpen}
        mode={formMode}
        subjects={subjects}
        initialValues={formInitialValues}
        errorText={formError}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        onViewRequest={handleViewRequestFromEdit}
        // NEW: so page-level filters/stacks show the new subject immediately
        onSubjectAdded={handleSubjectAddedAtPage}
      />

      <NoteViewModal
        open={viewModalOpen}
        note={viewingNote}
        onClose={closeViewModal}
        onEdit={() => {
          closeViewModal();
          openEditModal(viewingNote);
        }}
        onDelete={() => viewingNote && handleDelete(viewingNote.id)}
      />
    </RequireAuthReady>
  );
}

export default function NoteKeeperPage() {
  return <NoteKeeperPageInner />;
}