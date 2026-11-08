import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY } from '../lib/scrollTo';
import { isHomePath } from '../lib/sections';
import {
  clearHomeRestore,
  homeRestorePending,
  markHomeLeft,
  readHomeY,
  resetHomeScroll,
  saveHomeY,
} from '../lib/scrollRestore';

/**
 * Route scroll behaviour:
 *  - new pages open at the top
 *  - pressing Back from a portfolio folder returns to the exact spot on the home page
 *    (the portfolio menu) instead of jumping to the hero
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const previous = useRef<string | null>(null);

  // We own scroll restoration; the browser's own attempt fights with Lenis.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  // Remember the home-page scroll position while the visitor is on it.
  useEffect(() => {
    if (!isHomePath(pathname)) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (isHomePath(window.location.pathname)) saveHomeY(window.scrollY);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const from = previous.current;
    previous.current = pathname;

    const home = isHomePath(pathname);
    if (from !== null && isHomePath(from) && !home) markHomeLeft();

    // Back to the home page from another in-app page: put them where they were.
    if (home && navType === 'POP' && from !== null && !isHomePath(from) && homeRestorePending()) {
      const y = readHomeY();
      clearHomeRestore();
      return restoreScroll(y);
    }

    if (home && navType !== 'POP') resetHomeScroll();

    const toTop = () => scrollToY(0, { immediate: true });
    toTop();
    const raf = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname, navType]);

  return null;
}

/** Re-apply the saved position while the page settles, unless the visitor starts scrolling. */
function restoreScroll(y: number) {
  let cancelled = false;
  const stop = () => {
    cancelled = true;
  };
  const events: (keyof WindowEventMap)[] = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  events.forEach((ev) => window.addEventListener(ev, stop, { passive: true, once: true }));

  const apply = () => {
    if (!cancelled) scrollToY(y, { immediate: true });
  };
  apply();
  const raf = requestAnimationFrame(apply);
  const timers = [120, 350, 800, 1500].map((ms) => window.setTimeout(apply, ms));
  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    timers.forEach(window.clearTimeout);
    window.clearTimeout(refresh);
    events.forEach((ev) => window.removeEventListener(ev, stop));
  };
}
