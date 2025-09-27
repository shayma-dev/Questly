// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Shell
import RequireAuthReady from "../utils/RequireAuthReady";
import PageLoader from "../components/common/PageLoader";

// APIs
import { getProfile } from "../api/profileApi";
import { getTasks, toggleTask } from "../api/tasksApi";
import { getPlanner } from "../api/plannerApi";
import {
  getFocusSummary,
  getFocusLast7,
  normalizeFocusSummary,
} from "../api/focusApi";

// Utils
import { subjectColor, subjectStyle } from "../utils/subjectColor";
import { celebrateFullScreen } from "../utils/celebrate";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";

// UI
import AddSubjectButton from "../components/common/AddSubjectButton.jsx";

/* =========================
   Helpers and Motion
   ========================= */
const pageAnim = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.05, duration: 0.3 },
  }),
};

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function parseISO(v) {
  return new Date(v);
}
function isToday(d) {
  return startOfDay(parseISO(d)).getTime() === startOfDay().getTime();
}
function isOverdue(d) {
  return startOfDay(parseISO(d)) < startOfDay();
}
function toMsg(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}
function computeTodaySessions(sessionsByDay) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const todayName = days[now.getDay()];
  const today = sessionsByDay?.[todayName] || [];
  return today
    .map((s) => {
      const [sh, sm] = (s.start_time || "00:00:00").split(":").map(Number);
      const [eh, em] = (s.end_time || "00:00:00").split(":").map(Number);
      const start = new Date(now);
      start.setHours(sh || 0, sm || 0, 0, 0);
      const end = new Date(now);
      end.setHours(eh || 0, em || 0, 0, 0);
      return { ...s, start, end };
    })
    .sort((a, b) => a.start - b.start);
}

