import { useEffect } from 'react';

/** Single source of truth for the canonical site address.
 *  Change this ONE line if the live domain changes. */
export const SITE_URL = 'https://www.mishael.space';
export const SITE_NAME = 'Mishael Yakubu';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SeoOptions {
  title: string;
  description: string;
  /** Path of the page, e.g. "/portfolio/web-development" */
  path: string;
  /** true = tell Google NOT to index (admin, 404, ...) */
  noindex?: boolean;
  image?: string;
  /** Extra JSON-LD objects for this page (e.g. BreadcrumbList) */
  jsonLd?: object[];
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Updates title, description, canonical, Open Graph, Twitter and robots for the current page. */
export function useSeo({ title, description, path, noindex, image, jsonLd }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path === '/' ? '' : path}`;
    const img = image || DEFAULT_IMAGE;

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setCanonical(url);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:url', url);
    setMeta('name', 'twitter:image', img);

    // Page-specific structured data
    const added: HTMLScriptElement[] = [];
    (jsonLd || []).forEach((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-page-jsonld', '1');
      s.text = JSON.stringify(obj).replace(/</g, '\\u003c');
      document.head.appendChild(s);
      added.push(s);
    });
    return () => added.forEach((s) => s.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, noindex, image, JSON.stringify(jsonLd)]);
}

/** BreadcrumbList helper */
export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === '/' ? '' : it.path}`,
    })),
  };
}
