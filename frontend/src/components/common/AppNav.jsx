import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkStyle = ({ isActive }) => ({
  padding: "8px 10px",
  borderRadius: 8,
  textDecoration: "none",
  color: isActive ? "#111827" : "#4b5563",
  background: isActive ? "#e5e7eb" : "transparent",
});

export default function AppNav() {
  const navigate = useNavigate();
  const { status, user, logout } = useAuth();

  const avatarSrc = useMemo(() => {
    const name = user?.username || "User";
    const fallback = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      name
    )}`;
    return user?.avatar_url || fallback;
  }, [user?.avatar_url, user?.username]);

  if (status !== "authenticated") return null;

  return (
    <nav
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        justifyContent: "space-between",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{ fontWeight: 700, cursor: "pointer" }}
          onClick={() => navigate("/profile")}
          title="Home"
        >
          Questly
        </div>

        <NavLink to="/tasks" style={linkStyle}>
          Tasks
        </NavLink>
        <NavLink to="/study" style={linkStyle}>
          Study Planner
        </NavLink>
        <NavLink to="/notekeeper" style={linkStyle}>
          Note Keeper
        </NavLink>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Profile avatar button */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          title="Profile"
          aria-label="Go to profile"
          style={{
            padding: 0,
            border: "1px solid #e5e7eb",
            borderRadius: 999,
            background: "#f9fafb",
            width: 36,
            height: 36,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            cursor: "pointer", // <-- pointer on hover
          }}
        >
          <img
            src={avatarSrc}
            alt={
              user?.username ? `${user.username}'s avatar` : "Profile avatar"
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer", // <-- ensures pointer when hovering the image
            }}
          />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          style={{
            padding: "6px 10px",
            border: "1px solid #ef4444",
            color: "white",
            background: "#ef4444",
            borderRadius: 6,
            cursor: "pointer", // <-- pointer on hover
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
