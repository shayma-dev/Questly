/* eslint-disable no-empty */
/* src/pages/FocusPage.jsx */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RequireAuthReady from "../utils/RequireAuthReady";
import PageLoader from "../components/common/PageLoader";
import { toast } from "sonner";
import FocusUI from "../components/focus/FocusUI.jsx";
import useFocusTimer from "../hooks/useFocusTimer.js";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import {
  getFocusSummary,
  createFocusSession,
  normalizeFocusSummary,
  getFocusApiError,
} from "../api/focusApi.js";

const CONFIG_KEY = "focus.config";
const SOUND_KEY = "focus.sound";
const SUBJECT_KEY = "focus.selectedSubjectId";
const STATE_KEY = "focus.state";
const ALARM_KEY = "focus.alarm";
const RECEIPT_KEY = "focus.receipt";
const LOCK_KEY = "focus.receipt.lock"; // same lock as watcher

/* ---------- Utilities ---------- */
function canNotify() {
  return "Notification" in window;
}
async function ensureNotifyPermission() {
  if (!canNotify()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}
function showNotification(title, body) {
  if (!canNotify() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: "focus-timer", renotify: true });
  } catch {}
}
function formatMinutes(mm) {
  const m = Math.max(0, Math.floor(Number(mm) || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h > 0) return `${h}h ${rem}m`;
  return `${rem}m`;
}
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to set localStorage for ${key}`);
    }
  }, [key, value]);
  return [value, setValue];
}
function useAudioBeep(src = "/sounds/chime.mp3") {
  const audioRef = useRef(null);
  useEffect(() => {
    const a = new Audio(src);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    a.volume = 0.9;
    audioRef.current = a;
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [src]);
  const unlock = useCallback(async () => {
    const a = audioRef.current; if (!a) return;
    try { a.muted = true; await a.play(); a.pause(); a.currentTime = 0; a.muted = false; } catch {}
  }, []);
  const beep = useCallback(async () => {
    const a = audioRef.current; if (!a) return;
    try { a.currentTime = 0; await a.play(); } catch (err) { console.warn("Chime play failed:", err); }
  }, []);
  return { beep, unlock };
}

/* JSON helpers + lock */
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function clearKeys(keys) {
  for (const k of keys) { try { localStorage.removeItem(k); } catch {} }
}
function acquireLock(endAt, source = "page") {
  const now = Date.now();
  const lock = readJSON(LOCK_KEY);
  if (lock && lock.endAt === endAt && now - (lock.at || 0) < 60_000) {
    return false;
  }
  writeJSON(LOCK_KEY, { endAt, at: now, source });
  return true;
}

/* ---------- New: Persisted Subject helper ---------- */
function usePersistedSubject() {
  const [selectedSubjectId, setSelectedSubjectId] = useLocalStorage(SUBJECT_KEY, null);
  const selectSubject = useCallback((id) => { setSelectedSubjectId(id); }, [setSelectedSubjectId]);
  const clearSubject = useCallback(() => { setSelectedSubjectId(null); }, [setSelectedSubjectId]);
  return { selectedSubjectId, selectSubject, clearSubject, setSelectedSubjectId };
}

/* ---------- Inner Page (auth-gated wrapper will mount this) ---------- */
function FocusPageInner() {
  // Config
  const [config, setConfig] = useLocalStorage(CONFIG_KEY, { workMinutes: 25, breakMinutes: 5 });

  // Sound
  const [soundEnabled, setSoundEnabled] = useLocalStorage(SOUND_KEY, true);
  const { beep, unlock } = useAudioBeep("/sounds/chime.mp3");
  const toggleSound = useCallback(() => {
    unlock();
    ensureNotifyPermission();
    setSoundEnabled((v) => !v);
    toast.message("Sound " + (!soundEnabled ? "enabled" : "disabled"));
  }, [unlock, setSoundEnabled, soundEnabled]);

  // Summary
  const [summary, setSummary] = useState({
    subjects: [],
    todayBySubject: [],
    todayTotalMinutes: 0,
    todaySessionsCount: 0,
    allTimePerSubject: [],
    allTimeTotalMinutes: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // page-level loader
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setErrorMessage(null);
    try {
      const raw = await getFocusSummary();
      const norm = normalizeFocusSummary(raw);
      const subjects = (norm.subjects || []).map((s) => ({ id: s.id, name: s.name }));
      const todayBySubject = norm.todaySessions || [];
      const todayTotalMinutes = norm.todayTotal || 0;
      const todaySessionsCount = norm.todaySessionsCount || 0;
      const allTimePerSubject = norm.totalFocus || [];
      const allTimeTotalMinutes = allTimePerSubject.reduce(
        (sum, s) => sum + (Number(s.total_focus) || 0),
        0
      );
      setSummary({
        subjects,
        todayBySubject,
        todayTotalMinutes,
        todaySessionsCount,
        allTimePerSubject,
        allTimeTotalMinutes,
      });
    } catch (err) {
      const msg = getFocusApiError(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await fetchSummary();
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchSummary]);

  // Persisted subject selection
  const { selectedSubjectId, selectSubject, clearSubject } = usePersistedSubject();
  useEffect(() => {
    if (loadingSummary) return;
    const subjects = summary.subjects || [];
    if (!subjects.length) {
      if (selectedSubjectId != null) clearSubject();
      return;
    }
    if (selectedSubjectId == null) return;
    const exists = subjects.some((s) => String(s.id) === String(selectedSubjectId));
    if (!exists) clearSubject();
  }, [loadingSummary, summary.subjects, selectedSubjectId, clearSubject]);

  // Receipts
  const writeReceipt = useCallback((payload) => {
    writeJSON(RECEIPT_KEY, { ...payload, at: Date.now() });
  }, []);
  const readReceipt = useCallback(() => readJSON(RECEIPT_KEY), []);

  // Timer
  const timer = useFocusTimer({
    initialMode: "work",
    initialTargetMinutes: config.workMinutes,
    storageKey: STATE_KEY,
    onComplete: async (mode) => {
      try {
        const currentAlarm = readJSON(ALARM_KEY);
        const sessionEndAt = currentAlarm?.endAt ?? Date.now();

        if (!acquireLock(sessionEndAt, "page")) {
          timer.reset();
          timer.switchMode(mode === "work" ? "break" : "work");
          clearKeys([ALARM_KEY, STATE_KEY]);
          return;
        }

        const existing = readReceipt();
        if (!(existing && existing.at && Date.now() - existing.at < 30_000)) {
          if (mode === "work") {
            const minutes = timer.getElapsedWholeMinutes();
            if (minutes >= 1 && selectedSubjectId != null) {
              setSaving(true);
              await createFocusSession({ subject_id: selectedSubjectId, duration: minutes });
              writeReceipt({ type: "page-save", mode, minutes, subjectId: selectedSubjectId });
              await fetchSummary();
            } else {
              writeReceipt({ type: "page-complete", mode });
            }
          } else {
            writeReceipt({ type: "page-complete", mode });
          }

          if (soundEnabled) {
            if (document.visibilityState === "visible") {
              beep();
            } else {
              showNotification(
                mode === "work" ? "Work session complete" : "Break over",
                mode === "work" ? "Time for a break." : "Back to work!"
              );
            }
          }
        }

        clearKeys([ALARM_KEY, STATE_KEY]);
        timer.reset();
        timer.switchMode(mode === "work" ? "break" : "work");

        if (mode === "work") {
          toast.success("Work session complete. Time for a break.");
        } else {
          toast.message("Break over. Back to work!");
        }
      } catch (err) {
        console.error("Error during timer completion:", err);
        toast.error("Something went wrong completing the timer.");
      } finally {
        setSaving(false);
      }
    },
  });

  // Mirror running session into ALARM for global watcher
  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      const endAt = Date.now() + Math.max(0, timer.remainingSeconds) * 1000;
      const alarm = {
        mode: timer.mode,
        endAt,
        selectedSubjectId: selectedSubjectId ?? null,
        plannedMinutes: timer.targetMinutes,
      };
      writeJSON(ALARM_KEY, alarm);
    } else {
      clearKeys([ALARM_KEY]);
    }
  }, [
    timer.isRunning,
    timer.isPaused,
    timer.remainingSeconds,
    timer.mode,
    timer.targetMinutes,
    selectedSubjectId,
  ]);

  // Sync target minutes with config when idle
  useEffect(() => {
    if (!timer.isRunning && !timer.isPaused) {
      const next = timer.mode === "work" ? config.workMinutes : config.breakMinutes;
      timer.setTargetMinutes(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.mode, config.workMinutes, config.breakMinutes]);

  // Derived rules
  const hasSubjects = summary.subjects.length > 0;
  const canStart =
    !timer.isRunning &&
    !timer.isPaused &&
    (timer.mode === "break" ||
      (timer.mode === "work" && hasSubjects && selectedSubjectId != null));

  const canStopSave =
    timer.mode === "work" &&
    (timer.isRunning || timer.isPaused) &&
    timer.getElapsedWholeMinutes() >= 1;

  // Handlers
  const onSelectSubject = useCallback(
    (id) => {
      if (timer.isRunning && timer.mode === "work") return;
      selectSubject(id);
    },
    [selectSubject, timer.isRunning, timer.mode]
  );

  const onChangeMode = useCallback(
    (next) => {
      if (timer.isRunning || timer.isPaused) return;
      if (next !== "work" && next !== "break") return;
      timer.switchMode(next);
    },
    [timer]
  );

  const onChangeTargetMinutes = useCallback((min) => { timer.setTargetMinutes(min); }, [timer]);

  const onChangeCycleConfig = useCallback(
    (cfg) => {
      setConfig((prev) => ({
        ...prev,
        workMinutes: Math.max(1, Math.floor(cfg.workMinutes || prev.workMinutes)),
        breakMinutes: Math.max(1, Math.floor(cfg.breakMinutes || prev.breakMinutes)),
      }));
      if (!timer.isRunning && !timer.isPaused) {
        const next = timer.mode === "work" ? cfg.workMinutes : cfg.breakMinutes;
        if (next != null) timer.setTargetMinutes(next);
      }
    },
    [setConfig, timer]
  );

  const onStart = useCallback(() => {
    if (!canStart) return;
    setErrorMessage(null);
    unlock();
    ensureNotifyPermission();
    clearKeys([RECEIPT_KEY, LOCK_KEY]);
    timer.start();
    toast.success(timer.mode === "work" ? "Work started. Stay focused!" : "Break started. Relax!");
  }, [canStart, timer, unlock]);

  const onPause = useCallback(() => {
    timer.pause();
    toast.message("Paused");
  }, [timer]);

  const onResume = useCallback(() => {
    unlock();
    ensureNotifyPermission();
    timer.resume();
    toast.message("Resumed");
  }, [timer, unlock]);

  const onStopSave = useCallback(async () => {
    const eligible =
      timer.mode === "work" &&
      (timer.isRunning || timer.isPaused) &&
      timer.getElapsedWholeMinutes() >= 1 &&
      selectedSubjectId != null;
    try {
      setSaving(true);
      if (eligible) {
        const minutes = timer.getElapsedWholeMinutes();
        await createFocusSession({ subject_id: selectedSubjectId, duration: minutes });
        writeJSON(RECEIPT_KEY, {
          type: "manual-save",
          mode: "work",
          minutes,
          subjectId: selectedSubjectId,
          at: Date.now(),
        });
        await fetchSummary();
        toast.success("Session saved");
      } else if (selectedSubjectId == null) {
        toast.error("Select a subject to save this session.");
      } else {
        toast.message("Not enough time elapsed to save (need at least 1 minute).");
      }
      timer.reset();
      clearKeys([ALARM_KEY, STATE_KEY]);
    } catch (err) {
      const msg = getFocusApiError(err);
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  }, [selectedSubjectId, timer, fetchSummary]);

  const onReset = useCallback(() => {
    timer.reset();
    setErrorMessage(null);
    clearKeys([STATE_KEY, ALARM_KEY]);
    toast.info("Timer reset");
  }, [timer]);

  // Reconcile receipts on load/visibility
  useEffect(() => {
    const reconcile = async () => {
      try {
        const recRaw = localStorage.getItem(RECEIPT_KEY);
        if (!recRaw) return;
        await fetchSummary();
        localStorage.removeItem(RECEIPT_KEY);
      } catch {}
    };
    reconcile();
    const onVis = () => {
      if (document.visibilityState === "visible") {
        const recRaw = localStorage.getItem(RECEIPT_KEY);
        if (recRaw) {
          fetchSummary().finally(() => {
            try { localStorage.removeItem(RECEIPT_KEY); } catch {}
          });
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [fetchSummary]);

  const summaryProps = useMemo(
    () => ({
      todayTotalMinutes: summary.todayTotalMinutes,
      todaySessionsCount: summary.todaySessionsCount,
      todayBySubject: summary.todayBySubject,
      allTimePerSubject: summary.allTimePerSubject,
      allTimeTotalMinutes: summary.allTimeTotalMinutes,
    }),
    [summary]
  );
  const uiState = useMemo(
    () => ({ loadingSummary, saving, errorMessage }),
    [loadingSummary, saving, errorMessage]
  );

  // NEW: handle subject added from FocusUI
  const handleSubjectAddedAtPage = useCallback((s) => {
    // Merge into subjects immediately
    setSummary((prev) => {
      const exists = prev.subjects?.some((p) => String(p.id) === String(s.id));
      const subjects = exists ? prev.subjects : [...(prev.subjects || []), s];
      return { ...prev, subjects };
    });
    // Auto-select only if none selected
    if (selectedSubjectId == null) {
      selectSubject(s.id);
    }
  }, [selectSubject, selectedSubjectId]);

  // Page-level loading UI
  if (initialLoading) {
    return <PageLoader label="Loading your focus summary…" />;
  }

  return (
    <RequireAuthReady>
      <FocusAlarmWatcher />
      <FocusUI
        subjects={summary.subjects}
        selectedSubjectId={selectedSubjectId}
        mode={timer.mode}
        cycleConfig={{ workMinutes: config.workMinutes, breakMinutes: config.breakMinutes }}
        targetMinutes={timer.targetMinutes}
        time={{ display: timer.display, elapsedSeconds: timer.elapsedSeconds, remainingSeconds: timer.remainingSeconds }}
        isRunning={timer.isRunning}
        isPaused={timer.isPaused}
        soundEnabled={soundEnabled}
        summary={summaryProps}
        canStart={canStart}
        ui={uiState}
        onSelectSubject={onSelectSubject}
        onChangeMode={onChangeMode}
        onChangeTargetMinutes={onChangeTargetMinutes}
        onChangeCycleConfig={onChangeCycleConfig}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onStopSave={onStopSave}
        onReset={onReset}
        onToggleSound={toggleSound}
        canStopSave={canStopSave}
        formatMinutes={formatMinutes}
        hasSubjects={summary.subjects.length > 0}
        // NEW: bubble up subject creation
        onSubjectAdded={handleSubjectAddedAtPage}
      />
    </RequireAuthReady>
  );
}

/* ---------- Export wrapped with centralized auth gate ---------- */
export default function FocusPage() {
  return (
    <RequireAuthReady>
      <FocusPageInner />
    </RequireAuthReady>
  );
}