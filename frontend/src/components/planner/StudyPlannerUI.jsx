/* eslint-disable no-unused-vars */
// ==============================
// src/components/planner/StudyPlannerUI.jsx
// Subtle banner + slightly larger, thinner progress ring
// + Smooth day/session transitions using Motion helpers
// ==============================
import React, { useMemo } from "react";
import Card, { CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { IconEdit, IconTrash } from "../icons/Icons";
import { subjectColor, subjectStyle } from "../../utils/subjectColor";

// Motion helpers
import { motion, AnimatePresence } from "framer-motion";
import { StaggerList, StaggerItem } from "../motion/StaggerList";

/* ---------- utils ---------- */
function toHHMM(t) {
  if (!t) return "";
  const [hh = "00", mm = "00"] = String(t).split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}
function format12h(t) {
  const [hhStr = "0", mmStr = "00"] = toHHMM(t).split(":");
  let h = Number(hhStr);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mmStr} ${suffix}`;
}
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAILY_GOAL_MIN = 180; // 3 hours

function minutesFor(sessions = []) {
  let minutes = 0;
  for (const s of sessions) {
    const [sh, sm] = toHHMM(s.start_time).split(":").map(Number);
    const [eh, em] = toHHMM(s.end_time).split(":").map(Number);
    minutes += Math.max(0, eh * 60 + em - (sh * 60 + sm));
  }
  return minutes;
}
function progressForDay(sessions = []) {
  const minutes = minutesFor(sessions);
  const pctRaw = Math.round((minutes / DAILY_GOAL_MIN) * 100);
  const pct = Math.max(0, Math.min(100, pctRaw));
  return { minutes, pct };
}
function groupByDay(sessions = []) {
  const m = {};
  for (const s of sessions) {
    const d = s.day || s.weekday || "";
    (m[d] ||= []).push(s);
  }
  return m;
}

/* ---------- motion variants ---------- */
const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const daySwap = {
  initial: { opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.995 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: reduced ? 0 : -6, scale: 1, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

const listItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
};

export default function StudyPlannerUI({
  loading = false,
  error = "",
  days = [],
  selectedDay = "Mon",
  sessions = [],
  subjects = [],
  onSelectDay = () => {},
  onAddClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
}) {
  const subjectsMap = useMemo(() => {
    const m = new Map();
    (subjects || []).forEach((s) => m.set(Number(s.id), s.name));
    return m;
  }, [subjects]);

  const todayLabel = DAY_LABELS[new Date().getDay()];
  const grouped = useMemo(() => groupByDay(sessions), [sessions]);
  const daySessions = grouped[selectedDay] || [];
  const { minutes, pct } = progressForDay(daySessions);

  // Ring geometry for size=60, stroke=7
  const R = 22;
  const SIZE = 60;
  const STROKE = 7;
  const CIRC = 2 * Math.PI * R;
  const dash = (Math.min(100, pct) / 100) * CIRC;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-[rgb(var(--fg))]">
      {/* Banner Header */}
      <div className="banner-card">
        <div className="banner-content flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Progress Ring — bigger diameter, thinner stroke */}
            <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke="var(--ring-track)"
                  strokeWidth={STROKE}
                />
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  stroke="var(--progress-color)"
                  strokeDasharray={`${dash} ${CIRC}`}
                  className="transition-[stroke-dasharray] duration-700"
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              </svg>
              <span className="pointer-events-none absolute text-[11px] font-semibold tabular-nums">
                {Math.min(100, pct)}%
              </span>
            </div>
            <div>
              <h1 className="banner-title">Study Planner</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Focus time today: <strong>{minutes} min</strong> -  {pct >= 100 ? "Goal reached 🎉" : `goal: ${DAILY_GOAL_MIN} min`}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Calm focus. One good session at a time.
              </p>
            </div>
          </div>
          <Button onClick={onAddClick} aria-label="Add Session" variant="primary">
            Add Session
          </Button>
        </div>
      </div>

      {/* Week pills */}
      <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">This week</div>
        </div>

        <div className="px-3 pb-3 pt-2">
          <div className="flex gap-2 overflow-x-auto">
            {days.map((d) => {
              const active = d === selectedDay;
              const isToday = d === todayLabel;

              const base =
                "relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2";
              const defaultChip =
                "border bg-[rgb(var(--day-pill-bg))] border-[rgb(var(--day-pill-border))] text-[rgb(var(--day-pill-fg))] hover:bg-[rgb(var(--day-pill-hover))]";
              const selectedChip =
                "border text-[var(--pill-selected-fg)] bg-[var(--pill-selected-bg)] border-[var(--pill-selected-bg)] shadow-[var(--pill-selected-shadow)]";
              const todayHalo =
                "border bg-[var(--pill-today-bg)] border-[var(--pill-today-border)] shadow-[var(--pill-today-glow)]";

              return (
                <button
                  key={d}
                  onClick={() => onSelectDay(d)}
                  className={[base, active ? selectedChip : isToday ? todayHalo : defaultChip].join(" ")}
                >
                  <span className={active ? "font-semibold" : ""}>{d}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact stats */}
        <div className="flex items-center gap-4 border-t border-[rgb(var(--border))] px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {selectedDay}:{" "}
            <strong className="text-[rgb(var(--fg))]">{daySessions.length}</strong> session
            {daySessions.length === 1 ? "" : "s"}
          </span>
          <span className="hidden sm:inline">~{minutes} min today • goal {DAILY_GOAL_MIN} min</span>
        </div>
      </div>

      {/* Error / Loading */}
      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      {loading && <p className="mt-3 text-gray-600 dark:text-gray-300">Loading…</p>}

      {/* Sessions */}
      {!loading && (
        <section className="mt-4">
          <Card>
            <CardHeader
              title={`Sessions for ${selectedDay}`}
              subtitle={daySessions.length === 0 ? "No sessions yet. Add one to get rolling." : "Keep the rhythm."}
              right={
                <Button onClick={onAddClick} size="sm" variant="primary">
                  Add
                </Button>
              }
            />
            <CardBody>
              {/* Animate day switch: content fades/slides when selectedDay changes */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay}
                  variants={daySwap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {daySessions.length === 0 ? (
                    <EmptyState onAddClick={onAddClick} />
                  ) : (
                    <div className="relative">
                      <div className="absolute left-3 top-0 h-full w-px bg-black/10 dark:bg-white/15" />
                      {/* Staggered list reveal for sessions */}
                      <StaggerList className="space-y-2">
                        {daySessions.map((s) => {
                          const subjectName =
                            s.subject || subjectsMap.get(Number(s.subject_id)) || "Session";
                          const color = subjectColor(s.subject_id ?? s.subject ?? 0);

                          return (
                            <StaggerItem key={s.id}>
                              <motion.li
                                layout
                                variants={listItem}
                                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 transition-colors hover:bg-[var(--bg-soft-d)]/40 dark:hover:bg-[rgb(var(--bg-soft-c))]/25"
                              >
                                <span
                                  className="absolute left-[9px] top-1/2 -translate-y-1/2 size-2 rounded-full ring-2 ring-white dark:ring-[#1e1f33]"
                                  style={{ backgroundColor: color.text }}
                                />
                                <div className="ml-4 min-w-28 text-sm font-semibold tabular-nums">
                                  {format12h(s.start_time)} — {format12h(s.end_time)}
                                </div>
                                <div className="min-w-0">
                                  <span
                                    className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs font-medium"
                                    style={subjectStyle(s.subject_id ?? s.subject ?? 0)}
                                  >
                                    {subjectName}
                                  </span>
                                  {s.notes && (
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                                      {s.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => onEditClick(s)}
                                    aria-label="Edit session"
                                    className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-2 py-1 hover:bg-[var(--bg-soft-c)]/60 dark:hover:bg-gray-800"
                                  >
                                    <IconEdit />
                                  </button>
                                  <button
                                    onClick={() => onDeleteClick(s.id)}
                                    aria-label="Delete session"
                                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  >
                                    <IconTrash />
                                  </button>
                                </div>
                              </motion.li>
                            </StaggerItem>
                          );
                        })}
                      </StaggerList>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  );
}

function EmptyState({ onAddClick }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[rgb(var(--border))] bg-[var(--bg-soft-b)]/60 p-6 text-center dark:bg-white/5">
      <div className="text-sm font-medium">Start with one short session</div>
      <p className="text-xs text-gray-600 dark:text-gray-300">25 minutes is enough to build momentum.</p>
      <div className="mt-1">
        <Button onClick={onAddClick} size="md" variant="primary">
          Add a session
        </Button>
      </div>
    </div>
  );
}