// ==============================
// src/components/profile/ProfileUI.jsx
// Presentational: receives props + callbacks; no data fetching or navigation.
// Designers can freely change markup and styles without touching logic.
// ==============================
import React, { useMemo, useState } from "react";

/**
 * Props contract (keep stable):
 * - user: { id, username, email, avatar_url? }
 * - subjects: Array<{ id: number|string, name: string }>
 * - form: { name: string, email: string }
 * - loading: boolean
 * - saving: boolean
 * - error: string
 * - onChange: {
 *     onChangeName(value: string): void,
 *     onChangeAvatar(file: File): void,
 *     onAddSubject(name: string): void
 *   }
 * - actions: {
 *     onSaveProfile(): void,
 *     onDeleteSubject(id: number|string): void,
 *   }
 */
export default function ProfileUI({
  user,
  subjects = [],
  loading = false,
  saving = false,
  error = "",
  form = { name: "", email: "" },
  onChange = {
    onChangeName: () => {},
    onChangeAvatar: () => {},
    onAddSubject: () => {},
  },
  actions = {
    onSaveProfile: () => {},
    onDeleteSubject: () => {},
  },
}) {
  const [newSubject, setNewSubject] = useState("");

  const avatarFallback = useMemo(() => {
    const seed = user?.username || "User";
    return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      seed
    )}`;
  }, [user?.username]);

  return (
    <div
      style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Profile</h1>
      </header>

      {/* Status and errors (announced to screen readers) */}
      {error ? (
        <div
          role="status"
          aria-live="polite"
          style={{ color: "crimson", marginTop: 12 }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <p style={{ marginTop: 12 }}>Loading…</p>
      ) : (
        <>
          {/* Avatar + name */}
          <section style={{ marginTop: 24, textAlign: "center" }}>
            <img
              src={user?.avatar_url || avatarFallback}
              alt="Profile avatar"
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div style={{ marginTop: 8, fontWeight: 600 }}>
              {user?.username || form.name || "—"}
            </div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>Student</div>

            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <span
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                  }}
                >
                  Change avatar
                </span>
                <input
                  data-testid="input-avatar"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={saving} // prevent changes while saving
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validation is in the container
                      onChange.onChangeAvatar(file);
                    }
                  }}
                />
              </label>
            </div>
          </section>

          {/* Profile form */}
          <section style={{ marginTop: 24 }} aria-busy={saving}>
            <h3>Profile</h3>
            <div style={{ maxWidth: 420, display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Name</span>
                <input
                  data-testid="input-name"
                  value={form.name}
                  placeholder="Your name"
                  onChange={(e) => onChange.onChangeName(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Email</span>
                <input
                  data-testid="input-email"
                  value={form.email}
                  placeholder="Email"
                  readOnly
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    background: "#f9fafb",
                  }}
                />
              </label>

              <div>
                <button
                  data-testid="btn-save"
                  onClick={actions.onSaveProfile}
                  disabled={saving}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: "1px solid #111827",
                    background: "#111827",
                    color: "white",
                  }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {/* Refresh button removed */}
              </div>
            </div>
          </section>

          {/* Subjects */}
          <section style={{ marginTop: 24 }}>
            <h3>Subjects</h3>
            <div
              style={{
                background: "#f3f4f6",
                borderRadius: 8,
                padding: 12,
                maxWidth: 640,
              }}
            >
              {subjects.length === 0 && (
                <div style={{ color: "#6b7280", padding: "8px 0" }}>
                  No subjects yet.
                </div>
              )}
              {subjects.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <button
                    data-testid={`btn-delete-subject-${s.id}`}
                    onClick={() => actions.onDeleteSubject(s.id)}
                    aria-label={`Delete ${s.name}`}
                    title={`Delete ${s.name}`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  data-testid="input-new-subject"
                  placeholder="New subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    background: "white",
                  }}
                />
                <button
                  data-testid="btn-add-subject"
                  onClick={() => {
                    if (!newSubject.trim()) return;
                    onChange.onAddSubject(newSubject.trim());
                    setNewSubject("");
                  }}
                >
                  Add Subject
                </button>
              </div>
            </div>
          </section>

          {/* Preferences (non-functional placeholders) */}
          <section style={{ marginTop: 24 }}>
            <h3>Preferences</h3>
            <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" /> Dark Mode
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" /> Notifications
              </label>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
