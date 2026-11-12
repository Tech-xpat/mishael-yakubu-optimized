/**
 * The three sections under Portfolio on the home page (and their indexed pages) are views over the
 * same Supabase `portfolio_items` the admin writes to: category + subcategory decide where an item shows.
 */
import { BUILTIN_SUBCATEGORIES } from './categories';

export interface HomeSectionDef {
  /** URL part: /portfolio/<type>[/<subcategory-slug>] */
  type: string;
  /** portfolio_items.category it reads. */
  category: string;
  title: string;
  description: string;
}

export const HOME_SECTIONS: Record<string, HomeSectionDef> = {
  'web-development': {
    type: 'web-development',
    category: 'web',
    title: 'Web Development',
    description: 'Explore websites built for various industries and businesses.',
  },
  'brand-design': {
    type: 'brand-design',
    category: 'brand',
    title: 'Brand Design',
    description: 'Creative branding and design work.',
  },
  'ai-automation': {
    type: 'ai-automation',
    category: 'ai',
    title: 'AI Automation',
    description: 'AI-powered solutions and automation projects.',
  },
};

export const builtinSubs = (category: string) => BUILTIN_SUBCATEGORIES[category] || [];

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const isVideoUrl = (url?: string | null) => !!url?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
