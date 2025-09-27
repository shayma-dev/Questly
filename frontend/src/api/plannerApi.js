import api from './axiosInstance';

/**
 * GET /api/planner
 */
export async function getPlanner() {
  const { data } = await api.get('/planner');
  return data;
}

/**
 * POST /api/planner
 */
export async function createSession(payload) {
  const { data } = await api.post('/planner', payload);
  return data;
}

/**
 * PUT /api/planner/:id
 */
export async function updateSession(id, payload) {
  const { data } = await api.put(`/planner/${id}`, payload);
  return data;
}

/**
 * DELETE /api/planner/:id
 */
export async function deleteSession(id) {
  const { data } = await api.delete(`/planner/${id}`);
  return data;
}

export const PLANNER_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];