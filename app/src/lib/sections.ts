/** The home-page sections: one list drives the navbar, footer links, deep links and address bar. */
export interface SiteSection {
  name: string;
  /** CSS selector of the section. */
  href: string;
  /** Clean URL shown in the address bar (and usable as a direct link). */
  path: string;
}

export const SECTIONS: SiteSection[] = [
  { name: 'Home', href: '#home', path: '/' },
  { name: 'About', href: '#about', path: '/about' },
  { name: 'Portfolio', href: '#portfolio', path: '/portfolio' },
  { name: 'Services', href: '#services', path: '/services' },
  { name: 'Contact', href: '#contact', path: '/contact' },
];

export const sectionForPath = (path: string) =>
  SECTIONS.find((s) => s.path === path.replace(/\/+$/, '') || (s.path === '/' && path === '/'));

/** Reflect the visible section in the address bar without touching the router or adding history entries. */
export function showSectionInUrl(path: string) {
  try {
    if (window.location.pathname !== path) window.history.replaceState(window.history.state, '', path);
  } catch {
    /* some browsers throttle history updates: the URL is cosmetic */
  }
}

/** True for "/" and every section path: they all render the same home page. */
export const isHomePath = (path: string) => SECTIONS.some((s) => s.path === path.replace(/\/+$/, '') || (s.path === '/' && path === '/'));
