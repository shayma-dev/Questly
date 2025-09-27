/* eslint-disable no-unused-vars */
// src/components/landing-page/LandingPageUI.jsx
import React, { useMemo, useState } from "react";
import ThemeButton from "../ui/ThemeButton";
import Modal from "../ui/Modal";
import Card, { CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { Input } from "../ui/Input";

import {
  IconTasksFeature,
  IconPlannerFeature,
  IconFocusFeature,
  IconNotesFeature,
  IconHabitsFeature,
  IconGroupsFeature,
} from "../icons/Icons";

import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

/* -------- Hero color anchors -------- */
const NeutralHeroStyle = () => (
  <style>{`
    :root {
      --gradient-hero-from: #A8E4E0;
      --gradient-hero-via:  #D5F0FF;
      --gradient-hero-to:   #2563EB;
    }
    .dark {
      --hero-from: #0E2B33;
      --hero-via:  #2563EB;
      --hero-to:   #0A1218;
    }
  `}</style>
);

/* -------- Buttons -------- */
function GradientButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "group relative inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold",
        "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "text-black dark:text-white",
        "focus-visible:ring-black/30 dark:focus-visible:ring-white/40",
        "shadow-[0_10px_30px_-10px_rgba(39,100,170,0.45)]",
        className,
      ].join(" ")}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--hero-from), #000 8%) 0%, color-mix(in oklab, var(--hero-via), #000 8%) 45%, color-mix(in oklab, var(--hero-to), #000 8%) 100%)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-10 group-focus-visible:opacity-10 dark:group-hover:opacity-0 dark:group-focus-visible:opacity-0"
        style={{ background: "rgba(0,0,0,0.08)" }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-10 dark:group-hover:opacity-20"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.5) 0%, transparent 60%)",
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function SoftSecondary({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold",
        "bg-white/70 text-gray-900 shadow-sm backdrop-blur",
        "hover:bg-white active:scale-[0.99] transition",
        "dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* -------- Lightweight shimmer for skeletons -------- */
function Shimmer({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-[rgb(var(--border))]/40 ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
        style={{ animation: "shimmer 1.6s infinite" }}
      />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

/* -------- Main -------- */
export default function LandingPageUI({
  // Auth state/handlers
  signupEmail,
  signupPassword,
  signupUsername,
  loginEmail,
  loginPassword,
  loginRemember,
  onChangeSignupEmail,
  onChangeSignupPassword,
  onChangeSignupUsername,
  onChangeLoginEmail,
  onChangeLoginPassword,
  onChangeLoginRemember,
  onSignup,
  onLogin,
  loading,
}) {
  const [authMode, setAuthMode] = useState(null);

  const features = useMemo(
    () => [
      {
        key: "tasks",
        title: "Stay on top of work",
        desc: "Make a task, pick a date, and tick it off. Simple.",
        hue: 200,
        Icon: IconTasksFeature,
      },
      {
        key: "planner",
        title: "Plan your week fast",
        desc: "Block study sessions for the week in seconds.",
        hue: 180,
        Icon: IconPlannerFeature,
      },
      {
        key: "focus",
        title: "Focus without fuss",
        desc: "A clean timer with breaks and gentle stats.",
        hue: 250,
        Icon: IconFocusFeature,
      },
      {
        key: "notes",
        title: "Notes that stick",
        desc: "Keep links and notes by subject in markdown.",
        hue: 160,
        Icon: IconNotesFeature,
      },
      {
        key: "habits",
        title: "Build small wins",
        desc: "Create tiny routines and watch the streaks grow.",
        hue: 30,
        Icon: IconHabitsFeature,
      },
      {
        key: "groups",
        title: "Study together",
        desc: "Share tasks, cheer each other on, stay in sync.",
        hue: 300,
        Icon: IconGroupsFeature,
      },
    ],
    []
  );

  return (
    <div className="min-h-dvh text-[rgb(var(--fg))]">
      <NeutralHeroStyle />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/QuestlyLogo.svg"
              alt="Questly"
              className="h-9 w-9 shrink-0"
              loading="eager"
              decoding="async"
            />
            <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Questly
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeButton />
            <SoftSecondary
              onClick={() => setAuthMode("login")}
              className="hidden sm:inline-flex"
            >
              Log in
            </SoftSecondary>
            <GradientButton onClick={() => setAuthMode("signup")}>
              Get Started
            </GradientButton>
          </div>
        </div>
      </header>

      {/* HERO — Split Onboarding */}
      <section className="relative overflow-hidden">
        <HeroBackground />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-10 pt-12 md:grid-cols-[1.2fr_1fr] md:pb-16 md:pt-20">
          {/* Left: Promise + Bullets + Micro-proof */}
          <div className="space-y-5">
            <h1 className="banner-title text-balance">
              A calmer way to study and ship your goals.
            </h1>
            <p className="text-[rgb(var(--muted))]">
              Tasks, weekly planning, focus sessions, and tidy notes—designed to
              feel light. Questly keeps you moving without getting in the way.
            </p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { t: "One place for school", s: "Tasks, planner, notes" },
                { t: "Routines that stick", s: "Gentle streaks & stats" },
                { t: "Fast by design", s: "Keyboard friendly, minimal clicks" },
                { t: "Made for teams", s: "Share and study together" },
              ].map((x) => (
                <li
                  key={x.t}
                  className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3"
                >
                  <span
                    className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 20deg, var(--hero-to), var(--hero-from))",
                    }}
                  />
                  <div>
                    <div className="text-sm font-semibold">{x.t}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      {x.s}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Micro social proof */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[rgb(var(--muted))]">
              <span>Trusted by study groups at 20+ schools</span>
              <span className="h-1 w-1 rounded-full bg-[rgb(var(--muted))]/50" />
              <span>Avg. session length 42m</span>
              <span className="h-1 w-1 rounded-full bg-[rgb(var(--muted))]/50" />
              <span>Zero ads. Ever.</span>
            </div>
          </div>

          {/* Right: Inline Signup Card */}
          <InlineSignupCard
            // Wire directly to your existing handlers
            signupEmail={signupEmail}
            signupPassword={signupPassword}
            signupUsername={signupUsername}
            onChangeSignupEmail={onChangeSignupEmail}
            onChangeSignupPassword={onChangeSignupPassword}
            onChangeSignupUsername={onChangeSignupUsername}
            onSignup={onSignup}
            onOpenLogin={() => setAuthMode("login")}
            loading={loading}
          />
        </div>

        {/* Social proof strip */}
        <div className="mx-auto max-w-6xl px-4 pb-8">

        </div>
      </section>

      {/* FEATURES — “Stories” layout */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-6">
          <FeatureStory
            title="Plan it once, glide through the week"
            copy="Drag, drop, and block your study sessions. Your calendar stays tidy and predictable."
            Icon={IconPlannerFeature}
            hue={180}
            align="left"
          />
          <FeatureStory
            title="Stay focused, not rigid"
            copy="Pomodoro that feels gentle—break nudges, streaks, and a calm progress ring."
            Icon={IconFocusFeature}
            hue={250}
            align="right"
          />
          <FeatureStory
            title="Notes that follow your subjects"
            copy="Markdown notes attach to classes and topics so you always find what you saved."
            Icon={IconNotesFeature}
            hue={210}
            align="left"
          />
        </div>

        {/* Quick icon grid for the rest */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              key: "tasks",
              title: "Tasks that feel simple",
              desc: "Add, date, done. That’s it.",
              hue: 200,
              Icon: IconTasksFeature,
            },
            {
              key: "habits",
              title: "Build small wins",
              desc: "Light streaks, low pressure.",
              hue: 30,
              Icon: IconHabitsFeature,
            },
            {
              key: "groups",
              title: "Study together",
              desc: "Share tasks and stay in sync.",
              hue: 300,
              Icon: IconGroupsFeature,
            },
          ].map((f) => (
            <MiniFeature key={f.key} {...f} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Card className="banner-card overflow-hidden">
          <div className="banner-content flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Ready to make study time feel lighter?
              </h2>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                Create your free account. No credit card needed.
              </p>
            </div>
            <div className="flex gap-3">
              <GradientButton onClick={() => setAuthMode("signup")}>
                Create free account
              </GradientButton>
              <SoftSecondary onClick={() => setAuthMode("login")}>
                I already have an account
              </SoftSecondary>
            </div>
          </div>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgb(var(--border))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <span className="text-sm text-[rgb(var(--muted))]">
            © {new Date().getFullYear()} Questly
          </span>
          <span className="text-sm text-[rgb(var(--muted))]">
            Made for students
          </span>
        </div>
      </footer>

      {/* AUTH MODAL (still available for users preferring modal) */}
      <AuthModal
        open={!!authMode}
        mode={authMode}
        setMode={setAuthMode}
        loading={loading}
        onClose={() => setAuthMode(null)}
        // signup
        signupEmail={signupEmail}
        signupPassword={signupPassword}
        signupUsername={signupUsername}
        onChangeSignupEmail={onChangeSignupEmail}
        onChangeSignupPassword={onChangeSignupPassword}
        onChangeSignupUsername={onChangeSignupUsername}
        onSignup={onSignup}
        // login
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        loginRemember={loginRemember}
        onChangeLoginEmail={onChangeLoginEmail}
        onChangeLoginPassword={onChangeLoginPassword}
        onChangeLoginRemember={onChangeLoginRemember}
        onLogin={onLogin}
      />
    </div>
  );
}

/* -------- Visual bits -------- */
function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-24 h-[480px] blur-3xl"
      style={{
        background:
          "radial-gradient(60% 60% at 20% 30%, var(--hero-from) 0%, transparent 70%), radial-gradient(60% 60% at 80% 20%, var(--hero-via) 0%, transparent 70%), radial-gradient(70% 70% at 60% 70%, var(--hero-to) 0%, transparent 70%)",
        opacity: 0.38,
      }}
    />
  );
}

/* -------- Inline Signup Card -------- */
function InlineSignupCard({
  signupEmail,
  signupPassword,
  signupUsername,
  onChangeSignupEmail,
  onChangeSignupPassword,
  onChangeSignupUsername,
  onSignup,
  onOpenLogin,
  loading,
}) {
  const [localEmail, setLocalEmail] = useState(signupEmail || "");
  const [localPassword, setLocalPassword] = useState(signupPassword || "");
  const [localUsername, setLocalUsername] = useState(signupUsername || "");

  // Keep parent state in sync (no structural change)
  const syncAndSubmit = (e) => {
    e.preventDefault();
    onChangeSignupEmail(localEmail);
    onChangeSignupPassword(localPassword);
    onChangeSignupUsername(localUsername);
    onSignup(e);
  };

  return (
    <Card className="border border-[rgb(var(--border))] shadow-xl">
      <CardHeader
        title="Create your free account"
        actions={
          <button
            onClick={onOpenLogin}
            className="text-sm text-blue-600 hover:underline dark:text-blue-300"
          >
            I have an account
          </button>
        }
      />
      <CardBody>
        <form onSubmit={syncAndSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Username"
            value={localUsername}
            onChange={(e) => setLocalUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={localPassword}
            onChange={(e) => setLocalPassword(e.target.value)}
            required
          />
          <GradientButton
            type="submit"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </GradientButton>
          <p className="text-center text-xs text-[rgb(var(--muted))]">
            By continuing, you agree to our terms.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}

/* -------- Feature Story (alternating) -------- */
function FeatureStory({ title, copy, Icon, hue, align = "left" }) {
  const alignLeft = align === "left";
  return (
    <article
      className={[
        "relative grid items-center gap-6 overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6",
        "md:grid-cols-2",
      ].join(" ")}
    >
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 opacity-[0.25]",
          alignLeft ? "md:opacity-[0.30]" : "",
        ].join(" ")}
        style={{
          background: `radial-gradient(80% 80% at ${
            alignLeft ? "0% 0%" : "100% 0%"
          }, hsl(${hue} 90% 90% / 0.35), transparent 55%)`,
        }}
      />
      <div className={alignLeft ? "" : "md:order-2"}>
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 shrink-0 rounded-full"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 75% 60%), hsl(${hue} 80% 70%))` }}
          />
          <div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <p className="mt-1 max-w-prose text-sm text-[rgb(var(--muted))]">
              {copy}
            </p>
          </div>
        </div>
      </div>
      <div className={alignLeft ? "" : "md:order-1"}>
        <div className="flex items-center justify-center">
          <Icon
            style={{ width: 72, height: 72, color: `hsl(${hue} 80% 50%)` }}
            className="feature-icon-smooth"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}

/* -------- Mini Feature Card -------- */
function MiniFeature({ Icon, title, desc, hue }) {
  return (
    <article
      className="
        group relative overflow-hidden rounded-2xl
        border border-[rgb(var(--border))]
        bg-[rgb(var(--card))]
        p-6
        shadow-[0_8px_22px_-14px_rgba(2,6,23,0.14)]
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-18px_rgba(2,6,23,0.22)]
      "
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.3] transition-opacity duration-200 group-hover:opacity-45"
        style={{
          background: `radial-gradient(80% 80% at 50% -10%, hsl(${hue} 90% 90% / 0.35), transparent 55%)`,
        }}
      />
      <div className="relative flex flex-col items-center text-center">
        <Icon
          style={{ width: 56, height: 56, color: `hsl(${hue} 80% 50%)` }}
          className="feature-icon-smooth"
          aria-hidden
        />
        <h4 className="mt-3 text-[15px] font-semibold tracking-tight">
          {title}
        </h4>
        <p className="mt-2 max-w-[44ch] text-[13.5px] leading-6 text-[rgb(var(--muted))]">
          {desc}
        </p>
        <div
          className="mt-5 h-[2px] w-16 rounded-full opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent 0%, hsl(${hue} 80% 58%) 50%, transparent 100%)`,
          }}
        />
      </div>
    </article>
  );
}

/* -------- Auth Modal (kept for parity) -------- */
function AuthModal({
  open,
  mode,
  setMode,
  loading,
  onClose,
  // signup
  signupEmail,
  signupPassword,
  signupUsername,
  onChangeSignupEmail,
  onChangeSignupPassword,
  onChangeSignupUsername,
  onSignup,
  // login
  loginEmail,
  loginPassword,
  loginRemember,
  onChangeLoginEmail,
  onChangeLoginPassword,
  onChangeLoginRemember,
  onLogin,
}) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={mode === "signup" ? "Sign up" : "Log in"}
      size="md"
    >
      <Card className="w-full border border-[rgb(var(--border))] shadow-xl">
        <CardHeader
          title={mode === "signup" ? "Create your account" : "Welcome back"}
          actions={
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ×
            </button>
          }
        />
        <CardBody>
          {mode === "signup" ? (
            <SignupForm
              loading={loading}
              email={signupEmail}
              password={signupPassword}
              username={signupUsername}
              onChangeEmail={onChangeSignupEmail}
              onChangePassword={onChangeSignupPassword}
              onChangeUsername={onChangeSignupUsername}
              onSubmit={onSignup}
              onSwitchToLogin={() => setMode("login")}
              onCancel={onClose}
            />
          ) : (
            <LoginForm
              loading={loading}
              email={loginEmail}
              password={loginPassword}
              remember={loginRemember}
              onChangeEmail={onChangeLoginEmail}
              onChangePassword={onChangeLoginPassword}
              onChangeRemember={onChangeLoginRemember}
              onSubmit={onLogin}
              onSwitchToSignup={() => setMode("signup")}
              onCancel={onClose}
            />
          )}
        </CardBody>
      </Card>
    </Modal>
  );
}