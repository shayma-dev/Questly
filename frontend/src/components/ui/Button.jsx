// src/components/ui/Button.jsx
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center font-semibold rounded-lg transition-all select-none " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const variants = {
  primary:
    "bg-[rgb(var(--btn-primary-bg))] text-[rgb(var(--btn-primary-fg))] " +
    "hover:bg-[rgb(var(--btn-primary-hover))] " +
    "shadow-sm hover:shadow-md active:shadow-sm active:translate-y-[1px]",
  secondary:
    "bg-[rgb(var(--btn-secondary-bg))] text-[rgb(var(--btn-secondary-fg))] hover:bg-[rgb(var(--btn-secondary-hover))]",
  outline:
    "border-2 border-[rgb(var(--btn-primary-bg))] text-[rgb(var(--btn-primary-bg))] " +
    "bg-transparent hover:bg-[rgb(var(--btn-primary-bg))] hover:text-[rgb(var(--btn-primary-fg))]",
  ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
};

export default function Button({ className, variant = "primary", size = "md", ...props }) {
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}