import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { scrollToTarget } from '../lib/scrollTo';

const STEPS = [
  { t: 'Brief', d: 'Tell me what you need on WhatsApp. A short message is enough.' },
  { t: 'Scope', d: 'You get a clear list of what is included and the price before any work starts.' },
  { t: 'Design', d: 'Layouts, flyers or flows shared for your feedback. Designs arrive within 24 hours.' },
  { t: 'Build', d: 'Websites, bots and automations built and tested.' },
  { t: 'Launch', d: 'Everything goes live, and I stay reachable on WhatsApp afterwards.' },
];

interface Shipped { id: string; title: string; category: string; created_at: string }

const pretty = (slug: string) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const ago = (iso: string) => {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  return m < 12 ? `${m} mo ago` : `${Math.floor(m / 12)} yr ago`;
};

export default function Process() {
  const [rows, setRows] = useState<Shipped[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      supabase
        .from('portfolio_items')
        .select('id,title,category,created_at')
        .order('created_at', { ascending: false })
        .limit(6)
        .then(({ data, error }) => {
          if (alive) setRows(error ? [] : ((data ?? []) as Shipped[]));
        });
    load();
    // New uploads appear without a refresh (works once Realtime is enabled on the table; harmless otherwise).
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('shipped-feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portfolio_items' }, load)
        .subscribe();
    } catch {
      /* optional */
    }
    return () => {
      alive = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="process" className="relative bg-black px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mono-label mb-4">03 / Process</p>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
          From message to launch in five steps.
        </h2>

        <ol className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.t} className="bg-black p-5 sm:p-6">
              <span className="mono-label">0{i + 1}</span>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">{s.t}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/60">{s.d}</p>
            </li>
          ))}
        </ol>

        {rows === null || rows.length > 0 ? (
          <div className="mt-16 grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <div>
              <p className="mono-label mb-4 flex items-center gap-3"><span className="signal-dot" aria-hidden="true" />Build log</p>
              <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">Shipped lately</h3>
              <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-white/60">
                Straight from the portfolio database. Add a project in admin and it shows up here.
              </p>
              <a
                href="#portfolio"
                onClick={(e) => { e.preventDefault(); scrollToTarget('#portfolio'); }}
                className="key-btn group mt-6 inline-flex items-center gap-2 px-5 py-3 font-body text-xs font-semibold uppercase tracking-wider"
              >
                See all work <ArrowUpRight size={15} />
              </a>
            </div>
            <ul className="divide-y divide-white/10 border-y border-white/10" aria-live="polite">
              {rows === null
                ? Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 py-4"><span className="skeleton h-4 w-2/3 rounded" /><span className="skeleton h-3 w-16 rounded" /></li>
                  ))
                : rows.map((r) => (
                    <li key={r.id} className="log-line flex items-center justify-between gap-4 py-4">
                      <span className="min-w-0">
                        <span className="block truncate font-display text-lg font-semibold text-white">{r.title}</span>
                        <span className="mono-label">{pretty(r.category)}</span>
                      </span>
                      <span className="mono-label shrink-0">{ago(r.created_at)}</span>
                    </li>
                  ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
