import api from "./axiosInstance";
// GET /api/tasks
export async function getTasks() {
  const res = await api.get("/tasks");
  // { tasks: [...], subjects: [...] }
  return res.data;
}

// GET /api/tasks/:id
export async function getTaskById(id) {
  const res = await api.get(`/tasks/${id}`);
  return res.data; // a single task row
}

// POST /api/tasks
// payload: { title, description, subject_id, due_date (YYYY-MM-DD) }
export async function createTask(payload) {
  const res = await api.post("/tasks", payload);
  return res.data; // created task
}

// PUT /api/tasks/:id
export async function updateTask(id, payload) {
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data; // { message: "Task updated successfully" }
}

// DELETE /api/tasks/:id
export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data; // { message: "Task deleted successfully" }
}

// PATCH /api/tasks/:id/toggle
export async function toggleTask(id) {
  const res = await api.patch(`/tasks/${id}/toggle`);
  return res.data; // updated task (with toggled is_completed)
}
