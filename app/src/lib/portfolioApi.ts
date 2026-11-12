/**
 * Lightweight read-only access to the Supabase `portfolio_items` table.
 * Uses the REST endpoint directly so the public pages don't need to download
 * the full supabase-js client (that stays in the admin area only).
 */
import { readCache, writeCache } from './cache';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mmnsovgpmojjeqajbcfo.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category?: string;
  subcategory?: string | null;
  website_url?: string | null;
  media_type?: string | null;
  priority?: number | null;
  created_at?: string;
}

async function rest<T>(query: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_items?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/* ---------- folder counts (home page) ---------- */

const COUNTS_KEY = 'portfolio-counts';
let countsPromise: Promise<Record<string, number>> | null = null;

export function cachedCounts(): Record<string, number> | null {
  return readCache<Record<string, number>>(COUNTS_KEY);
}

export function fetchCounts(): Promise<Record<string, number>> {
  if (!countsPromise) {
    countsPromise = rest<{ category: string | null }[]>('select=category')
      .then((rows) => {
        const counts: Record<string, number> = {};
        rows.forEach((row) => {
          const cat = row.category || 'web';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        writeCache(COUNTS_KEY, counts);
        return counts;
      })
      .finally(() => {
        // allow a fresh request next time (e.g. after Back)
        setTimeout(() => (countsPromise = null), 2000);
      });
  }
  return countsPromise;
}

/* ---------- gallery items (one folder) ---------- */

const memory = new Map<string, PortfolioItem[]>();
const inflight = new Map<string, Promise<PortfolioItem[]>>();

/**
 * Site order. Position 1 shows first, then 2, then 3 and so on. Items without a position
 * (0 or empty) come after the numbered ones, newest first. The admin library uses this too,
 * so what you see there is exactly what visitors see.
 */
export function comparePosition(a: PortfolioItem, b: PortfolioItem): number {
  const pa = a.priority && a.priority > 0 ? a.priority : 0;
  const pb = b.priority && b.priority > 0 ? b.priority : 0;
  if (pa && pb && pa !== pb) return pa - pb;
  if (!!pa !== !!pb) return pa ? -1 : 1;
  return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
}

function sortItems(items: PortfolioItem[]): PortfolioItem[] {
  return [...items].sort(comparePosition);
}

/** Items already fetched this session (instant paint), if any. */
export function cachedItems(category: string): PortfolioItem[] | null {
  return memory.get(category) ?? readCache<PortfolioItem[]>(`gallery:${category}`);
}

export function fetchItems(category: string): Promise<PortfolioItem[]> {
  const existing = inflight.get(category);
  if (existing) return existing;
  const p = rest<PortfolioItem[]>(`select=*&category=eq.${encodeURIComponent(category)}`)
    .then((rows) => {
      const sorted = sortItems(rows);
      memory.set(category, sorted);
      writeCache(`gallery:${category}`, sorted);
      return sorted;
    })
    .finally(() => inflight.delete(category));
  inflight.set(category, p);
  return p;
}

/** Warm the cache (called on hover / touch of a folder so the gallery opens instantly). */
export function prefetchItems(category: string) {
  if (memory.has(category) || inflight.has(category)) return;
  fetchItems(category).catch(() => undefined);
}
