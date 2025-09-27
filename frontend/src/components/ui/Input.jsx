// src/components/ui/Input.jsx
export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={
        'w-full h-10 rounded-md border bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 ' +
        'border-[rgb(var(--border))] px-3 text-sm ' +
        'placeholder:text-gray-400 dark:placeholder:text-gray-500 ' +
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ' +
        className
      }
      {...props}
    />
  );
}

export function TextArea({ className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={
        'w-full rounded-md border bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 ' +
        'border-[rgb(var(--border))] px-3 py-2 text-sm ' +
        'placeholder:text-gray-400 dark:placeholder:text-gray-500 ' +
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ' +
        className
      }
      {...props}
    />
  );
}

export function FieldError({ children }) {
  return <p className="text-xs text-red-600 mt-1">{children}</p>;
}

export function HelpText({ children }) {
  return <p className="text-xs text-gray-500 mt-1">{children}</p>;
}