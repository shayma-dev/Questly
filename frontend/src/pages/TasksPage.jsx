// ==============================
// src/pages/TasksPage.jsx
// Container: data fetching, filters, CRUD, optimistic updates
// ==============================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppNav from "../components/common/AppNav";
import TasksPageUI from "../components/tasks/TasksPageUI";
import TaskFormUI from "../components/tasks/TaskFormUI";
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  toggleTask as apiToggleTask,
} from "../api/tasksApi";

function normalizeError(e) {
  return e?.response?.data?.error || e?.message || "Something went wrong";
}

// Date helpers (local timezone)
function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function diffInDays(a, b) {
  // a - b (both at midnight) in days
  const ms = startOfDay(a) - startOfDay(b);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
function isWithinNext7Days(date) {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const days = diffInDays(target, today);
  return days >= 0 && days <= 6;
}
function parseISO(value) {
  // Accept ISO or YYYY-MM-DD; always return Date
  return new Date(value);
}
function dateInputValue(value) {
  // Return YYYY-MM-DD for <input type="date">
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TasksPage() {
  // Data
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [timeFilter, setTimeFilter] = useState("all"); // "all" | "today" | "week"
  const [subjectFilter, setSubjectFilter] = useState(null); // subject_id or null

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingTask, setEditingTask] = useState(null);

  // Load tasks+subjects
  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGetTasks();
      setTasks(data.tasks || []);
      setSubjects(data.subjects || []);
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived, filtered and sorted list
  const visibleTasks = useMemo(() => {
    const today = startOfDay(new Date());

    const filtered = (tasks || []).filter((t) => {
      const due = parseISO(t.due_date);

      // time filter
      if (timeFilter === "today") {
        if (diffInDays(due, today) !== 0) return false;
      } else if (timeFilter === "week") {
        if (!isWithinNext7Days(due)) return false;
      }

      // subject filter
      if (subjectFilter && Number(subjectFilter) !== Number(t.subject_id)) {
        return false;
      }

      return true;
    });

    // sort: incomplete first, then earlier due_date
    filtered.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      const da = parseISO(a.due_date);
      const db = parseISO(b.due_date);
      return da - db;
    });

    return filtered;
  }, [tasks, timeFilter, subjectFilter]);

  // Open modals
  const openAddModal = () => {
    setModalMode("add");
    setEditingTask(null);
    setModalOpen(true);
  };
  const openEditModal = (task) => {
    setModalMode("edit");
    setEditingTask(task);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  // Create / Update
  const handleSubmitForm = async (values) => {
    // values: { title, description, subject_id, due_date(YYYY-MM-DD) }
    setSaving(true);
    setError("");
    try {
      if (modalMode === "add") {
        const created = await apiCreateTask(values);
        const subjectName =
          created.subject_name ||
          subjects.find((s) => Number(s.id) === Number(values.subject_id))
            ?.name ||
          "";
        const newTask = {
          ...created,
          subject_name: subjectName,
        };
        setTasks((prev) => [newTask, ...prev]);
      } else if (modalMode === "edit" && editingTask) {
        await apiUpdateTask(editingTask.id, values);
        const subjectName =
          subjects.find((s) => Number(s.id) === Number(values.subject_id))
            ?.name ||
          editingTask.subject_name ||
          "";
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? {
                  ...t,
                  title: values.title,
                  description: values.description,
                  due_date: values.due_date, // keep as YYYY-MM-DD; parser supports it
                  subject_id: values.subject_id,
                  subject_name: subjectName,
                }
              : t
          )
        );
      }
      closeModal();
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDeleteTask = async (id) => {
    const ok = window.confirm("Delete this task? This cannot be undone.");
    if (!ok) return;
    setError("");
    try {
      await apiDeleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(normalizeError(e));
    }
  };

  // Toggle complete (optimistic)
  const handleToggleTask = async (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t
      )
    );
    try {
      await apiToggleTask(id);
    } catch (e) {
      // revert on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_completed: !t.is_completed } : t
        )
      );
      setError(normalizeError(e));
    }
  };

  // Initial values for edit
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

  return (
    <>
      <AppNav />

      {/* Main UI component */}
      <TasksPageUI
        loading={loading}
        error={error}
        tasks={visibleTasks}
        allSubjects={subjects}
        filters={{ time: timeFilter, subjectId: subjectFilter }}
        onFilterChange={{
          onTimeChange: setTimeFilter,
          onSubjectChange: setSubjectFilter,
        }}
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
      />
    </>
  );
}
