import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LandingPageUI from "../components/landing-page/LandingPageUI";
import AppNav from "../components/common/AppNav";

export default function LandingPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await signup(signupEmail, signupPassword, signupUsername);
      navigate("/profile");
    } catch (e) {
      setError(e?.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate("/profile");
    } catch (e) {
      setError(e?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LandingPageUI
        signupEmail={signupEmail}
        signupPassword={signupPassword}
        signupUsername={signupUsername}
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        onChangeSignupEmail={setSignupEmail}
        onChangeSignupPassword={setSignupPassword}
        onChangeSignupUsername={setSignupUsername}
        onChangeLoginEmail={setLoginEmail}
        onChangeLoginPassword={setLoginPassword}
        onSignup={handleSignup}
        onLogin={handleLogin}
        loading={loading}
        error={error}
      />
    </>
  );
}
