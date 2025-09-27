import api from './axiosInstance';

export async function getNotes() {
  const { data } = await api.get('/notes');
  return data;
}

export async function createNote(payload) {
  const { data } = await api.post('/notes', payload);
  return data;
}

export async function updateNote(id, payload) {
  const { data } = await api.put(`/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id) {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
}

// Optional helper for legacy code; otherwise use err.message.
export function getNotesApiError(err) {
  return err?.message || 'Something went wrong';
}