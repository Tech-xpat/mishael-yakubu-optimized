import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ExternalLink, Play, ChevronLeft, ChevronRight, AlertCircle, X, Maximize2 } from 'lucide-react';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';

interface Item {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category?: string;
  subcategory?: string | null;
  website_url?: string | null;
  media_type?: string | null;
  priority?: number | null;
  created_at?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  web: 'Web Development',
  website: 'Live Websites',
  flyer: 'Flyers & Graphics',
  brand: 'Brand Design',
  ai: 'AI Automation',
  video: 'Videos',
  motion: 'Motion Graphics',
};

function Skeleton() {
  return (
    <div className="relative max-w-5xl mx-auto px-4 animate-pulse">
      <div className="aspect-[16/10] md:aspect-video bg-gradient-to-br from-white/15 to-white/5 rounded-2xl" />
      <div className="mt-6 h-8 bg-white/15 rounded-lg w-2/3 mx-auto" />
      <div className="mt-3 h-4 bg-white/10 rounded w-1/2 mx-auto" />
      <div className="mt-8 flex gap-3 justify-center overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-20 h-20 bg-white/10 rounded-lg flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [subFilter, setSubFilter] = useState<string>('all');
  const [fullscreen, setFullscreen] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = category ? CATEGORY_NAMES[category] || category : 'Gallery';

  const showArrows = () => {
    setArrowsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setArrowsVisible(false), 4000);
  };

  useEffect(() => {
    if (!category) {
      setLoading(false);
      setError('Invalid category');
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from('portfolio_items')
      .select('*')
      .eq('category', category)
      .then(({ data, error: err }) => {
        if (err) {
          console.error(err);
          setError(err.message || 'Failed to load items');
          setItems([]);
        } else {
          const sorted = (data || []).sort((a, b) => {
            const pa = a.priority || 0;
            const pb = b.priority || 0;
            if (pb !== pa) return pb - pa;
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          });
          setItems(sorted);
        }
        setLoading(false);
        setActive(0);
        setSubFilter('all');
      });
  }, [category]);

  const subcategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.subcategory) set.add(i.subcategory);
    });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (subFilter === 'all') return items;
    return items.filter((i) => i.subcategory === subFilter);
  }, [items, subFilter]);

  useEffect(() => {
    setActive(0);
  }, [subFilter]);

  useEffect(() => {
    showArrows();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [active, fullscreen]);

  const go = (dir: number) => {
    setActive((i) => {
      const next = i + dir;
      if (next < 0) return filtered.length - 1;
      if (next >= filtered.length) return 0;
      return next;
    });
    showArrows();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    showArrows();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      go(diff > 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered.length]);

  const current = filtered[active];

  return (
    <div className="relative bg-black min-h-screen text-white">
      {!fullscreen && <Navbar />}

      <main className={fullscreen ? '' : 'pt-20 pb-16'}>
        {!fullscreen && (
          <div className="px-6 md:px-12 mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{title}</p>
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="text-center py-32 px-6">
            <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
            <p className="text-white/70 mb-2">Could not load gallery</p>
            <p className="text-sm text-white/40 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-white/40 px-6">
            No items in this {subFilter === 'all' ? 'category' : 'filter'} yet.
          </div>
        ) : (
          <>
            {!fullscreen && subcategories.length > 0 && (
              <div className="px-6 md:px-12 mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSubFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs ${
                    subFilter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
                  }`}
                >
                  All
                </button>
                {subcategories.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs ${
                      subFilter === s ? 'bg-white text-black' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className={fullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col' : 'relative max-w-5xl mx-auto px-4'}>
              <div
                className={`relative ${fullscreen ? 'flex-1' : 'aspect-[16/10] md:aspect-video'} bg-black overflow-hidden ${fullscreen ? '' : 'rounded-2xl border border-white/10'} touch-pan-y`}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseMove={showArrows}
                onClick={() => {
                  showArrows();
                  if (!fullscreen) setFullscreen(true);
                }}
              >
                {current &&
                  (current.media_type === 'video' || current.image_url?.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      key={current.id}
                      src={current.image_url}
                      controls
                      className="w-full h-full object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      key={current.id}
                      src={current.image_url}
                      alt={current.title}
                      className="w-full h-full object-contain"
                    />
                  ))}

                {fullscreen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreen(false);
                    }}
                    className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/60 text-white"
                  >
                    <X size={22} />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-opacity duration-500 ${
                    arrowsVisible ? 'opacity-[0.35] hover:opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-opacity duration-500 ${
                    arrowsVisible ? 'opacity-[0.35] hover:opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-xs">
                  {active + 1} / {filtered.length}
                </div>

                {!fullscreen && (
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white/70">
                    <Maximize2 size={18} />
                  </div>
                )}
              </div>

              {current && !fullscreen && (
                <div className="mt-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">{current.title}</h2>
                  {current.subcategory && (
                    <p className="text-xs uppercase tracking-wider text-white/50 mt-1">{current.subcategory}</p>
                  )}
                  {current.description && (
                    <p className="mt-2 text-white/60 max-w-2xl mx-auto">{current.description}</p>
                  )}
                  {current.website_url && (
                    <a
                      href={current.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium"
                    >
                      <ExternalLink size={16} /> Open live site
                    </a>
                  )}
                </div>
              )}

              {!fullscreen && (
                <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {filtered.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActive(idx);
                        showArrows();
                      }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === active ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {item.media_type === 'video' || item.image_url?.match(/\.(mp4|webm|mov)$/i) ? (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Play size={20} />
                        </div>
                      ) : (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {fullscreen && current && (
                <div className="p-4 text-center bg-black/80">
                  <h2 className="text-lg font-semibold">{current.title}</h2>
                  {current.description && (
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">{current.description}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {!fullscreen && <Footer />}
    </div>
  );
}
