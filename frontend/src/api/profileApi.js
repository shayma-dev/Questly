import api from './axiosInstance';

// GET /api/profileApi
export async function getProfile() {
  const { data } = await api.get('/profile');
  // Expected: { user, subjects }
  return data;
}

// PATCH /api/profile/update body: { username }
export async function updateUsername(username) {
  const { data } = await api.patch('/profile/update', { username });
  // Expected: { success: true, message: 'Username updated' }
  return data;
}

// PATCH /api/profile/avatar multipart: avatar=<file>
export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await api.patch('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // Expected: { message: 'Avatar updated successfully', avatarUrl }
  return data;
}

// POST /api/profile/subjects/add body: { name }
export async function addSubject(name) {
  const { data } = await api.post('/profile/subjects/add', { name });
  // Now returns: { message: 'Subject added', id, name }
  return data;
}

// DELETE /api/profile/subjects/delete/:id
export async function deleteSubject(id) {
  const { data } = await api.delete(`/profile/subjects/delete/${id}`);
  // Expected: { message: 'Subject deleted' }
  return data;
}

// GET /api/profile/logout
export async function logoutProfile() {
  const { data } = await api.get('/profile/logout');
  // Expected: { message: 'Logged out' }
  return data;
}