// src/components/ui/ThemeButton.jsx
import { useEffect, useState } from 'react';
import {
  getStoredTheme,
  resolveEffectiveTheme,
  setThemePreference,
} from '../../utils/theme';

export default function ThemeButton({ className = '' }) {
  const [effective, setEffective] = useState(resolveEffectiveTheme());

  // keep in sync with system/storage changes via native events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'theme') setEffective(resolveEffectiveTheme(e.newValue));
    };
    window.addEventListener('storage', onStorage);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMqChange = () => {
      const stored = getStoredTheme();
      if (!stored || stored === 'system') {
        setEffective(resolveEffectiveTheme('system'));
      }
    };
    mq.addEventListener?.('change', onMqChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      mq.removeEventListener?.('change', onMqChange);
    };
  }, []);

  function toggle() {
    const next = effective === 'dark' ? 'light' : 'dark';
    setThemePreference(next);      // persists and applies
    setEffective(next);            // immediate UI update
  }

  const isDark = effective === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
        'border-[rgb(var(--border))] bg-[rgb(var(--card))]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      ].join(' ')}
    >
      {/* Sun icon when dark (suggest switching to light) */}
      <svg
        className={`h-5 w-5 ${isDark ? 'text-gray-100 block' : 'hidden'}`}
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z"/>
      </svg>

      {/* Moon icon when light (suggest switching to dark) */}
      <svg
        className={`h-5 w-5 ${!isDark ? 'text-gray-800 dark:text-gray-100 block' : 'hidden'}`}
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M11.675 2.015a.998.998 0 0 0-.403.011C6.09 2.4 2 6.722 2 12c0 5.523 4.477 10 10 10 4.356 0 8.058-2.784 9.43-6.667a1 1 0 0 0-1.02-1.33c-.08.006-.105.005-.127.005h-.001l-.028-.002A5.227 5.227 0 0 0 20 14a8 8 0 0 1-8-8c0-.952.121-1.752.404-2.558a.996.996 0 0 0 .096-.428V3a1 1 0 0 0-.825-.985Z"/>
      </svg>
    </button>
  );
}