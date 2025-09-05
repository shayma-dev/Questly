import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNav from "../components/common/AppNav";

export default function NotFound() {
  const { status, user } = useAuth();
  const isAuthed = status === "authenticated";

  // Where to send the user back
  const cta = isAuthed
    ? { to: "/profile", label: "Go to your profile" }
    : { to: "/", label: "Go to the landing page" };

  return (
    <>
      {isAuthed && <AppNav />}

      {/* Main content */}
      <main
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "32px 16px",
        }}
      >
        {" "}
        <section style={{ textAlign: "center", maxWidth: 520 }}>
          {" "}
          <h1 style={{ fontSize: 48, margin: 0 }}>404</h1>{" "}
          <p style={{ color: "#6b7280", marginTop: 8 }}>
            {" "}
            We couldn’t find the page you were looking for.{" "}
          </p>
          {isAuthed && (
            <p style={{ marginTop: 12, color: "#374151" }}>
              {" "}
              Signed in as <strong>{user?.username}</strong>{" "}
            </p>
          )}{" "}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {" "}
            <Link
              to={cta.to}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                background: "#111827",
                color: "white",
                textDecoration: "none",
              }}
            >
              {" "}
              {cta.label}{" "}
            </Link>{" "}
            <Link
              to={-1}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                background: "white",
              }}
            >
              {" "}
              Go back{" "}
            </Link>{" "}
          </div>{" "}
        </section>{" "}
      </main>{" "}
    </>
  );
}