/* ===== Color blending helpers (from Focus page reference) ===== */
function blendHex(hex1, hex2, t = 0.22) {
  const toRGB = (h) => {
    const hh = h.replace("#", "");
    const s = hh.length === 3 ? hh.replace(/(.)/g, "$1$1") : hh;
    const n = parseInt(s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const toHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  try {
    const a = toRGB(hex1);
    const b = toRGB(hex2);
    const r = a.map((v, i) => v * (1 - t) + b[i] * t);
    return toHex(r[0], r[1], r[2]);
  } catch {
    return hex1;
  }
}
function donutColorFromPalette(palette) {
  // Slightly darkened pastel: 22% text mixed into bg to match Focus donut style
  return blendHex(palette.bg, palette.text, 0.22);
}

/* ===== Small UI primitives ===== */
function InlineButton({
  children,
  onClick,
  variant = "secondary",
  className = "",
}) {
  const base =
    "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      : "bg-transparent border border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/10";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
function StatTile({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3">
      <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      <div
        className="mt-1 text-2xl font-extrabold"
        style={{ color: accent || "inherit" }}
      >
        {value}
      </div>
    </div>
  );
}
function SubjectDot({ subjectId }) {
  const sty = subjectStyle(subjectId);
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-sm align-middle"
      style={{ background: sty.color, border: `1px solid ${sty.border}` }}
    />
  );
}

/* =========================
   Main Component
   ========================= */
function DashboardInner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [planner, setPlanner] = useState(null);
  const [focus, setFocus] = useState(normalizeFocusSummary());
  const [last7, setLast7] = useState([]); // [{ date: 'YYYY-MM-DD', minutes: number }] oldest -> newest

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        setLoading(true);
        const [p, t, pl, fs, l7] = await Promise.all([
          getProfile(),
          getTasks(),
          getPlanner(),
          getFocusSummary({}),
          getFocusLast7({}), // NEW: weekly data for chart
        ]);
        if (cancel) return;
        setUser(p?.user || null);
        setSubjects(p?.subjects || []);
        setTasks(t?.tasks || []);
        setPlanner(pl || null);
        setFocus(normalizeFocusSummary(fs));
        setLast7(Array.isArray(l7?.days) ? l7.days : []);
      } catch (e) {
        if (!cancel) toast.error(toMsg(e, "Failed to load dashboard"));
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  /* ===== Derived Data ===== */
  const todayTasks = useMemo(() => {
    const filtered = (tasks || []).filter(
      (t) =>
        !t.is_completed &&
        t.due_date &&
        (isToday(t.due_date) || isOverdue(t.due_date))
    );
    filtered.sort((a, b) => parseISO(a.due_date) - parseISO(b.due_date));
    return filtered.slice(0, 6);
  }, [tasks]);

  const todayPlan = useMemo(
    () => computeTodaySessions(planner?.sessionsByDay || {}),
    [planner]
  );


  // Use backend last7 strictly; map to localized short day labels
  const focusWeekSeries = useMemo(() => {
    if (!Array.isArray(last7) || last7.length === 0) return [];
    return last7.map((row) => {
      const d = new Date(row.date + "T00:00:00");
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }), // Sun..Sat
        minutes: Number(row.minutes) || 0,
      };
    });
  }, [last7]);

  // Focus by Subject donut colors using slightly darkened pastel
  const focusBySubject = useMemo(() => {
    const data = (focus.totalFocus || [])
      .map((r) => {
        const subj = subjects.find((s) => s.name === r.subject_name);
        const pal = subjectColor(subj?.id ?? r.subject_name); // fallback to name for pseudo-id
        return {
          name: r.subject_name,
          value: Number(r.total_focus) || 0,
          fill: donutColorFromPalette(pal),
          border: pal.border,
        };
      })
      .filter((d) => d.value > 0);
    return data.length
      ? data
      : [
          {
            name: "No focus yet",
            value: 1,
            fill: "#e5e7eb",
            border: "#e5e7eb",
          },
        ];
  }, [focus.totalFocus, subjects]);

  // Subjects overview, show only name and total focus minutes
  const subjectOverview = useMemo(() => {
    return (subjects || []).map((s) => {
      const focusMin =
        (focus.totalFocus || []).find((f) => f.subject_name === s.name)
          ?.total_focus || 0;
      return { subject: s, focusMin: Number(focusMin) || 0 };
    });
  }, [subjects, focus.totalFocus]);

  /* ===== Actions ===== */
  const toggleTaskDone = async (id, title) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t
      )
    );
    try {
      const updated = await toggleTask(id);
      const completed = updated?.is_completed ?? true;
      if (completed) {
        celebrateFullScreen();
        toast.success(`Completed: ${title}`, { duration: 2400 });
      }
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_completed: !t.is_completed } : t
        )
      );
      toast.error(toMsg(e, "Failed to toggle task"));
    }
  };

  /* ===== Render ===== */
  if (loading) return <PageLoader label="Loading your dashboard…" />;

  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <FocusAlarmWatcher />
      <RequireAuthReady>
        <AnimatePresence mode="wait">
          <motion.div
            key="db"
            variants={pageAnim}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mx-auto max-w-6xl lg:max-w-7xl px-4 md:px-6 py-6 md:py-8"
          >
            {/* Hero */}
            <motion.header variants={item} custom={0} className="mb-6 md:mb-8">
              <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(800px 300px at 80% -20%, rgba(222,99,138,0.12), transparent 60%), radial-gradient(700px 280px at 20% 120%, rgba(198,186,222,0.12), transparent 62%)",
                  }}
                />
                <div className="relative px-5 py-5 md:px-7 md:py-6 flex items-center justify-between">
                  <div>
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      Welcome back{user?.username ? `, ${user.username}` : ""}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">
                      {dateStr}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <InlineButton
                      variant="primary"
                      onClick={() => navigate("/focus")}
                    >
                      Start Focus
                    </InlineButton>
                    <InlineButton onClick={() => navigate("/tasks")}>
                      Add Task
                    </InlineButton>
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Stats Row */}
            <motion.section
              variants={item}
              custom={0.2}
              className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <StatTile
                label="Focus Today"
                value={`${focus.todayTotal || 0} min`}
                accent="#DE638A"
              />
              <StatTile
                label="Sessions Today"
                value={todayPlan.length}
                accent="#7C3AED"
              />
              <StatTile
                label="Tasks Due"
                value={todayTasks.length}
                accent="#2563EB"
              />
            </motion.section>

            {/* Charts Row */}
            <motion.section
              variants={item}
              custom={0.4}
              className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Weekly focus area chart */}
              <div className="lg:col-span-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">
                    Daily Focus (This Week)
                  </div>
                  <InlineButton onClick={() => navigate("/focus")}>
                    Open Focus
                  </InlineButton>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={focusWeekSeries}
                      margin={{ top: 6, right: 12, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="focusGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#DE638A"
                            stopOpacity={0.55}
                          />
                          <stop
                            offset="100%"
                            stopColor="#DE638A"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="rgba(0,0,0,0.06)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 12 }}
                        formatter={(v) => [`${v} min`, "Focus"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="#DE638A"
                        strokeWidth={2}
                        fill="url(#focusGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Focus by subject donut */}
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Focus by Subject</div>
                  <InlineButton onClick={() => navigate("/focus")}>
                    Open Focus
                  </InlineButton>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{ fontSize: 12 }}
                        formatter={(v, n) => [`${v} min`, n]}
                      />
                      <Pie
                        data={focusBySubject}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={64}
                        paddingAngle={3}
                      >
                        {focusBySubject.map((entry, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={entry.fill}
                            stroke={entry.border}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {focusBySubject.slice(0, 6).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{
                          background: s.fill,
                          border: `1px solid ${s.border}`,
                        }}
                      />
                      <span className="truncate">{s.name}</span>
                      <span className="ml-auto text-[rgb(var(--muted))]">
                        {s.value}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Main content: Tasks + Today’s Plan */}
            <motion.section
              variants={item}
              custom={0.6}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Today’s Tasks */}
              <div className="lg:col-span-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Today’s Tasks</div>
                  <InlineButton onClick={() => navigate("/tasks")}>
                    View all
                  </InlineButton>
                </div>
                {todayTasks.length === 0 ? (
                  <div className="text-sm text-[rgb(var(--muted))]">
                    No tasks due today — nice work.
                  </div>
                ) : (
                  <div className="divide-y divide-[rgb(var(--border))]">
                    {todayTasks.map((t) => {
                      const sty = subjectStyle(t.subject_id);
                      const due = isOverdue(t.due_date)
                        ? {
                            label: "Overdue",
                            cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
                          }
                        : isToday(t.due_date)
                          ? {
                              label: "Today",
                              cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
                            }
                          : {
                              label: t.due_date,
                              cls: "bg-black/5 dark:bg-white/10",
                            };
                      return (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 py-3"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-black dark:accent-white"
                            checked={!!t.is_completed}
                            onChange={() => toggleTaskDone(t.id, t.title)}
                          />
                          <div className="min-w-0">
                            <div
                              className={`text-sm ${t.is_completed ? "line-through opacity-60" : ""}`}
                            >
                              {t.title}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              {t.subject_name && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border px-2 py-[2px]"
                                  style={sty}
                                >
                                  <SubjectDot subjectId={t.subject_id} />{" "}
                                  {t.subject_name}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-[2px] ${due.cls}`}
                              >
                                {due.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Today’s Plan */}
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Today’s Plan</div>
                  <InlineButton onClick={() => navigate("/study")}>
                    Open planner
                  </InlineButton>
                </div>
                {todayPlan.length === 0 ? (
                  <div className="text-sm text-[rgb(var(--muted))]">
                    No sessions planned today.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {todayPlan.map((s, i) => {
                      const sty = subjectStyle(s.subject_id);
                      return (
                        <div
                          key={`${s.id}-${i}`}
                          className="flex items-center justify-between rounded-xl border px-3 py-2"
                          style={{
                            borderColor: sty.border,
                            background: "rgba(0,0,0,0.02)",
                          }}
                        >
                          <div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: sty.color }}
                            >
                              {s.subject || "Session"}
                            </div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              {new Intl.DateTimeFormat(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(s.start)}{" "}
                              –{" "}
                              {new Intl.DateTimeFormat(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(s.end)}
                            </div>
                          </div>
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-[2px]"
                            style={sty}
                          >
                            <SubjectDot subjectId={s.subject_id} /> Today
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.section>

            {/* Subjects Overview only (no notes) */}
            <motion.section variants={item} custom={0.8} className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Subjects Overview</div>
                <div className="flex items-center gap-2">
                  <InlineButton onClick={() => navigate("/focus")}>
                    Open Focus
                  </InlineButton>
                  <AddSubjectButton
                    onAdded={(s) => {
                      setSubjects((prev) =>
                        prev.some((x) => Number(x.id) === Number(s.id))
                          ? prev
                          : [...prev, s]
                      );
                    }}
                  />
                </div>
              </div>
              {subjectOverview.length === 0 ? (
                <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-6 text-sm text-[rgb(var(--muted))]">
                  No subjects yet — add your first subject to organize studies.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subjectOverview.map(({ subject, focusMin }) => {
                    const sty = subjectStyle(subject.id);
                    return (
                      <div
                        key={subject.id}
                        className="rounded-2xl border px-3 py-3"
                        style={{
                          borderColor: sty.border,
                          background: "rgba(0,0,0,0.02)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="font-semibold text-sm"
                            style={{ color: sty.color }}
                          >
                            {subject.name}
                          </div>
                          <SubjectDot subjectId={subject.id} />
                        </div>
                        <div className="mt-2 text-xs flex items-center justify-between">
                          <span className="opacity-70">Focus</span>
                          <span
                            className="font-semibold"
                            style={{ color: sty.color }}
                          >
                            {Number(focusMin || 0)}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </motion.div>
        </AnimatePresence>
      </RequireAuthReady>
    </>
  );
}

export default function DashboardPage() {
  return <DashboardInner />;
}
