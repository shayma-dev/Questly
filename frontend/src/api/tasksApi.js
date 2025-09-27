import api from './axiosInstance';

// GET /api/tasks
export async function getTasks() {
  const { data } = await api.get('/tasks');
  // { tasks: [...], subjects: [...] }
  return data;
}

// GET /api/tasks/:id
export async function getTaskById(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data; // a single task row
}

// POST /api/tasks
// payload: { title, description, subject_id, due_date (YYYY-MM-DD) }
export async function createTask(payload) {
  const { data } = await api.post('/tasks', payload);
  return data; // created task
}

// PUT /api/tasks/:id
export async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data; // { message: 'Task updated successfully' }
}

// DELETE /api/tasks/:id
export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return data; // { message: 'Task deleted successfully' }
}

// PATCH /api/tasks/:id/toggle
export async function toggleTask(id) {
  const { data } = await api.patch(`/tasks/${id}/toggle`);
  return data; // updated task (with toggled is_completed)
}