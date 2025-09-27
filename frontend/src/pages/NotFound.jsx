// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function NotFound() {
  // Use the exact keys the AuthContext provides
  const { status, user } = useAuth();           // <- direct call, no ?.
  const isAuthed = status === "authenticated";

  const cta = isAuthed
    ? { to: "/dashboard", label: "Go to your Dashboard" }
    : { to: "/", label: "Go to the landing page" };

  return (
    <>
      <FocusAlarmWatcher />

      <main className="min-h-[65dvh] grid place-items-center px-4 py-16 text-[rgb(var(--fg))]">
        <section className="w-full max-w-2xl text-center">
          <div className="mb-3">
            <span className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2 text-sm font-semibold">
              Error
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            404
          </h1>

          <p className="mt-3 text-base md:text-lg text-[rgb(var(--muted))]">
            We couldn’t find the page you were looking for.
          </p>

          {isAuthed && (
            <p className="mt-2 text-sm">
              Signed in as <strong>{user?.username || user?.name || user?.email}</strong>
            </p>
          )}

          <div className="mt-8 flex justify-center">
            <Link to={cta.to}>
              <Button>{cta.label}</Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}