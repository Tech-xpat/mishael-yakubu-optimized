import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * One shared smooth-scroll engine for the whole site (home, gallery, category pages).
 * - Wheel scrolling is eased with a low-pass (lerp) so it glides instead of stepping.
 * - Touch keeps the browser's native momentum, which is the smoothest option on phones.
 * - Disabled for the admin area and for visitors who prefer reduced motion.
 */
export default function SmoothScroll() {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/greatness');

  useEffect(() => {
    if (admin) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });
    (window as any).__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Late layout shifts (fonts, images) change page height: keep Lenis + triggers in sync.
    const sync = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', sync);
    document.fonts?.ready.then(sync).catch(() => undefined);

    return () => {
      window.removeEventListener('load', sync);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if ((window as any).__lenis === lenis) delete (window as any).__lenis;
    };
  }, [admin]);

  // Page height changes after load (skeletons swap for real content, sections fold open, images arrive).
  // Scroll animations must re-measure when that happens, or sections further down can stay hidden.
  useEffect(() => {
    if (admin || typeof ResizeObserver === 'undefined') return;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        (window as any).__lenis?.resize?.();
        ScrollTrigger.refresh();
      }, 120);
    });
    ro.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [admin, pathname]);

  return null;
}
