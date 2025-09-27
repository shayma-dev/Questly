/* eslint-disable no-unused-vars */
// ==============================
/* src/components/focus/FocusUI.jsx
   Subjects above Timer. Consistent subjectColor across chips, donut, and pills.
   Donut uses slightly darkened pill shade. Smaller time text. No "Focus time" label.
*/
// ==============================
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card, { CardHeader, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import { Input, Label } from "../ui/Input";
import {
  IconSoundOn,
  IconSoundOff,
  IconStart,
  IconPause,
  IconStop,
} from "../icons/Icons";
import { subjectColor } from "../../utils/subjectColor";
import AddSubjectButton from "../common/AddSubjectButton.jsx";

/* ===== Visual tuning knobs ===== */
const RING_SIZE = 360;        // Outer diameter in px
const INNER_SIZE = 290;       // Inner circle size in px
const RING_THICKNESS = 22;    // Visual ring thickness (via mask)
/* Smaller time so it fits nicer inside the inner plate */
const TIME_FONT = "text-5xl sm:text-6xl";
const EASE = [0.2, 0.8, 0.2, 1];

/* Stable pseudo id from a string (only used as fallback) */
function pseudoIdFromName(name) {
  return [...String(name)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

/* Build a quick lookup from visible subjects: name -> id (string compare) */
function buildNameToIdMap(subjects) {
  const map = new Map();
  for (const s of subjects || []) {
    if (!s || s.name == null) continue;
    map.set(String(s.name).trim().toLowerCase(), s.id);
  }
  return map;
}

/* Resolve the color id for a subject name using the live subjects list; fallback to pseudo id */
function idForName(name, nameToIdMap) {
  const key = String(name).trim().toLowerCase();
  if (nameToIdMap.has(key)) return nameToIdMap.get(key);
  return pseudoIdFromName(name);
}

/* Utility: blend two hex colors (returns hex) */
function blendHex(hex1, hex2, t = 0.22) {
  const toRGB = (h) => {
    const hh = h.replace("#", "");
    const n = parseInt(hh.length === 3 ? hh.replace(/(.)/g, "$1$1") : hh, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const toHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
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

/* Donut shade = slightly darkened pill bg by blending in the strong text color */
function donutColorFromPalette(c) {
  // 22% text color gives a tasteful, slightly darker pastel
  return blendHex(c.bg, c.text, 0.22);
}

export default function FocusUI({
  // Data
  subjects = [],
  selectedSubjectId = null,

  // Mode and cycle
  mode = "work",
  cycleConfig = { workMinutes: 25, breakMinutes: 5 },
  targetMinutes = 25,

  // Timer state
  time = { display: "00:00:00", elapsedSeconds: 0, remainingSeconds: 0 },
  isRunning = false,
  isPaused = false,

  // Sound
  soundEnabled = true,

  // Summary
  summary = {
    todayTotalMinutes: 0,
    todaySessionsCount: 0,
    todayBySubject: [],
    allTimePerSubject: [],
    allTimeTotalMinutes: 0,
  },

  // Derived states
  canStart = false,
  ui = { loadingSummary: false, saving: false, errorMessage: null },

  // Callbacks
  onSelectSubject = () => {},
  onChangeMode = () => {},
  onChangeTargetMinutes = () => {},
  onChangeCycleConfig = () => {},
  onStart = () => {},
  onPause = () => {},
  onResume = () => {},
  onStopSave = () => {},
  onReset = () => {},
  onToggleSound = () => {},

  // Extras
  canStopSave = false,
  formatMinutes = (m) => `${m}m`,
  hasSubjects = false,

  // Optional: notify parent when a subject is added from this screen
  onSubjectAdded = null,
}) {
  const [showSettings, setShowSettings] = useState(false);

  // For consistent colors across chips, donut, and pills
  const nameToId = useMemo(() => buildNameToIdMap(subjects), [subjects]);

  // Progress (0..1)
  const progress = useMemo(() => {
    const total = Math.max(1, time.elapsedSeconds + time.remainingSeconds);
    const p = total === 0 ? 0 : time.elapsedSeconds / total;
    return Math.min(1, Math.max(0, p));
  }, [time.elapsedSeconds, time.remainingSeconds]);

  const dialDeg = Math.round(progress * 360);
  const dialColor =
    mode === "work"
      ? "var(--progress-color)"
      : "linear-gradient(135deg, #6EE7B7, #60A5FA)"; // break ring colorful
  const ringTrack = "rgba(148, 163, 184, 0.22)";
  const dialBg =
    typeof dialColor === "string" && dialColor.startsWith("linear")
      ? `${dialColor}`
      : `conic-gradient(${dialColor} ${dialDeg}deg, ${ringTrack} ${dialDeg}deg 360deg)`;

  const sessionLocked = (isRunning || isPaused) && mode === "work";

  // Show "no subjects" only once loaded and truly empty
  const showNoSubjects =
    mode === "work" && !ui.loadingSummary && subjects.length === 0;

  /* ===== Datasets for compact stats (colors from subjectColor via real IDs) ===== */
  const todayTotal = summary.todayTotalMinutes || 0;

  const todayParts = (summary.todayBySubject || [])
    .map((s) => {
      const resolvedId = idForName(s.name, nameToId);
      const palette = subjectColor(resolvedId);
      return {
        name: s.name,
        minutes: s.duration || 0,
        palette,                       // full palette
        donutFill: donutColorFromPalette(palette), // slightly darker pastel for donut
      };
    })
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const allTimeParts = (summary.allTimePerSubject || [])
    .map((s) => {
      const resolvedId = idForName(s.subject_name, nameToId);
      const palette = subjectColor(resolvedId);
      return {
        name: s.subject_name,
        minutes: s.total_focus || 0,
        palette,
      };
    })
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  // Donut segments for "Today"
  const donutSegments = useMemo(() => {
    if (!todayTotal) return [];
    let acc = 0;
    return todayParts.map((p) => {
      const pct = Math.max(0, (p.minutes / todayTotal) * 100);
      const start = acc;
      const end = Math.min(100, acc + pct);
      acc = end;
      return { ...p, start, end };
    });
  }, [todayParts, todayTotal]);

  // Mask ring CSS for thick donut look
  const ringMaskStyle = {
    WebkitMask:
      `radial-gradient(circle at center, transparent calc(${INNER_SIZE / 2}px - ${RING_THICKNESS}px), black calc(${INNER_SIZE / 2}px - ${RING_THICKNESS - 1}px))`,
    mask:
      `radial-gradient(circle at center, transparent calc(${INNER_SIZE / 2}px - ${RING_THICKNESS}px), black calc(${INNER_SIZE / 2}px - ${RING_THICKNESS - 1}px))`,
  };

  // When subject is added via inline CTA or pill-row icon
  const handleSubjectAdded = (s) => {
    // Tell parent page so it merges into global subjects immediately
    if (typeof onSubjectAdded === "function") onSubjectAdded(s);
    // Auto-select if none selected (so Start can be enabled)
    if (selectedSubjectId == null) {
      onSelectSubject?.(s.id);
    }
  };

  /* ===== UI ===== */
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top bar: Title + Actions + Mode */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <motion.h1
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="text-lg font-semibold tracking-tight"
          >
            Focus
          </motion.h1>

          {/* Mode selector */}
          <div className="inline-flex items-center rounded-full border border-[rgb(var(--border))] overflow-hidden ml-3">
            <button
              type="button"
              disabled={isRunning || isPaused}
              onClick={() => onChangeMode("work")}
              className={[
                "px-3 py-1.5 text-sm",
                mode === "work"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-transparent text-[rgb(var(--fg))]",
                isRunning || isPaused
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              Work
            </button>
            <div className="w-px h-6 bg-[rgb(var(--border))]" />
            <button
              type="button"
              disabled={isRunning || isPaused}
              onClick={() => onChangeMode("break")}
              className={[
                "px-3 py-1.5 text-sm",
                mode === "break"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-transparent text-[rgb(var(--fg))]",
                isRunning || isPaused
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              Break
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleSound}
            className="gap-2"
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            title={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? <IconSoundOn /> : <IconSoundOff />}
            <span className="hidden sm:inline">
              {soundEnabled ? "Sound on" : "Sound off"}
            </span>
          </Button>

          {/* Settings toggle */}
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="text-sm underline text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            {showSettings ? "Hide settings" : "Edit defaults"}
          </button>
        </div>
      </div>

      {/* Subjects row ABOVE the timer (no Card) */}
      {mode === "work" ? (
        subjects.length > 0 ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">Subjects</div>
              {/* Inline Add Subject button (form-safe already) */}
              <AddSubjectButton
                size="sm"
                onAdded={handleSubjectAdded}
                className="ml-2"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => {
                const isActive = String(selectedSubjectId) === String(s.id);
                const c = subjectColor(s.id);
                return (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={sessionLocked}
                    onClick={() => onSelectSubject(s.id)}
                    title={
                      sessionLocked
                        ? "Subject locked during a Work session"
                        : s.name
                    }
                    className={[
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      isActive ? "shadow-sm" : "hover:brightness-95",
                      sessionLocked
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer",
                    ].join(" ")}
                    style={{
                      backgroundColor: isActive ? c.bg : "transparent",
                      color: isActive ? c.text : "rgb(var(--fg))",
                      borderColor: isActive ? c.border : "rgb(var(--border))",
                    }}
                  >
                    {s.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : showNoSubjects ? (
          // CTA card when no subjects
          <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <div>No subjects yet. Add one to start a Work session.</div>
            <AddSubjectButton size="sm" onAdded={handleSubjectAdded} />
          </div>
        ) : null
      ) : null}

      {/* Hero Timer */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full grid place-items-center mb-6"
      >
        <div
          className="relative grid place-items-center rounded-full"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          {/* Ring */}
          <motion.div
            key={`${mode}-${dialDeg}`}
            initial={{ rotate: -6, opacity: 0.8 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            style={{
              background: dialBg,
              filter: "drop-shadow(0 8px 28px rgba(99,102,241,0.25))",
              ...ringMaskStyle,
            }}
            aria-label={`${mode === "work" ? "Work" : "Break"} progress`}
          />

          {/* Inner plate */}
          <div
            className="relative grid place-items-center rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-inner"
            style={{ width: INNER_SIZE, height: INNER_SIZE }}
          >
            <div className="text-center">
              <motion.div
                key={time.display}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className={`font-mono ${TIME_FONT} font-extrabold tracking-wide text-[rgb(var(--fg))]`}
                aria-live="polite"
              >
                {time.display}
              </motion.div>
              {/* Removed "Focus time" / "Break time" label for cleaner look */}
            </div>
          </div>
        </div>

        {/* Quick controls under the hero */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {!isRunning && !isPaused ? (
            <Button
              onClick={onStart}
              disabled={!canStart}
              className="gap-2"
              variant="secondary"
            >
              <IconStart />
              Start
            </Button>
          ) : null}

          {isRunning && !isPaused ? (
            <Button onClick={onPause} className="gap-2" variant="secondary">
              <IconPause />
              Pause
            </Button>
          ) : null}

          {isPaused ? (
            <Button onClick={onResume} className="gap-2" variant="secondary">
              <IconStart />
              Resume
            </Button>
          ) : null}

          {mode === "work" ? (
            <Button
              onClick={onStopSave}
              disabled={!canStopSave}
              className="gap-2"
              variant="secondary"
            >
              <IconStop />
              Stop & Save
            </Button>
          ) : null}

          <Button onClick={onReset} variant="outline" className="gap-2">
            Reset
          </Button>
        </div>

        {/* Target control */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <Label htmlFor="target-minutes" className="text-sm">
            Target (minutes)
          </Label>
          <Input
            id="target-minutes"
            type="number"
            min={1}
            value={targetMinutes}
            onChange={(e) =>
              onChangeTargetMinutes(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-28"
            disabled={isRunning && !isPaused}
          />
          {isRunning && isPaused ? (
            <span className="text-xs text-gray-500">
              You can edit target while paused
            </span>
          ) : null}
        </div>
      </motion.div>

      {/* Settings (collapsible) */}
      <AnimatePresence initial={false}>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <Card>
              <CardHeader title="Defaults" />
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="default-work">Default Work (min)</Label>
                    <Input
                      id="default-work"
                      type="number"
                      min={1}
                      value={cycleConfig.workMinutes}
                      onChange={(e) =>
                        onChangeCycleConfig({
                          ...cycleConfig,
                          workMinutes: Math.max(
                            1,
                            Math.floor(Number(e.target.value) || 1)
                          ),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for next Work session when idle.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="default-break">Default Break (min)</Label>
                    <Input
                      id="default-break"
                      type="number"
                      min={1}
                      value={cycleConfig.breakMinutes}
                      onChange={(e) =>
                        onChangeCycleConfig({
                          ...cycleConfig,
                          breakMinutes: Math.max(
                            1,
                            Math.floor(Number(e.target.value) || 1)
                          ),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for next Break session when idle.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact, meaningful stats */}
      <div className="mt-6 grid gap-4">
        {/* Today — donut breakdown; slightly darker pastel (bg mixed with text) */}
        <Card>
          <CardHeader title="Today" />
          <CardBody>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <TintPill
                label="Focus"
                value={formatMinutes(summary.todayTotalMinutes)}
                colorClass="from-pink-100 to-violet-100 dark:from-gray-800 dark:to-gray-800"
              />
              <TintPill
                label="Sessions"
                value={String(summary.todaySessionsCount)}
                colorClass="from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-800"
              />
            </div>

            {summary.todayTotalMinutes > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-center">
                {/* Donut */}
                <div className="flex items-center justify-center">
                  <div
                    className="relative rounded-full"
                    style={{ width: 220, height: 220 }}
                  >
                    {/* Base ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#1f2937 0deg, #1f2937 360deg)",
                      }}
                    />
                    {/* Segments colored via slightly darkened pastel */}
                    {donutSegments.map((seg) => {
                      const start = (seg.start / 100) * 360;
                      const end = (seg.end / 100) * 360;
                      return (
                        <div
                          key={seg.name}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(transparent ${start}deg, ${seg.donutFill} ${start}deg ${end}deg, transparent ${end}deg 360deg)`,
                            WebkitMask:
                              "radial-gradient(circle at center, transparent 72px, black 73px)",
                            mask:
                              "radial-gradient(circle at center, transparent 72px, black 73px)",
                            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
                          }}
                        />
                      );
                    })}
                    {/* Center plate */}
                    <div className="absolute inset-9 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] grid place-items-center">
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {formatMinutes(summary.todayTotalMinutes)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend (uses strong text color) */}
                <ul className="space-y-2">
                  {todayParts.map((p) => {
                    const pct = Math.round((p.minutes / summary.todayTotalMinutes) * 100);
                    return (
                      <li
                        key={p.name}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ background: p.palette.text }}
                          />
                          <span className="truncate" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm tabular-nums text-gray-400">
                            {pct}%
                          </span>
                          <span className="text-sm tabular-nums">
                            {formatMinutes(p.minutes)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : !ui.loadingSummary ? (
              <div className="text-sm text-gray-500">No focus yet today.</div>
            ) : null}
          </CardBody>
        </Card>

        {/* All-time — colorful chips list */}
        <Card>
          <CardHeader title="All-time" />
          <CardBody>
            <div className="flex flex-wrap gap-3 mb-3">
              <TintPill
                label="Total Focus"
                value={formatMinutes(summary.allTimeTotalMinutes)}
                colorClass="from-rose-100 to-amber-100 dark:from-gray-800 dark:to-gray-800"
              />
            </div>

            {allTimeParts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allTimeParts.map((r) => (
                  <div
                    key={r.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
                    style={{
                      background: r.palette.bg,
                      color: r.palette.text,
                      borderColor: r.palette.border,
                    }}
                    title={`${r.name}: ${formatMinutes(r.minutes)}`}
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="opacity-90">{formatMinutes(r.minutes)}</span>
                  </div>
                ))}
              </div>
            ) : !ui.loadingSummary ? (
              <div className="text-sm text-gray-500">
                No focus recorded yet.
              </div>
            ) : null}
          </CardBody>
        </Card>

        {/* Footer helpers */}
        <div className="text-center text-xs text-gray-500">
          {ui.loadingSummary ? "Loading summary..." : null}
          {!hasSubjects && mode === "work" && !ui.loadingSummary ? (
            <div className="mt-2">
              Tip: Add a subject to start tracking work sessions.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* Soft tinted pill used for quick stats */
function TintPill({ label, value, colorClass }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))]",
        "bg-gradient-to-br px-3 py-2 shadow-sm",
        colorClass,
      ].join(" ")}
    >
      <span className="text-xs text-gray-600 dark:text-gray-300">{label}</span>
      <span className="text-base font-semibold text-[rgb(var(--fg))]">
        {value}
      </span>
    </div>
  );
}