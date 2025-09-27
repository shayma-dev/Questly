// src/pages/StudyPlannerPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import RequireAuthReady from "../utils/RequireAuthReady";
import PageLoader from "../components/common/PageLoader";
import StudyPlannerUI from "../components/planner/StudyPlannerUI";
import SessionFormUI from "../components/planner/SessionFormUI";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import { useConfirm } from "../components/ui/useConfirm.jsx";
import { toast } from "sonner";
import {
  getPlanner as apiGetPlanner,
  createSession as apiCreateSession,
  updateSession as apiUpdateSession,
  deleteSession as apiDeleteSession,
  PLANNER_DAYS,
} from "../api/plannerApi";

function normalizeError(e) {
  return e?.response?.data?.error || e?.message || "Something went wrong";
}

function getTodayToken() {
  const map = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayToken = map[new Date().getDay()];
  return PLANNER_DAYS.includes(todayToken) ? todayToken : "Mon";
}

function toHHMM(t) {
  if (!t) return "";
  const [hh = "00", mm = "00"] = String(t).split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}
function minutesFromTime(t) {
  if (!t) return 0;
  const [hh = "0", mm = "0"] = String(t).split(":");
  return Number(hh) * 60 + Number(mm);
}
function sortSessions(list) {
  const arr = [...(list || [])];
  arr.sort((a, b) => {
    const sa = minutesFromTime(a.start_time);
    const sb = minutesFromTime(b.start_time);
    if (sa !== sb) return sa - sb;
    return minutesFromTime(a.end_time) - minutesFromTime(b.end_time);
  });
  return arr;
}
function ensureAllDays(obj) {
  const base = {};
  PLANNER_DAYS.forEach((d) => (base[d] = []));
  return { ...base, ...(obj || {}) };
}

function StudyPlannerPageInner() {
  const confirm = useConfirm();

  const [sessionsByDay, setSessionsByDay] = useState(ensureAllDays({}));
  const [subjects, setSubjects] = useState([]);

  // Page-level UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal/UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formError, setFormError] = useState("");
  const [editingSession, setEditingSession] = useState(null);

  const [selectedDay, setSelectedDay] = useState(getTodayToken());

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGetPlanner();
      setSessionsByDay(ensureAllDays(data.sessionsByDay));
      setSubjects(data.subjects || []);
    } catch (e) {
      const msg = normalizeError(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sessionsForDay = useMemo(() => {
    const list = sessionsByDay[selectedDay] || [];
    return sortSessions(list);
  }, [sessionsByDay, selectedDay]);

  const openAddModal = () => {
    setModalMode("add");
    setEditingSession(null);
    setFormError("");
    setModalOpen(true);
  };
  const openEditModal = (session) => {
    setModalMode("edit");
    setEditingSession(session);
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingSession(null);
    setFormError("");
  };

  const handleCreate = async (values, { setSaving }) => {
    setFormError("");
    setSaving(true);
    try {
      const created = await apiCreateSession(values);
      const day = created.day;
      setSessionsByDay((prev) => {
        const next = ensureAllDays(prev);
        const updated = [...(next[day] || []), created];
        next[day] = sortSessions(updated);
        return { ...next };
      });
      toast.success("Session added");
      closeModal();
    } catch (e) {
      const msg = normalizeError(e);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values, { setSaving }) => {
    if (!editingSession) return;
    setFormError("");
    setSaving(true);
    try {
      const updated = await apiUpdateSession(editingSession.id, values);
      const oldDay = editingSession.day;
      const newDay = updated.day;

      setSessionsByDay((prev) => {
        const next = ensureAllDays(prev);
        next[oldDay] = (next[oldDay] || []).filter((s) => s.id !== editingSession.id);
        next[newDay] = sortSessions([...(next[newDay] || []), updated]);
        return { ...next };
      });

      toast.success("Session updated");
      closeModal();
    } catch (e) {
      const msg = normalizeError(e);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete session?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;

    setError("");
    try {
      await apiDeleteSession(id);
      setSessionsByDay((prev) => {
        const next = ensureAllDays(prev);
        PLANNER_DAYS.forEach((d) => {
          next[d] = (next[d] || []).filter((s) => s.id !== id);
        });
        return { ...next };
      });
      toast.success("Session deleted");
    } catch (e) {
      const msg = normalizeError(e);
      setError(msg);
      toast.error(msg);
    }
  };

  const modalInitial = useMemo(() => {
    if (!editingSession) {
      return {
        day: selectedDay,
        subject_id: subjects[0]?.id || "",
        start_time: "",
        end_time: "",
      };
    }
    return {
      day: editingSession.day,
      subject_id: editingSession.subject_id,
      start_time: toHHMM(editingSession.start_time),
      end_time: toHHMM(editingSession.end_time),
    };
  }, [editingSession, selectedDay, subjects]);

  const handleSubmitForm = async (values, helpers) => {
    if (modalMode === "add") await handleCreate(values, helpers);
    else await handleUpdate(values, helpers);
  };

  // NEW: bubble up subject added from the modal to page-level subjects
  const handleSubjectAddedAtPage = (subject) => {
    setSubjects((prev) => {
      const exists = prev.some((p) => Number(p.id) === Number(subject.id));
      return exists ? prev : [...prev, subject];
    });
  };

  if (loading) {
    return <PageLoader label="Loading your study planner…" />;
  }

  return (
    <RequireAuthReady>
      <FocusAlarmWatcher />

      <StudyPlannerUI
        loading={loading}
        error={error}
        days={PLANNER_DAYS}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        sessions={sessionsForDay}
        subjects={subjects}
        onAddClick={openAddModal}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
      />

      <SessionFormUI
        open={modalOpen}
        mode={modalMode}
        days={PLANNER_DAYS}
        subjects={subjects}
        initialValues={modalInitial}
        errorText={formError}
        onClose={closeModal}
        onSubmit={handleSubmitForm}
        onSubjectAdded={handleSubjectAddedAtPage} // pass updater
      />
    </RequireAuthReady>
  );
}

export default function StudyPlannerPage() {
  return <StudyPlannerPageInner />;
}