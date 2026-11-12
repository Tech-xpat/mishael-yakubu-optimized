import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  /** How many empty items are folded away. Renders nothing when 0. */
  count: number;
  /** Singular noun shown on the toggle, e.g. "category" or "folder". */
  noun: string;
  /** Word before the noun on the button: "empty" (default) or e.g. "more". */
  adjective?: string;
  /** Plural of the noun when it is irregular, e.g. "categories". */
  plural?: string;
  children: ReactNode;
}

/**
 * Empty categories stay folded away until the visitor expands them, so the page
 * shows what actually has content in it instead of rows of blank cards.
 */
export default function EmptyFold({ count, noun, adjective = 'empty', plural, children }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  if (count === 0) return null;

  return (
    <div className="mt-6 md:mt-8">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="key-btn-outline inline-flex items-center gap-2.5 px-5 py-3 font-body text-xs font-semibold uppercase tracking-wider"
      >
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        {open ? 'Hide' : 'Show'} {count} {adjective} {count === 1 ? noun : plural ?? `${noun}s`}
      </button>

      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
          open ? 'mt-5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
