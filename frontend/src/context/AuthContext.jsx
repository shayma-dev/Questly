import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState("unknown"); // unknown|authenticated|unauthenticated
  const [user, setUser] = useState(null);

  const refresh = async () => {
    try {
      const { data } = await api.get("/auth/session");
      setUser(data.user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email, password) => {
    await api.post("/auth/login", { email, password });
    await refresh();
  };

  const signup = async (email, password, username) => {
    await api.post("/auth/signup", { email, password, username });
    await refresh();
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Logout request failed:", e?.response?.data || e.message);
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  return (
    <AuthContext.Provider
      value={{ status, user, login, signup, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
