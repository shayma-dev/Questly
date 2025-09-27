// src/pages/TasksPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import RequireAuthReady from "../utils/RequireAuthReady";
import PageLoader from "../components/common/PageLoader";
import TasksPageUI from "../components/tasks/TasksPageUI";
import TaskFormUI from "../components/tasks/TaskFormUI";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  toggleTask as apiToggleTask,
} from "../api/tasksApi";
import { toast } from "sonner";
import { useConfirm } from "../components/ui/useConfirm.jsx";
import { celebrateFullScreen } from "../utils/celebrate";

const completedToastGuard = new Set();

function toMessage(err, fallback = "Something went wrong") {
  return err?.message || err?.response?.data?.error || fallback;
}

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function diffInDays(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / (1000*60*60*24)); }
function isWithinNext7Days(date) { const today = startOfDay(new Date()); const target = startOfDay(date); const days = diffInDays(target, today); return days >= 0 && days <= 6; }
function parseISO(value) { return new Date(value); }
function dateInputValue(value) {
  const d = new Date(value); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function TasksPageInner() {
  const confirm = useConfirm();

  // Data
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState("");

  // Filters
  const [timeFilter, setTimeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGetTasks();
      setTasks(data.tasks || []);
      setSubjects(data.subjects || []);
    } catch (e) {
      const msg = toMessage(e, "Failed to load tasks");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs only after auth is ready due to RequireAuthReady
  useEffect(() => { load(); }, [load]);

  const visibleTasks = useMemo(() => {
    const today = startOfDay(new Date());
    const filtered = (tasks || []).filter((t) => {
      const due = parseISO(t.due_date);
      if (timeFilter === "today" && diffInDays(due, today) !== 0) return false;
      if (timeFilter === "week" && !isWithinNext7Days(due)) return false;
      if (subjectFilter && Number(subjectFilter) !== Number(t.subject_id)) return false;
      return true;
    });
    filtered.sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      return parseISO(a.due_date) - parseISO(b.due_date);
    });
    return filtered;
  }, [tasks, timeFilter, subjectFilter]);

  const openAddModal = () => { setModalMode("add"); setEditingTask(null); setModalOpen(true); };
  const openEditModal = (task) => { setModalMode("edit"); setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleSubmitForm = async (values) => {
    setSaving(true);
    setError("");
    try {
      if (modalMode === "add") {
        const created = await apiCreateTask(values);
        const subjectName =
          created.subject_name ||
          subjects.find((s) => Number(s.id) === Number(values.subject_id))?.name || "";
        const newTask = { ...created, subject_name: subjectName };
        setTasks((prev) => [newTask, ...prev]);
        toast.success("Task added");
      } else if (modalMode === "edit" && editingTask) {
        await apiUpdateTask(editingTask.id, values);
        const subjectName =
          subjects.find((s) => Number(s.id) === Number(values.subject_id))?.name ||
          editingTask.subject_name || "";
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? { ...t, ...values, subject_name: subjectName }
              : t
          )
        );
        toast.success("Task updated");
      }
      closeModal();
    } catch (e) {
      const msg = toMessage(e, "Failed to save task");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id) => {
    const ok = await confirm({
      title: "Delete task?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });
    if (!ok) return;
    setError("");
    try {
      await apiDeleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (e) {
      const msg = toMessage(e, "Failed to delete task");
      setError(msg);
      toast.error(msg);
    }
  };

  const handleToggleTask = async (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t)));
    try {
      await apiToggleTask(id);
      setTasks((prev) => {
        const next = [...prev];
        const task = next.find((t) => t.id === id);
        if (task?.is_completed && !completedToastGuard.has(task.id)) {
          completedToastGuard.add(task.id);
          setTimeout(() => completedToastGuard.delete(task.id), 800);
          celebrateFullScreen();
          toast.success(`Completed: ${task.title}`, { duration: 2400 });
        }
        return next;
      });
    } catch (e) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t)));
      const msg = toMessage(e, "Failed to toggle task");
      setError(msg);
      toast.error(msg);
    }
  };

  const modalInitial = useMemo(() => {
    if (!editingTask) {
      return {
        title: "",
        description: "",
        subject_id: subjects[0]?.id || "",
        due_date: dateInputValue(new Date()),
      };
    }
    return {
      title: editingTask.title || "",
      description: editingTask.description || "",
      subject_id: editingTask.subject_id || subjects[0]?.id || "",
      due_date: dateInputValue(editingTask.due_date),
    };
  }, [editingTask, subjects]);

  // NEW: handle subject added from TaskFormUI to update page-level filters immediately
  const handleSubjectAddedAtPage = useCallback((s) => {
    setSubjects((prev) => {
      const exists = prev.some((p) => Number(p.id) === Number(s.id));
      return exists ? prev : [...prev, s];
    });
  }, []);

  // Page-level loading UI
  if (loading) {
    return <PageLoader label="Loading your tasks…" />;
  }

  return (
    <>
      <FocusAlarmWatcher />
      <TasksPageUI
        loading={loading}
        tasks={visibleTasks}
        allSubjects={subjects}
        filters={{ time: timeFilter, subjectId: subjectFilter }}
        onFilterChange={{ onTimeChange: setTimeFilter, onSubjectChange: setSubjectFilter }}
        onAddClick={openAddModal}
        onEditClick={openEditModal}
        onDeleteClick={handleDeleteTask}
        onToggleClick={handleToggleTask}
      />
      <TaskFormUI
        open={modalOpen}
        mode={modalMode}
        saving={saving}
        subjects={subjects}
        initialValues={modalInitial}
        onClose={closeModal}
        onSubmit={handleSubmitForm}
        // NEW: bubble subject creation up so filters and lists reflect instantly
        onSubjectAdded={handleSubjectAddedAtPage}
      />
    </>
  );
}

// Export wrapped with the centralized auth gate
export default function TasksPage() {
  return (
    <RequireAuthReady>
      <TasksPageInner />
    </RequireAuthReady>
  );
}