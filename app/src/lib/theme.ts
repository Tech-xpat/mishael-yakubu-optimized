import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const KEY = 'theme';
const META_COLOR: Record<Theme, string> = { dark: '#000000', light: '#f5f5f2' };

/** The visitor's saved choice (dark until they pick otherwise). */
export function getSavedTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Paint a theme on the page without saving it. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (root.getAttribute('data-theme') === theme) return;
  root.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
  listeners.forEach((l) => l());
}

/** Switch theme with a soft cross-fade and remember it. */
export function setTheme(theme: Theme) {
  const root = document.documentElement;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 520);
  }
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: the choice just lasts for this visit */
  }
  applyTheme(theme);
}

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const snapshot = (): Theme => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, snapshot, () => 'dark');
}
