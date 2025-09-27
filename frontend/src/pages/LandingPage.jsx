// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import LandingPageUI from "../components/landing-page/LandingPageUI";
import FancyLoader from "../components/landing-page/FancyLoader";

export default function LandingPage() {
  const { status, user, login, signup } = useAuth();
  const navigate = useNavigate();

  // Signup controlled inputs
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

  // Login controlled inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState(true);

  // Short intro overlay (optional)
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated") {
      if (user?.role === "admin") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [status, user, navigate]);

  // Error helpers
  const getErr = (e, fallback) =>
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    (typeof e === "string" ? e : "") ||
    fallback;

  const SUSPENDED_MSG = "Your account has been suspended.";
  const isSuspendedErr = (e) => {
    const code = e?.response?.status;
    const key = e?.response?.data?.error || e?.code;
    const url = e?.config?.url || e?.response?.config?.url;
    return (
      code === 403 &&
      ((typeof url === "string" && url.includes("/auth/login")) ||
        key === "account_suspended" ||
        key === "suspended" ||
        key === "ACCOUNT_SUSPENDED")
    );
  };

  // Handlers
  const handleSignup = async () => {
    setLoading(true);
    try {
      const u = await signup(signupEmail, signupPassword, signupUsername);
      toast.success("Account created! Welcome to Questly.");
      if (u?.role === "admin") navigate("/admin", { replace: true });
      else navigate("/profile", { replace: true });
    } catch (e) {
      if (isSuspendedErr(e))
        toast.error(e?.response?.data?.message || SUSPENDED_MSG);
      else toast.error(getErr(e, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const u = await login(loginEmail, loginPassword, {
        remember: loginRemember,
      });
      toast.success("Welcome back!");
      if (u?.role === "admin") navigate("/admin", { replace: true });
      else navigate("/tasks", { replace: true });
    } catch (e) {
      if (isSuspendedErr(e))
        toast.error(e?.response?.data?.message || SUSPENDED_MSG);
      else toast.error(getErr(e, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  // Show overlay without altering document flow
  const showOverlay = intro || loading || status === "unknown";

  return (
    <>
      <FancyLoader show={showOverlay} />
      <LandingPageUI
        // Signup props
        signupEmail={signupEmail}
        signupPassword={signupPassword}
        signupUsername={signupUsername}
        onChangeSignupEmail={setSignupEmail}
        onChangeSignupPassword={setSignupPassword}
        onChangeSignupUsername={setSignupUsername}
        onSignup={handleSignup}
        // Login props
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        loginRemember={loginRemember}
        onChangeLoginEmail={setLoginEmail}
        onChangeLoginPassword={setLoginPassword}
        onChangeLoginRemember={setLoginRemember}
        onLogin={handleLogin}
        // UI
        loading={showOverlay}
      />
    </>
  );
}
