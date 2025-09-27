// src/components/landing-page/SignupForm.jsx
import React, { useState, useMemo } from "react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";

/* Eye icons (use currentColor for light/dark compatibility) */
function EyeIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1.5 12s3.5-7.5 10.5-7.5S22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function EyeOffIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M9.88 9.88A3.25 3.25 0 0012 15.25m0 0a3.24 3.24 0 002.12-.87M12 15.25A3.25 3.25 0 008.75 12c0-.61.17-1.18.47-1.66M5.54 5.54C3.7 6.8 2.36 8.49 1.5 12c0 0 3.5 7.5 10.5 7.5 2.44 0 4.48-.63 6.14-1.62M18.7 15.88C21.28 14.1 22.5 12 22.5 12c-.62-1.96-2.26-4.28-4.8-5.95"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export default function SignupForm({
  loading,
  email,
  password,
  username,
  onChangeEmail,
  onChangePassword,
  onChangeUsername,
  onSubmit,
  onSwitchToLogin,
  onCancel,
}) {
  const [confirmPassword, setConfirmPassword] = useState("");

  // show/hide toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordType = useMemo(() => (showPassword ? "text" : "password"), [showPassword]);
  const confirmType = useMemo(() => (showConfirm ? "text" : "password"), [showConfirm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (String(password || "") !== String(confirmPassword || "")) {
      toast.error("Passwords do not match");
      return;
    }
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <FormField label="Username">
        <Input
          placeholder="e.g., alex"
          value={username}
          onChange={(e) => onChangeUsername?.(e.target.value)}
          required
        />
      </FormField>

      <FormField label="Email">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onChangeEmail?.(e.target.value)}
          required
        />
      </FormField>

      <FormField label="Password">
        <div className="relative">
          <Input
            type={passwordType}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onChangePassword?.(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto grid h-8 w-8 place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </FormField>

      <FormField label="Confirm password">
        <div className="relative">
          <Input
            type={confirmType}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto grid h-8 w-8 place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            title={showConfirm ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirm ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </FormField>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </div>

      <SwitchLine text="Already have an account?" link="Log in" onClick={onSwitchToLogin} />
    </form>
  );
}

/* Local helpers (scoped) */
function FormField({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-gray-600 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}
function SwitchLine({ text, link, onClick }) {
  return (
    <div className="pt-1 text-center text-xs text-[rgb(var(--muted))]">
      {text}{" "}
      <button type="button" className="underline hover:no-underline" onClick={onClick}>
        {link}
      </button>
    </div>
  );
}