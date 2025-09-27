// src/utils/RequireAuthReady.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import AuthGateFallback from "../components/common/AuthGateFallback";

/**
 * Prevents children from mounting until status === "authenticated".
 * While status is "unknown", shows a default (or provided) fallback.
 * If "unauthenticated", renders nothing (ProtectedRoute will redirect).
 */
export default function RequireAuthReady({ children, fallback = <AuthGateFallback /> }) {
  const { status } = useAuth();

  if (status === "unknown") return fallback;
  if (status === "unauthenticated") return null; // ProtectedRoute handles redirect

  return children; // status === "authenticated"
}