import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls window (and Lenis if present) to the top on every route change.
 * Prevents pages opening mid-scroll or at the bottom after navigation/refresh.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollTop = () => {
      const lenis = (window as any).__lenis;
      if (lenis?.scrollTo) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollTop();
    // Retry once after paint in case layout shifts
    const t = requestAnimationFrame(scrollTop);
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  return null;
}
