/**
 * Category registry.
 * Built-in folders ship with the site. Anything the admin adds in the dashboard is stored as a small
 * JSON file in the existing public `portfolio` storage bucket, so it needs no database changes and
 * shows up on the live site (home folders, gallery, upload form) without a redeploy.
 */
import { readCache, writeCache } from './cache';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mmnsovgpmojjeqajbcfo.supabase.co';

export const CONFIG_PATH = '_config/categories.json';
export const CONFIG_URL = `${SUPABASE_URL}/storage/v1/object/public/portfolio/${CONFIG_PATH}`;

export interface CategoryDef {
  slug: string;
  name: string;
  /** "video" folders get a play icon. */
  kind?: 'folder' | 'play';
  builtin?: boolean;
}

export const BUILTIN_CATEGORIES: CategoryDef[] = [
  { slug: 'web', name: 'Web Development', kind: 'folder', builtin: true },
  { slug: 'website', name: 'Live Websites', kind: 'folder', builtin: true },
  { slug: 'flyer', name: 'Flyers & Graphics', kind: 'folder', builtin: true },
  { slug: 'brand', name: 'Brand Design', kind: 'folder', builtin: true },
  { slug: 'ai', name: 'AI Automation', kind: 'folder', builtin: true },
  { slug: 'video', name: 'Videos', kind: 'play', builtin: true },
  { slug: 'motion', name: 'Motion Graphics', kind: 'play', builtin: true },
];

export const BUILTIN_SUBCATEGORIES: Record<string, string[]> = {
  flyer: ['Birthday Flyers', 'Church Flyers', 'Social Media Flyers', 'Event Flyers', 'Business Flyers', 'Other Flyers'],
  brand: ['Logo', 'Brand Identity', 'Social Media Kit', 'Other Branding'],
  video: ['Promo Videos', 'Testimonials', 'Tutorials', 'Other Videos'],
  motion: ['Logo Animation', 'Explainer', 'Social Motion', 'Other Motion'],
};

export interface CategoryConfig {
  /** Categories added by the admin. */
  custom: CategoryDef[];
  /** Extra subcategories per category slug (built-in or custom). */
  subs: Record<string, string[]>;
}

export const EMPTY_CONFIG: CategoryConfig = { custom: [], subs: {} };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export const titleCase = (slug: string) =>
  slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

function clean(raw: unknown): CategoryConfig {
  const r = (raw || {}) as Partial<CategoryConfig>;
  const custom = Array.isArray(r.custom)
    ? r.custom
        .filter((c) => c && typeof c.slug === 'string' && typeof c.name === 'string')
        .map((c) => ({ slug: c.slug, name: c.name, kind: c.kind === 'play' ? ('play' as const) : ('folder' as const) }))
    : [];
  const subs: Record<string, string[]> = {};
  if (r.subs && typeof r.subs === 'object') {
    for (const [k, v] of Object.entries(r.subs)) {
      if (Array.isArray(v)) subs[k] = v.filter((x) => typeof x === 'string');
    }
  }
  return { custom, subs };
}

const CACHE_KEY = 'category-config';

export function cachedConfig(): CategoryConfig | null {
  const c = readCache<CategoryConfig>(CACHE_KEY);
  return c ? clean(c) : null;
}

let inflight: Promise<CategoryConfig> | null = null;

/** Reads the registry. A missing file simply means "no custom categories yet". */
export function fetchConfig(fresh = false): Promise<CategoryConfig> {
  if (inflight && !fresh) return inflight;
  const bust = fresh ? Date.now() : Math.floor(Date.now() / 30000);
  const p = fetch(`${CONFIG_URL}?v=${bust}`, { cache: fresh ? 'no-store' : 'default' })
    .then(async (res) => {
      if (!res.ok) return EMPTY_CONFIG;
      return clean(await res.json());
    })
    .catch(() => cachedConfig() ?? EMPTY_CONFIG)
    .then((cfg) => {
      writeCache(CACHE_KEY, cfg);
      return cfg;
    })
    .finally(() => {
      setTimeout(() => (inflight = null), 2000);
    });
  inflight = p;
  return p;
}

/** Built-ins + admin-made categories + any slug found on items but not registered (so nothing is ever hidden). */
export function allCategories(cfg: CategoryConfig, seen: string[] = []): CategoryDef[] {
  const list: CategoryDef[] = [...BUILTIN_CATEGORIES];
  const have = new Set(list.map((c) => c.slug));
  for (const c of cfg.custom) {
    if (!have.has(c.slug)) {
      list.push(c);
      have.add(c.slug);
    }
  }
  for (const slug of seen) {
    if (slug && !have.has(slug)) {
      list.push({ slug, name: titleCase(slug), kind: 'folder' });
      have.add(slug);
    }
  }
  return list;
}

export function categoryName(slug: string, cfg: CategoryConfig = EMPTY_CONFIG): string {
  return allCategories(cfg).find((c) => c.slug === slug)?.name || titleCase(slug);
}

export function subcategoriesFor(slug: string, cfg: CategoryConfig, seen: string[] = []): string[] {
  const out: string[] = [];
  for (const s of [...(BUILTIN_SUBCATEGORIES[slug] || []), ...(cfg.subs[slug] || []), ...seen]) {
    if (s && !out.some((o) => o.toLowerCase() === s.toLowerCase())) out.push(s);
  }
  return out;
}
