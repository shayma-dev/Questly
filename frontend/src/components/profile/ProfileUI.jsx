// src/components/profile/ProfileUI.jsx
import React, { useMemo, useState } from "react";
import Button from "../ui/Button";
import Card, { CardBody, CardHeader } from "../ui/Card";
import { Input, Label } from "../ui/Input";
import { IconTrash } from "../icons/Icons";
import { subjectColor } from "../../utils/subjectColor";

export default function ProfileUI({
  user,
  subjects = [],
  loading = false,
  saving = false,
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
    <div className="mx-auto max-w-5xl px-4 py-6 text-[rgb(var(--fg))]">
      {loading ? (
        <div className="mt-6 text-sm text-[rgb(var(--muted))]">Loading…</div>
      ) : (
        <div className="mt-2 grid gap-6 md:grid-cols-2">
          {/* Profile card */}
          <Card>
            <CardHeader title="Your Profile" />
            <CardBody>
              <section className="text-center">
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
                  <img
                    src={user?.avatar_url || avatarFallback}
                    alt="Profile avatar"
                    className="h-24 w-24 rounded-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="mt-3">
                  <div className="font-semibold">
                    {user?.username || form.name || "—"}
                  </div>
                  <div className="text-xs text-[rgb(var(--muted))]">Student</div>
                </div>

                <div className="mt-4">
                  <label
                    className={[
                      "inline-block cursor-pointer rounded-md border border-[rgb(var(--border))] px-3 py-2 text-sm",
                      "bg-[rgb(var(--card))] hover:bg-[rgb(var(--card))]/80",
                      saving ? "pointer-events-none opacity-60" : "",
                    ].join(" ")}
                  >
                    <span>Change avatar</span>
                    <input
                      data-testid="input-avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={saving}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onChange.onChangeAvatar(file);
                      }}
                    />
                  </label>
                </div>
              </section>
            </CardBody>
          </Card>

          {/* Account details */}
          <Card>
            <CardHeader title="Account Details" />
            <CardBody>
              <div className="grid max-w-md gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    value={form.name}
                    placeholder="Your name"
                    onChange={(e) => onChange.onChangeName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    value={form.email}
                    placeholder="Email"
                    readOnly
                    className="bg-[rgb(var(--card))] text-[rgb(var(--fg))]"
                  />
                </div>

                <div className="pt-1">
                  <Button
                    data-testid="btn-save"
                    onClick={actions.onSaveProfile}
                    disabled={saving}
                    className={[
                      "bg-[rgb(var(--btn-primary-bg))] text-[rgb(var(--btn-primary-fg))]",
                      "hover:bg-[rgb(var(--btn-primary-hover))]",
                      saving ? "opacity-70" : "",
                    ].join(" ")}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Subjects */}
          <Card className="md:col-span-2">
            <CardHeader title="Subjects" />
            <CardBody>
              {subjects.length === 0 ? (
                <div className="py-2 text-sm text-[rgb(var(--muted))]">
                  No subjects yet.
                </div>
              ) : (
                <ul className="divide-y divide-[rgb(var(--border))]">
                  {subjects.map((s) => {
                    const c = subjectColor(s.id);
                    return (
                      <li
                        key={s.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {/* Colored dot */}
                          <span
                            className="inline-block h-3 w-3 flex-none rounded-full"
                            style={{ backgroundColor: c.text }}
                            aria-hidden="true"
                          />
                          {/* Subject name with tinted chip */}
                          <span
                            className="truncate rounded-full border px-3 py-1 text-sm"
                            style={{
                              backgroundColor: c.bg,
                              color: c.text,
                              borderColor: c.border,
                            }}
                            title={s.name}
                          >
                            {s.name}
                          </span>
                        </div>

                        <button
                          data-testid={`btn-delete-subject-${s.id}`}
                          onClick={() => actions.onDeleteSubject(s.id)}
                          aria-label={`Delete ${s.name}`}
                          title={`Delete ${s.name}`}
                          className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <IconTrash />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-3 flex gap-2">
                <Input
                  data-testid="input-new-subject"
                  placeholder="New subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="flex-1"
                />
                <Button
                  data-testid="btn-add-subject"
                  variant="secondary"
                  onClick={() => {
                    if (!newSubject.trim()) return;
                    onChange.onAddSubject(newSubject.trim());
                    setNewSubject("");
                  }}
                >
                  Add Subject
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}