/** Tiny sessionStorage cache so data-driven sections paint instantly on return visits / Back. */

export function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(`cache:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown) {
  try {
    sessionStorage.setItem(`cache:${key}`, JSON.stringify(value));
  } catch {
    /* storage full or blocked: skip */
  }
}
