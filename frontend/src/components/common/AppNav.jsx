// src/components/app/AppNav.jsx
import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeButton from "../ui/ThemeButton";

function navLinkClass({ isActive }) {
  return [
    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
      : "text-black hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
  ].join(" ");
}

export default function AppNav() {
  const navigate = useNavigate();
  const { status, user, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile menu state

  const avatarSrc = useMemo(() => {
    const name = user?.username || "User";
    const fallback = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;
    const base = user?.avatar_url || fallback;
    const v = user?.avatar_version || user?.updated_at || null;
    return v
      ? `${base}${base.includes("?") ? "&" : "?"}v=${encodeURIComponent(v)}`
      : base;
  }, [
    user?.avatar_url,
    user?.username,
    user?.avatar_version,
    user?.updated_at,
  ]);

  if (status !== "authenticated") return null;

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <nav
        className="
          sticky top-0 z-40
          border-b border-[rgb(var(--border))]
          bg-[rgb(var(--bg))]
          text-[rgb(var(--fg))]
          backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/80
        "
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          {/* Left: brand + desktop links */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              title="Home"
              className="flex items-center gap-2 hover:opacity-90"
            >
              <img
                src="/QuestlyLogo.svg"
                alt="Questly"
                className="h-8 w-8 shrink-0"
              />
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Questly
              </span>
            </button>

            {/* Desktop links only (hidden on mobile) */}
            <div className="hidden items-center gap-1 sm:flex">
              <NavLink to="/tasks" className={navLinkClass}>
                Tasks
              </NavLink>
              <NavLink to="/study" className={navLinkClass}>
                Study Planner
              </NavLink>
              <NavLink to="/focus" className={navLinkClass}>
                Focus
              </NavLink>
              <NavLink to="/notekeeper" className={navLinkClass}>
                Note Keeper
              </NavLink>
            </div>
          </div>

          {/* Right: Theme + Profile always visible, hamburger for the rest */}
          <div className="flex items-center gap-2">
            {/* Theme button */}
            <ThemeButton />

            {/* Profile avatar */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              title="Profile"
              aria-label="Go to profile"
              className="inline-flex h-9 w-9 items-center justify-center"
            >
              <img
                src={avatarSrc}
                alt={
                  user?.username
                    ? `${user.username}'s avatar`
                    : "Profile avatar"
                }
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {/* Hamburger menu: only on mobile */}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 sm:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  className="text-[rgb(var(--fg))]"
                  aria-hidden
                >
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  className="text-[rgb(var(--fg))]"
                  aria-hidden
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            {/* Desktop logout */}
            <button
              type="button"
              onClick={logout}
              className="hidden sm:inline-flex items-center justify-center rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu sheet */}
        <div
          className={[
            "sm:hidden overflow-hidden border-t border-[rgb(var(--border))]",
            "transition-[max-height,opacity] duration-200 ease-out",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
          aria-hidden={!open}
        >
          <div className="px-4 py-3 grid gap-2 bg-[rgb(var(--bg))]">
            <div className="grid gap-1">
              <button
                className={navLinkClass({ isActive: false })}
                onClick={() => go("/tasks")}
              >
                Tasks
              </button>
              <button
                className={navLinkClass({ isActive: false })}
                onClick={() => go("/study")}
              >
                Study Planner
              </button>
              <button
                className={navLinkClass({ isActive: false })}
                onClick={() => go("/focus")}
              >
                Focus
              </button>
              <button
                className={navLinkClass({ isActive: false })}
                onClick={() => go("/notekeeper")}
              >
                Note Keeper
              </button>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
