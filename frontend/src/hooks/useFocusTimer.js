/* eslint-disable react-hooks/exhaustive-deps */
// src/hooks/useFocusTimer.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Drift-free countdown timer with two modes: "work" | "break".
 * - Persists ephemeral session state to localStorage under STATE_KEY
 * - Calls onComplete(mode) when countdown reaches zero
 * - Allows target change when paused or idle; mode switch only when idle
 */
export default function useFocusTimer({
  initialMode = "work",
  initialTargetMinutes = 25,
  storageKey = "focus.state",
  onComplete, // function(mode: "work"|"break")
} = {}) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Rehydrate ephemeral session state
  const loadState = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (
        !s ||
        (s.mode !== "work" && s.mode !== "break") ||
        typeof s.targetMinutes !== "number" ||
        s.targetMinutes <= 0
      ) {
        return null;
      }
      return {
        mode: s.mode,
        targetMinutes: s.targetMinutes,
        startAtMs: typeof s.startAtMs === "number" ? s.startAtMs : null,
        pausedAccumMs:
          typeof s.pausedAccumMs === "number" ? s.pausedAccumMs : 0,
        isRunning: !!s.isRunning,
        isPaused: !!s.isPaused,
        pauseAtMs: typeof s.pauseAtMs === "number" ? s.pauseAtMs : null,
      };
    } catch {
      return null;
    }
  }, [storageKey]);

  const initial = useMemo(() => {
    return (
      loadState() || {
        mode: initialMode,
        targetMinutes: initialTargetMinutes,
        startAtMs: null,
        pausedAccumMs: 0,
        isRunning: false,
        isPaused: false,
        pauseAtMs: null,
      }
    );
  }, []); // run once

  const [mode, setMode] = useState(initial.mode);
  const [targetMinutes, setTargetMinutesState] = useState(
    initial.targetMinutes,
  );
  const [startAtMs, setStartAtMs] = useState(initial.startAtMs);
  const [pausedAccumMs, setPausedAccumMs] = useState(initial.pausedAccumMs);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [isPaused, setIsPaused] = useState(initial.isPaused);
  const [pauseAtMs, setPauseAtMs] = useState(initial.pauseAtMs);

  // Persist ephemeral state
  useEffect(() => {
    const s = {
      mode,
      targetMinutes,
      startAtMs,
      pausedAccumMs,
      isRunning,
      isPaused,
      pauseAtMs,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      console.warn(`Failed to save focus state to ${storageKey}`);
    }
  }, [
    mode,
    targetMinutes,
    startAtMs,
    pausedAccumMs,
    isRunning,
    isPaused,
    pauseAtMs,
    storageKey,
  ]);

  // Compute elapsed/remaining with drift-free math
  const nowRef = useRef(Date.now());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let rafId;
    let intervalId;

    const loop = () => {
      nowRef.current = Date.now();
      setTick((t) => (t + 1) % 1_000_000);
      rafId = requestAnimationFrame(loop);
    };

    // Use RAF for smoothness, but throttle by interval for power saving if paused/idle
    if (isRunning && !isPaused) {
      rafId = requestAnimationFrame(loop);
    } else {
      intervalId = setInterval(() => {
        nowRef.current = Date.now();
        setTick((t) => (t + 1) % 1_000_000);
      }, 500);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, isPaused]);

  const elapsedSeconds = useMemo(() => {
    if (!startAtMs) return 0;
    const endMs = isPaused && pauseAtMs ? pauseAtMs : nowRef.current;
    const ms = Math.max(0, endMs - startAtMs - pausedAccumMs);
    return Math.floor(ms / 1000);
  }, [tick, startAtMs, pausedAccumMs, isPaused, pauseAtMs]);

  const totalSeconds = Math.max(0, Math.floor(targetMinutes * 60));
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  // Completion detection
  const completedRef = useRef(false);
  useEffect(() => {
    if (!isRunning || isPaused) {
      completedRef.current = false;
      return;
    }
    if (remainingSeconds <= 0 && !completedRef.current) {
      completedRef.current = true;
      // Freeze running and keep elapsed at target
      setIsRunning(false);
      setIsPaused(false);
      setPauseAtMs(null);
      // Don't clear startAtMs/pausedAccumMs so container can read elapsed
      onCompleteRef.current && onCompleteRef.current(mode);
    }
  }, [remainingSeconds, isRunning, isPaused, mode]);

  // Public API
  const start = useCallback(() => {
    if (isRunning || isPaused) return;
    const now = Date.now();
    setStartAtMs(now);
    setPausedAccumMs(0);
    setIsRunning(true);
    setIsPaused(false);
    setPauseAtMs(null);
  }, [isRunning, isPaused]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    setPauseAtMs(Date.now());
  }, [isRunning, isPaused]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    const now = Date.now();
    setPausedAccumMs((p) => p + (now - (pauseAtMs || now)));
    setIsPaused(false);
    setPauseAtMs(null);
    setIsRunning(true);
  }, [isPaused, pauseAtMs]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setStartAtMs(null);
    setPausedAccumMs(0);
    setPauseAtMs(null);
  }, []);

  const switchMode = useCallback(
    (nextMode) => {
      if (isRunning || isPaused) return; // only when idle
      if (nextMode !== "work" && nextMode !== "break") return;
      setMode(nextMode);
    },
    [isRunning, isPaused],
  );

  const setTargetMinutes = useCallback(
    (min) => {
      const m = Math.max(1, Math.floor(Number(min) || 0));
      // allowed when paused OR idle
      if (isRunning && !isPaused) return;
      setTargetMinutesState(m);
    },
    [isRunning, isPaused],
  );

  const getElapsedWholeMinutes = useCallback(() => {
    return Math.floor(elapsedSeconds / 60);
  }, [elapsedSeconds]);

  const display = useMemo(() => {
    const secs = remainingSeconds;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [remainingSeconds]);

  return {
    // state
    mode,
    isRunning,
    isPaused,
    elapsedSeconds,
    remainingSeconds,
    targetMinutes,
    display,
    // actions
    start,
    pause,
    resume,
    reset,
    switchMode,
    setTargetMinutes,
    getElapsedWholeMinutes,
  };
}
