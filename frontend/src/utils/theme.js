// src/utils/theme.js

const THEME_KEY = 'theme'; // 'light' | 'dark' | 'system' (or null = system)

/**
 * Read saved theme. Returns 'light' | 'dark' | 'system' | null
 */
export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

/**
 * Is the OS currently in dark mode?
 */
export function isSystemDark() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

/**
 * Resolve the effective theme ('light' | 'dark') based on:
 * - explicit user choice (light/dark)
 * - system preference if 'system' or unset
 */
export function resolveEffectiveTheme(stored = getStoredTheme()) {
  if (stored === 'light' || stored === 'dark') return stored;
  return isSystemDark() ? 'dark' : 'light';
}

/**
 * Apply an effective theme to the DOM (.dark on <html>)
 */
export function applyEffectiveTheme(effective /* 'light' | 'dark' */) {
  const root = document.documentElement;
  root.classList.toggle('dark', effective === 'dark');
}

/**
 * Persist the user's preference. Accepts 'light' | 'dark' | 'system'
 */
export function setThemePreference(pref) {
  try {
    if (pref === 'system') localStorage.setItem(THEME_KEY, 'system');
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // no-op
  }
  applyEffectiveTheme(resolveEffectiveTheme(pref));
}

/**
 * Initialize once on page load, before React renders.
 * - Applies current theme (based on saved or system)
 * - Subscribes to system changes if preference is 'system'
 * - Subscribes to cross-tab storage changes
 * Returns an unsubscribe function.
 */
export function initTheme() {
  // 1) Apply immediately to avoid FOUC
  applyEffectiveTheme(resolveEffectiveTheme());

  // 2) React to system changes only if user preference is 'system'
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onMqChange = () => {
    const stored = getStoredTheme();
    if (!stored || stored === 'system') {
      applyEffectiveTheme(resolveEffectiveTheme('system'));
    }
  };
  mq.addEventListener?.('change', onMqChange);

  // 3) Cross-tab sync (if user toggles in another tab)
  const onStorage = (e) => {
    if (e.key === THEME_KEY) {
      applyEffectiveTheme(resolveEffectiveTheme(e.newValue));
    }
  };
  window.addEventListener('storage', onStorage);

  // 4) Return cleanup
  return () => {
    mq.removeEventListener?.('change', onMqChange);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Inline boot helper: call as early as possible in index.html <head>
 * to apply the correct class before first paint.
 */
export function inlineBootScript() {
  return `(function(){try{var k='${THEME_KEY}';var s=localStorage.getItem(k);var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=(s==='dark')||(!s||s==='system')&&m;document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`;
}