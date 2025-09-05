import api from "./axiosInstance";

// GET /api/profile
export async function getProfile() {
  const res = await api.get("/profile");
  // Expected: { user, subjects }
  return res.data;
}

// PATCH /api/profile/update body: { username }
export async function updateUsername(username) {
  const res = await api.patch("/profile/update", { username });
  // Expected: { success: true, message: "Username updated" }
  return res.data;
}

// PATCH /api/profile/avatar multipart: avatar=<file>
export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.patch("/profile/avatar", formData);

  // Expected: { message: "Avatar updated successfully", avatarUrl }
  return res.data;
}

// POST /api/profile/subjects/add body: { name }
export async function addSubject(name) {
  const res = await api.post("/profile/subjects/add", { name });
  // Expected: { message: "Subject added", id }
  return res.data;
}

// DELETE /api/profile/subjects/delete/:id
export async function deleteSubject(id) {
  const res = await api.delete(`/profile/subjects/delete/${id}`);
  // Expected: { message: "Subject deleted" }
  return res.data;
}

// GET /api/profile/logout
export async function logoutProfile() {
  const res = await api.get("/profile/logout");
  // Expected: { message: "Logged out" }
  return res.data;
}
