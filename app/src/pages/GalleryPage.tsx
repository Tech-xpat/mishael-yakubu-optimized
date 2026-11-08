import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  cachedItems,
  fetchItems,
  type PortfolioItem,
} from '../lib/portfolioApi';
import {
  ArrowLeft,
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Maximize2,
} from 'lucide-react';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import { GallerySkeleton } from '../components/Skeletons';
import { useSeo, breadcrumbs } from '../lib/seo';
import { cachedConfig, fetchConfig, categoryName, allCategories, EMPTY_CONFIG, type CategoryConfig } from '../lib/categories';


const isVideo = (item?: PortfolioItem) =>
  !!item && (item.media_type === 'video' || !!item.image_url?.match(/\.(mp4|webm|mov)$/i));

/** Main preview image with a shimmer until the picture has actually decoded. */
function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

export default function GalleryPage() {
  const { category } = useParams<{ category: string }>();
  const [config, setConfig] = useState<CategoryConfig>(() => cachedConfig() ?? EMPTY_CONFIG);
  useEffect(() => {
    let alive = true;
    fetchConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);
  const known = !!category && allCategories(config).some((c) => c.slug === category);
  const galleryName = category && known ? categoryName(category, config) : 'Gallery';
  useSeo({
    title: `${galleryName} Portfolio | Mishael Yakubu`,
    description: `${galleryName} by Mishael Yakubu, CEO of Empire Digitals. Browse the full collection of projects.`,
    path: `/gallery/${category ?? ''}`,
    noindex: !known,
    jsonLd: [
      breadcrumbs([
        { name: 'Home', path: '/' },
        { name: galleryName, path: `/gallery/${category ?? ''}` },
      ]),
    ],
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Items fetched earlier this session (or warmed by hovering the folder) show instantly.
  const [items, setItems] = useState<PortfolioItem[]>(() => (category ? cachedItems(category) ?? [] : []));
  const [loading, setLoading] = useState(() => !(category && cachedItems(category)));
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [subFilter, setSubFilter] = useState<string>('all');
  const [fullscreen, setFullscreen] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = category ? categoryName(category, config) : 'Gallery';

  // Back goes to wherever the visitor came from (the home page portfolio menu, at the
  // same scroll spot). If the page was opened directly, fall back to the portfolio menu.
  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/', { state: { scrollTo: '#portfolio' } });
  };

  const showArrows = useCallback(() => {
    setArrowsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setArrowsVisible(false), 4000);
  }, []);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      setError('Invalid category');
      return;
    }
    let alive = true;
    const warm = cachedItems(category);
    setError(null);
    setActive(0);
    setSubFilter('all');
    if (warm) {
      setItems(warm);
      setLoading(false);
    } else {
      setItems([]);
      setLoading(true);
    }

    // Always revalidate in the background so new uploads appear.
    fetchItems(category)
      .then((fresh) => {
        if (!alive) return;
        setItems(fresh);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!alive) return;
        console.error(err);
        if (!warm) {
          setError(err.message || 'Failed to load items');
          setItems([]);
        }
        setLoading(false);
      });
    return () => {
      alive = false;
    };
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
  }, [active, fullscreen, showArrows]);

  // Preload the neighbouring pictures so swiping never waits on the network.
  useEffect(() => {
    if (filtered.length < 2) return;
    [active + 1, active - 1].forEach((i) => {
      const item = filtered[(i + filtered.length) % filtered.length];
      if (item && !isVideo(item)) {
        const img = new Image();
        img.src = item.image_url;
      }
    });
  }, [active, filtered]);

  const go = useCallback(
    (dir: number) => {
      setActive((i) => {
        const next = i + dir;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
      showArrows();
    },
    [filtered.length, showArrows]
  );

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
  }, [go]);

  const current = filtered[active];

  return (
    <div className="relative bg-black min-h-screen text-white">
      {!fullscreen && <Navbar />}

      <main className={fullscreen ? '' : 'pt-20 pb-16'}>
        {!fullscreen && (
          <div className="mb-6 flex items-center justify-between px-5 sm:px-6 md:px-12">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{title}</p>
          </div>
        )}

        {loading ? (
          <GallerySkeleton />
        ) : error ? (
          <div className="text-center py-32 px-6">
            <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
            <p className="text-white/70 mb-2">Could not load gallery</p>
            <p className="text-sm text-white/40 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="key-btn rounded-full px-6 py-3 text-sm font-semibold"
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
              <div className="px-6 md:px-12 mb-6 flex flex-wrap gap-2" data-no-press>
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

            <div className={fullscreen ? 'force-dark fixed inset-0 z-50 bg-black flex flex-col' : 'relative max-w-5xl mx-auto px-4'}>
              <div
                className={`force-dark relative ${fullscreen ? 'flex-1' : 'aspect-[16/10] md:aspect-video'} bg-black overflow-hidden ${fullscreen ? '' : 'rounded-2xl border border-white/10'} touch-pan-y`}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseMove={showArrows}
                onClick={() => {
                  showArrows();
                  if (!fullscreen) setFullscreen(true);
                }}
              >
                {current &&
                  (isVideo(current) ? (
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
                    <PreviewImage key={current.id} src={current.image_url} alt={current.title} />
                  ))}

                {fullscreen && (
                  <button
                    data-no-press
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreen(false);
                    }}
                    className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/60 text-white"
                    aria-label="Close full screen"
                  >
                    <X size={22} />
                  </button>
                )}

                <button
                  data-no-press
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
                  data-no-press
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
                      className="key-btn mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                    >
                      <ExternalLink size={16} /> Open live site
                    </a>
                  )}
                </div>
              )}

              {!fullscreen && (
                <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide" data-no-press>
                  {filtered.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActive(idx);
                        showArrows();
                      }}
                      aria-label={`Show ${item.title}`}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === active ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isVideo(item) ? (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Play size={20} />
                        </div>
                      ) : (
                        <img
                          src={item.image_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover bg-white/5"
                        />
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
