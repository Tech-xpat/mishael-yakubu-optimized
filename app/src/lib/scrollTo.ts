type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: { offset?: number; duration?: number; immediate?: boolean; force?: boolean }
  ) => void;
};

export const getLenis = (): LenisLike | undefined => (window as any).__lenis;

/** Smoothly scroll to a CSS selector (e.g. "#portfolio") through Lenis, with a native fallback. */
export function scrollToTarget(selector: string, opts: { immediate?: boolean } = {}) {
  if (selector === '#home') {
    scrollToY(0, opts);
    return;
  }
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.2, immediate: opts.immediate });
  } else {
    el.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
  }
}

export function scrollToY(y: number, opts: { immediate?: boolean } = {}) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(y, { duration: 1.2, immediate: opts.immediate, force: opts.immediate });
  }
  if (!lenis || opts.immediate) {
    window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior });
  }
}
