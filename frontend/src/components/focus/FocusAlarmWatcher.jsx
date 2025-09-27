/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
// src/components/focus/FocusAlarmWatcher.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createFocusSession } from "../../api/focusApi";
import { toast } from "sonner";

const ALARM_KEY = "focus.alarm";
const STATE_KEY = "focus.state";
const SUBJECT_KEY = "focus.selectedSubjectId";
const RECEIPT_KEY = "focus.receipt";      // completion receipt for UI reconciliation
const LOCK_KEY = "focus.receipt.lock";    // new: lock to prevent duplicate saves
const SOUND_SRC = "/sounds/chime.mp3";

function canNotify() {
  return "Notification" in window && Notification.permission === "granted";
}

function showNotification(title, body) {
  if (!canNotify()) return;
  try {
    new Notification(title, { body, tag: "focus-timer", renotify: true });
  } catch {}
}

function useExternalChime(src = SOUND_SRC) {
  const ref = useRef(null);
  useEffect(() => {
    const a = new Audio(src);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    a.volume = 0.9;
    ref.current = a;
    return () => {
      try {
        a.pause();
      } catch {}
      a.src = "";
      ref.current = null;
    };
  }, [src]);

  const play = useCallback(async () => {
    const a = ref.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      await a.play();
    } catch {}
  }, []);

  return play;
}

/* ---------- Lock helpers (prevent duplicate completions) ---------- */
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function clearKeys(keys) {
  for (const k of keys) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}

/**
 * Try to acquire completion lock for a specific alarm endAt.
 * Returns true if lock acquired, false if already locked recently.
 */
function acquireLock(endAt) {
  const now = Date.now();
  const lock = readJSON(LOCK_KEY);
  // If an existing lock matches this endAt and is fresh, do not proceed
  if (lock && lock.endAt === endAt && now - (lock.at || 0) < 60_000) {
    return false;
  }
  // Write/refresh lock for this session id
  writeJSON(LOCK_KEY, { endAt, at: now, source: "watcher" });
  return true;
}

export default function FocusAlarmWatcher() {
  const [alarm, setAlarm] = useState(null);
  const timeoutRef = useRef(null);
  const playChime = useExternalChime();

  const schedule = useCallback(
    (a) => {
      // Always clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!a || !a.endAt) return;

      const delay = Math.max(0, a.endAt - Date.now());

      // Avoid stacking identical timeouts across quick rerenders
      timeoutRef.current = setTimeout(async () => {
        const latest = readJSON(ALARM_KEY);
        if (!latest || latest.endAt !== a.endAt) return;

        // Try lock; if another handler already processed this, bail
        if (!acquireLock(latest.endAt)) {
          // Clean up stale alarm keys if they still exist
          clearKeys([ALARM_KEY, STATE_KEY]);
          setAlarm(null);
          return;
        }

        let didSave = false;
        let minutesSaved = 0;

        if (latest.mode === "work") {
          // Subject id from alarm or persisted store
          const subjectId =
            latest.selectedSubjectId ??
            (() => {
              const raw = readJSON(SUBJECT_KEY);
              return raw ?? null;
            })();

          const minutes = Math.max(
            0,
            Math.floor(Number(latest.plannedMinutes) || 0)
          );

          try {
            if (minutes >= 1 && subjectId != null) {
              await createFocusSession({
                subject_id: subjectId,
                duration: minutes,
              });
              didSave = true;
              minutesSaved = minutes;
              writeJSON(RECEIPT_KEY, {
                type: "auto-save",
                mode: "work",
                minutes,
                subjectId,
                at: Date.now(),
              });
            } else {
              writeJSON(RECEIPT_KEY, {
                type: "complete",
                mode: latest.mode,
                reason:
                  subjectId == null
                    ? "no-subject"
                    : minutes < 1
                    ? "too-short"
                    : "unknown",
                at: Date.now(),
              });
            }
          } catch {
            writeJSON(RECEIPT_KEY, {
              type: "complete-error",
              mode: latest.mode,
              at: Date.now(),
            });
          }
        } else {
          writeJSON(RECEIPT_KEY, {
            type: "complete",
            mode: latest.mode,
            at: Date.now(),
          });
        }

        // UX signals
        playChime();
        showNotification(
          latest.mode === "work" ? "Work session complete" : "Break over",
          latest.mode === "work" ? "Time for a break." : "Back to work!"
        );

        if (latest.mode === "work") {
          if (didSave) {
            toast.success(`Work session complete. Time for a break`);
          } else {
            toast.success("Work session complete.");
          }
        } else {
          toast.message("Break over. Back to work!");
        }

        // Clear alarm/state and local state
        clearKeys([ALARM_KEY, STATE_KEY]);
        setAlarm(null);
      }, delay);
    },
    [playChime]
  );

  // Initial read and schedule
  useEffect(() => {
    const a = readJSON(ALARM_KEY);
    setAlarm(a);
    schedule(a);
    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [schedule]);

  // Respond to alarm changes from other tabs/pages
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === ALARM_KEY) {
        const a = readJSON(ALARM_KEY);
        setAlarm(a);
        schedule(a);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [schedule]);

  // When visibility changes (tab switch), reschedule once
  useEffect(() => {
    const onVis = () => {
      const a = readJSON(ALARM_KEY);
      setAlarm(a);
      schedule(a);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [schedule]);

  return null;
}