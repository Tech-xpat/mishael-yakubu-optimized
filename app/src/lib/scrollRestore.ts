/**
 * Remembers where the visitor was on the home page so that pressing Back from a
 * portfolio folder lands them on the portfolio menu again instead of the hero.
 */

const Y_KEY = 'home:scrollY';
const FLAG_KEY = 'home:restore';

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode / storage blocked: restoring is a nice-to-have */
  }
}

function safeRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function saveHomeY(y: number) {
  safeSet(Y_KEY, String(Math.max(0, Math.round(y))));
}

export function readHomeY(): number {
  const n = parseInt(safeGet(Y_KEY) || '0', 10);
  return Number.isFinite(n) ? n : 0;
}

/** Called when the visitor leaves the home page for another in-app page. */
export function markHomeLeft() {
  safeSet(FLAG_KEY, '1');
}

export function homeRestorePending(): boolean {
  return safeGet(FLAG_KEY) === '1' && readHomeY() > 0;
}

export function clearHomeRestore() {
  safeRemove(FLAG_KEY);
}

export function resetHomeScroll() {
  safeRemove(FLAG_KEY);
  safeRemove(Y_KEY);
}
