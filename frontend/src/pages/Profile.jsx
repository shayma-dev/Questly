// ==============================
// src/pages/ProfilePage.jsx
// Container: data fetching, mutations, navigation, and validation.
// NOTE: Removed isMounted ref that kept loading stuck in React Strict Mode.
// ==============================
import React, { useCallback, useEffect, useState } from "react";
import ProfileUI from "../components/profile/ProfileUI";
import AppNav from "../components/common/AppNav";
import {
  getProfile,
  updateUsername,
  updateAvatar,
  addSubject as apiAddSubject,
  deleteSubject as apiDeleteSubject,
} from "../api/profileApi";

// Small helpers/constants for consistent UX and validation
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function normalizeError(e) {
  return e?.response?.data?.error || e?.message || "Something went wrong";
}

export default function ProfilePage() {

  // UI state: page-level flags/messages
  const [loading, setLoading] = useState(true); // while fetching profile data
  const [saving, setSaving] = useState(false); // while saving/updating anything
  const [error, setError] = useState(""); // user-facing error text

  // Server data I render
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Form state derived from user
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Kept only for a “batch save” flow; with immediate upload it stays null
  const [avatarFile, setAvatarFile] = useState(null);

  // Pull the latest profile + subject list and hydrate the form
  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getProfile();
      setUser(data.user || null);
      setSubjects(data.subjects || []);
      setName(data.user?.username || "");
      setEmail(data.user?.email || "");
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    load();
  }, [load]);

  // Upload avatar immediately after selection (no need to press Save)
  const handleSelectAvatar = useCallback(async (file) => {
    setError("");

    // Minimal client-side validation
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("File too large. Please select an image under 5MB.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateAvatar(file); // sends FormData('avatar', file)
      // reflect the new image immediately
      setUser((prev) => (prev ? { ...prev, avatar_url: res.avatarUrl } : prev));
      setAvatarFile(null); // make sure Save doesn’t try to re-upload
      // No full refetch; local state already updated
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setSaving(false);
    }
  }, []);

  // Save button: only pushes changes that actually changed
  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      // Only update username when it’s different
      if (name && name !== user.username) {
        await updateUsername(name);
        // keep local state in sync without refetch
        setUser((prev) => (prev ? { ...prev, username: name } : prev));
      }

      // Optional “batch” avatar upload path (if immediate upload didn't run)
      if (avatarFile) {
        const res = await updateAvatar(avatarFile);
        setUser((prev) =>
          prev ? { ...prev, avatar_url: res.avatarUrl } : prev
        );
        setAvatarFile(null);
      }

      // No explicit Refresh feature anymore
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setSaving(false);
    }
  }, [avatarFile, name, user]);

  // Add a new subject (server returns id; append locally)
  const handleAddSubject = useCallback(async (subjectName) => {
    const n = subjectName?.trim();
    if (!n) return;
    setError("");
    try {
      const res = await apiAddSubject(n);
      setSubjects((prev) => [...prev, { id: res.id, name: n }]);
    } catch (e) {
      setError(normalizeError(e));
    }
  }, []);

  // Remove a subject by id and optimistically drop it from the list
  const handleDeleteSubject = useCallback(async (id) => {
    setError("");
    try {
      await apiDeleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(normalizeError(e));
    }
  }, []);


  return (
    <>
      {/* Top navigation shared across pages */}
      <AppNav/>
      {/* Presentational component receives all data + handlers */}
      <ProfileUI
        user={user}
        subjects={subjects}
        loading={loading}
        saving={saving}
        error={error}
        form={{ name, email }}
        onChange={{
          onChangeName: setName,
          onChangeAvatar: handleSelectAvatar, // upload immediately on file choose
          onAddSubject: handleAddSubject,
        }}
        actions={{
          onSaveProfile: handleSaveProfile,
          onDeleteSubject: handleDeleteSubject,
        }}
      />
    </>
  );
}
