// src/pages/Profile.jsx
// Container: data fetching, mutations, navigation, and validation.
import React, { useCallback, useEffect, useState } from "react";
import RequireAuthReady from "../utils/RequireAuthReady";
import PageLoader from "../components/common/PageLoader";
import ProfileUI from "../components/profile/ProfileUI";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import {
  getProfile,
  updateUsername,
  updateAvatar,
  addSubject as apiAddSubject,
  deleteSubject as apiDeleteSubject,
} from "../api/profileApi";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// Small helpers/constants for consistent UX and validation
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

// With the axios interceptor, err is { status, message, details, raw }
function toMessage(err, fallback = "Something went wrong") {
  return err?.message || err?.response?.data?.error || fallback;
}

function ProfileInner() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState(""); // not rendered; we use toasts

  // Server data
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Optional “batch” avatar upload
  const [avatarFile, setAvatarFile] = useState(null);

  // NEW: updater from auth context so Navbar reflects changes immediately
  const { updateUser: updateAuthUser } = useAuth();

  // Load profile
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
      const msg = toMessage(e, "Failed to load profile");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Runs only after auth is ready due to RequireAuthReady wrapper
    load();
  }, [load]);

  // Immediate avatar upload
  const handleSelectAvatar = useCallback(
    async (file) => {
      setError("");

      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        const msg = "Please choose a JPG, PNG, or WebP image.";
        setError(msg);
        toast.warning(msg);
        return;
      }
      if (file.size > MAX_AVATAR_BYTES) {
        const msg = "File too large. Please select an image under 5MB.";
        setError(msg);
        toast.warning(msg);
        return;
      }

      setSaving(true);
      try {
        const res = await updateAvatar(file); // expect { avatarUrl }
        // Local page state
        setUser((prev) => (prev ? { ...prev, avatar_url: res.avatarUrl } : prev));
        // Global auth state => Navbar updates instantly
        updateAuthUser?.({
          avatar_url: res.avatarUrl,
          // Optional: bump a version to force <img> reload if URL is reused
          avatar_version: Date.now(),
        });
        setAvatarFile(null);
        toast.success("Avatar updated");
      } catch (e) {
        const msg = toMessage(e, "Failed to update avatar");
        setError(msg);
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    },
    [updateAuthUser]
  );

  // Save profile changes
  const handleSaveProfile = useCallback(
    async () => {
      if (!user) return;
      setError("");
      setSaving(true);
      try {
        let changed = false;

        if (name && name !== user.username) {
          await updateUsername(name);
          setUser((prev) => (prev ? { ...prev, username: name } : prev));
          updateAuthUser?.({ username: name }); // sync Navbar
          changed = true;
        }

        if (avatarFile) {
          const res = await updateAvatar(avatarFile);
          setUser((prev) => (prev ? { ...prev, avatar_url: res.avatarUrl } : prev));
          updateAuthUser?.({
            avatar_url: res.avatarUrl,
            avatar_version: Date.now(), // cache-buster
          });
          setAvatarFile(null);
          changed = true;
        }

        if (changed) {
          toast.success("Profile updated");
        } else {
          toast.info("No changes to save");
        }
      } catch (e) {
        const msg = toMessage(e, "Failed to save profile");
        setError(msg);
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    },
    [avatarFile, name, updateAuthUser, user]
  );

  // Subjects
  const handleAddSubject = useCallback(async (subjectName) => {
    const n = subjectName?.trim();
    if (!n) return;
    setError("");
    try {
      const res = await apiAddSubject(n);
      setSubjects((prev) => [...prev, { id: res.id, name: n }]);
      toast.success("Subject added");
    } catch (e) {
      const msg = toMessage(e, "Failed to add subject");
      setError(msg);
      toast.error(msg);
    }
  }, []);

  const handleDeleteSubject = useCallback(async (id) => {
    setError("");
    try {
      await apiDeleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      toast.success("Subject deleted");
    } catch (e) {
      const msg = toMessage(e, "Failed to delete subject");
      setError(msg);
      toast.error(msg);
    }
  }, []);

  // Page-level loading UI (same pattern as TasksPage)
  if (loading) {
    return <PageLoader label="Loading your profile…" />;
  }

  return (
    <>
      <FocusAlarmWatcher />
      <ProfileUI
        user={user}
        subjects={subjects}
        loading={loading}
        saving={saving}
        form={{ name, email }}
        onChange={{
          onChangeName: setName,
          onChangeAvatar: handleSelectAvatar,
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

export default function ProfilePage() {
  return (
    <RequireAuthReady>
      <ProfileInner />
    </RequireAuthReady>
  );
}