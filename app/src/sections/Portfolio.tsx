import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { slug: 'web', name: 'Web Development', icon: Folder },
  { slug: 'website', name: 'Live Websites', icon: Folder },
  { slug: 'flyer', name: 'Flyers & Graphics', icon: Folder },
  { slug: 'brand', name: 'Brand Design', icon: Folder },
  { slug: 'ai', name: 'AI Automation', icon: Folder },
  { slug: 'video', name: 'Videos', icon: Play },
  { slug: 'motion', name: 'Motion Graphics', icon: Play },
];

export default function Portfolio() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('portfolio_items')
      .select('category')
      .then(({ data }) => {
        const c: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          const cat = row.category || 'web';
          c[cat] = (c[cat] || 0) + 1;
        });
        setCounts(c);
        setLoading(false);
      });
  }, []);

  return (
    <section id="portfolio" className="py-24 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">Selected Work</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h2>
        <p className="text-white/60 mb-12 max-w-2xl">
          Tap any folder to open the full gallery. Limited preview on the main page — no crowding.
        </p>

        {loading ? (
          <div className="text-white/40">Loading folders...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = counts[cat.slug] || 0;
              return (
                <Link
                  key={cat.slug}
                  to={`/gallery/${cat.slug}`}
                  className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all aspect-square"
                >
                  <div className="mb-4 p-6 rounded-2xl bg-white/10 group-hover:bg-white/20 transition">
                    <Icon size={48} className="text-white/80 group-hover:text-white" />
                  </div>
                  <h3 className="text-center font-semibold text-sm md:text-base">{cat.name}</h3>
                  <p className="text-xs text-white/40 mt-1">{count} item{count === 1 ? '' : 's'}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
