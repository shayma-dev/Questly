/* eslint-disable react-hooks/exhaustive-deps */
// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState("unknown"); // "unknown" | "authenticated" | "unauthenticated"
  const [user, setUser] = useState(null);
  
  const [authError, setAuthError] = useState(null);

  const refresh = async () => {
    try {
      const { data } = await api.get("/auth/session");
      if (data?.user) {
        setUser(data.user);
        setStatus("authenticated");
        setAuthError(null);
        return data.user;
      } else {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email, password) => {
    try {
      await api.post("/auth/login", { email, password });
      const u = await refresh(); 
      return u;
    } catch (err) {
      const fallback =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Login failed";
      setAuthError(fallback);
      throw err;
    }
  };

  const signup = async (email, password, username) => {
    try {
      await api.post("/auth/signup", { email, password, username });
      await api.post("/auth/login", { email, password });
      const u = await refresh();
      return u;
    } catch (err) {
      setAuthError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Signup failed"
      );
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Logout request failed:", e?.response?.data || e.message);
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      setAuthError(null);
    }
  };
  const clearAuthError = () => setAuthError(null);

  // NEW: merge a patch into the current user object to update UI instantly
  const updateUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const value = useMemo(
    () => ({ status, user, login, signup, logout, refresh, updateUser, authError, clearAuthError}),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);