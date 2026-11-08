import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Play } from 'lucide-react';
import { cachedCounts, fetchCounts, prefetchItems } from '../lib/portfolioApi';
import { FolderGridSkeleton } from '../components/Skeletons';
import EmptyFold from '../components/EmptyFold';
import { allCategories, cachedConfig, fetchConfig, EMPTY_CONFIG, type CategoryConfig, type CategoryDef } from '../lib/categories';


function FolderTile({ cat, count }: { cat: CategoryDef; count: number }) {
  const Icon = cat.kind === 'play' ? Play : Folder;
  const warm = () => prefetchItems(cat.slug);
  const empty = count === 0;
  return (
    <Link
      to={`/gallery/${cat.slug}`}
      onPointerEnter={warm}
      onPointerDown={warm}
      onFocus={warm}
      className={`group flex aspect-square flex-col items-center justify-center rounded-3xl border p-3 transition-colors sm:p-8 ${
        empty
          ? 'border-white/10 bg-white/[0.02] opacity-70 hover:opacity-100'
          : 'border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10'
      }`}
    >
      <div className="mb-3 rounded-2xl bg-white/10 p-4 transition-colors group-hover:bg-white/20 sm:mb-4 sm:p-6">
        <Icon size={36} className="text-white/80 group-hover:text-white sm:h-12 sm:w-12" />
      </div>
      <h3 className="text-center text-sm font-semibold leading-tight md:text-base">{cat.name}</h3>
      <p className="mt-1 text-xs text-white/40">
        {count} item{count === 1 ? '' : 's'}
      </p>
    </Link>
  );
}

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4';

export default function Portfolio() {
  // Counts from the last visit paint instantly (e.g. when coming back with Back);
  // fresh numbers replace them as soon as the database answers.
  const [counts, setCounts] = useState<Record<string, number> | null>(() => cachedCounts());

  const [config, setConfig] = useState<CategoryConfig>(() => cachedConfig() ?? EMPTY_CONFIG);

  useEffect(() => {
    let alive = true;
    fetchConfig().then((c) => alive && setConfig(c));
    fetchCounts()
      .then((c) => alive && setCounts(c))
      .catch((err) => {
        console.error(err);
        if (alive) setCounts((prev) => prev ?? {});
      });
    return () => {
      alive = false;
    };
  }, []);

  const CATEGORIES = allCategories(config, counts ? Object.keys(counts) : []);
  const filled = counts ? CATEGORIES.filter((c) => (counts[c.slug] || 0) > 0) : [];
  const empty = counts ? CATEGORIES.filter((c) => !(counts[c.slug] || 0)) : [];

  return (
    <section id="portfolio" className="bg-black py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/50">Selected Work</p>
        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Portfolio</h2>
        <p className="mb-10 max-w-2xl text-white/60 md:mb-12">
          Tap any folder to open the full gallery. Tap the preview inside to go full screen.
        </p>

        {counts === null ? (
          <FolderGridSkeleton count={CATEGORIES.length} />
        ) : (
          <>
            {filled.length > 0 ? (
              <div className={gridClass}>
                {filled.map((cat) => (
                  <FolderTile key={cat.slug} cat={cat} count={counts[cat.slug] || 0} />
                ))}
              </div>
            ) : (
              <p className="text-white/50">Projects are being added. Check back soon.</p>
            )}

            <EmptyFold count={empty.length} noun="folder">
              <div className={gridClass}>
                {empty.map((cat) => (
                  <FolderTile key={cat.slug} cat={cat} count={0} />
                ))}
              </div>
            </EmptyFold>
          </>
        )}
      </div>
    </section>
  );
}
