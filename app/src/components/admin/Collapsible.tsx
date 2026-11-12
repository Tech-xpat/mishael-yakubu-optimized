import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  icon?: ReactNode;
  /** Small text on the right of the header, e.g. a count. */
  badge?: ReactNode;
  defaultOpen?: boolean;
  /** Remembers open/closed for the session. */
  storageKey?: string;
  /** Render the content only once it has been opened (keeps heavy editors out until needed). */
  lazyMount?: boolean;
  children: ReactNode;
}

/** A dropdown section: tap the header to fold long content away. Big tap target for phones. */
export default function Collapsible({ title, icon, badge, defaultOpen = false, storageKey, lazyMount = false, children }: Props) {
  const key = storageKey ? `admin:open:${storageKey}` : null;
  const [open, setOpen] = useState(() => {
    if (!key) return defaultOpen;
    try {
      const v = sessionStorage.getItem(key);
      return v === null ? defaultOpen : v === '1';
    } catch {
      return defaultOpen;
    }
  });
  const id = useId();
  const [seen, setSeen] = useState(open);
  useEffect(() => {
    if (open) setSeen(true);
  }, [open]);

  // Other parts of the page can ask a section to open: window.dispatchEvent(new CustomEvent('admin-open', { detail: key }))
  useEffect(() => {
    if (!storageKey) return;
    const onOpen = (e: Event) => {
      if ((e as CustomEvent).detail === storageKey) setOpen(true);
    };
    window.addEventListener('admin-open', onOpen);
    return () => window.removeEventListener('admin-open', onOpen);
  }, [storageKey]);

  useEffect(() => {
    if (!key) return;
    try {
      sessionStorage.setItem(key, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [key, open]);

  return (
    <section id={storageKey ? `admin-${storageKey.replace(/[^a-z0-9]/gi, '-')}` : undefined} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left sm:px-6"
      >
        {icon && <span className="shrink-0 text-white/70">{icon}</span>}
        <span className="flex-1 text-base font-semibold sm:text-lg">{title}</span>
        {badge !== undefined && badge !== null && (
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">{badge}</span>
        )}
        <ChevronDown size={20} className={`shrink-0 text-white/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={id}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 p-4 sm:p-6">{lazyMount && !seen ? null : children}</div>
        </div>
      </div>
    </section>
  );
}
