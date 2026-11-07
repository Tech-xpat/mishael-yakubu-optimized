import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  /** Mount immediately (used when restoring a scroll position further down the page). */
  eager?: boolean;
  rootMargin?: string;
}

/** If a section's code or data fails to load, hide that section instead of blanking the whole page. */
class SectionBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('Section failed to load:', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Keeps below-the-fold sections (and the database SDK they pull in) out of the
 * first load. They mount just before they scroll into view, showing a skeleton
 * of the same size until the code and data arrive.
 */
export default function DeferredSection({ children, fallback, eager = false, rootMargin = '1000px 0px' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(eager);

  useEffect(() => {
    if (show) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref}>
      {show ? (
        <SectionBoundary>
          <Suspense fallback={fallback}>{children}</Suspense>
        </SectionBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
