// src/api/focusApi.js
import api from './axiosInstance';

function autoTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * GET /api/sessions/summary?tz=Area/City
 */
export async function getFocusSummary({ tz } = {}) {
  const params = { tz: tz || autoTimezone() };
  const { data } = await api.get('/sessions/summary', { params });
  return data;
}

/**
 * NEW: GET /api/sessions/last7?tz=Area/City
 * Returns: { days: [{ date: "YYYY-MM-DD", minutes: number }, ...7] }
 */
export async function getFocusLast7({ tz } = {}) {
  const params = { tz: tz || autoTimezone() };
  const { data } = await api.get('/sessions/last7', { params });
  return data;
}

/**
 * POST /api/sessions
 */
export async function createFocusSession({ subject_id, duration }) {
  const { data } = await api.post('/sessions', { subject_id, duration });
  return data;
}

export function getFocusApiError(err) {
  return err?.message || 'Something went wrong';
}

export function normalizeFocusSummary(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      subjects: [],
      todaySessions: [],
      totalFocus: [],
      todayTotal: 0,
      todaySessionsCount: 0,
    };
  }

  const subjects = Array.isArray(raw.subjects) ? raw.subjects : [];

  const todaySessions = Array.isArray(raw.todaySessions)
    ? raw.todaySessions.map((r) => ({
        name: r.name,
        duration: Number(r.duration) || 0,
      }))
    : [];

  const totalFocus = Array.isArray(raw.totalFocus)
    ? raw.totalFocus.map((r) => ({
        subject_name: r.subject_name,
        total_focus: Number(r.total_focus) || 0,
      }))
    : [];

  return {
    subjects,
    todaySessions,
    totalFocus,
    todayTotal: Number(raw.todayTotal) || 0,
    todaySessionsCount: Number(raw.todaySessionsCount) || 0,
  };
}