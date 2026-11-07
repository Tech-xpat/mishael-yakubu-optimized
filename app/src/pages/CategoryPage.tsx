import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import { useSeo, breadcrumbs } from '../lib/seo';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  subcategory?: string;
  createdAt: any;
}

const categoryConfig: Record<
  string,
  { collection: string; title: string; subcategories?: string[] }
> = {
  'web-development': {
    collection: 'webDevelopment',
    title: 'Web Development',
    subcategories: [
      'Church Website',
      'Banking & Investment',
      'Real Estate Agent',
      'Company Management',
      'School Management',
      'Broker Site',
      'E-Commerce',
      'Courier Service',
      'Other Businesses',
    ],
  },
  'brand-design': {
    collection: 'brandDesign',
    title: 'Brand Design',
    subcategories: ['Church Branding', 'Flyers', 'Birthday Flyers', 'Logo', 'Other Visuals'],
  },
  'ai-automation': {
    collection: 'aiAutomation',
    title: 'AI Automation',
  },
};

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Animated card skeleton frames while projects load */
function CategorySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading projects">
      <div className="flex gap-6 overflow-hidden px-6 md:px-12 lg:px-20 pb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[280px] md:w-[340px]"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 skeleton" />
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                <div className="h-5 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-white/10 space-y-3"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="h-6 skeleton rounded w-2/3" />
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-5/6" />
            <div className="h-3 skeleton rounded w-1/3 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

const CategoryPage = () => {
  const { type, subcategory } = useParams<{ type: string; subcategory?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Back returns to the exact spot the visitor left on the home page; if this page was
  // opened directly there is no history, so go to the portfolio menu instead.
  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/', { state: { scrollTo: '#portfolio' } });
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const config = type ? categoryConfig[type] : null;
  const displayTitle = subcategory ? slugToTitle(subcategory) : config?.title || 'Portfolio';

  const seoPath = `/portfolio/${type ?? ''}${subcategory ? `/${subcategory}` : ''}`;
  useSeo({
    title: `${displayTitle} Projects | Mishael Yakubu`,
    description: `${displayTitle} projects by Mishael Yakubu, CEO of Empire Digitals. View selected work and get in touch for your own project.`,
    path: seoPath,
    noindex: !config,
    jsonLd: config
      ? [
          breadcrumbs([
            { name: 'Home', path: '/' },
            { name: config.title, path: `/portfolio/${type}` },
            ...(subcategory ? [{ name: displayTitle, path: seoPath }] : []),
          ]),
        ]
      : [],
  });

  // Always open at the top of the page
  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [type, subcategory]);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setProjects([]);

    let q = query(collection(firestore, config.collection));

    if (subcategory && config.subcategories) {
      const fullTitle =
        config.subcategories.find((s) => titleToSlug(s) === subcategory) ||
        slugToTitle(subcategory);
      q = query(collection(firestore, config.collection), where('subcategory', '==', fullTitle));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Project[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Project);
        });
        data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [type, subcategory, config]);

  // Gentle auto-scroll for the carousel. Position is tracked as a float (browsers round
  // scrollLeft to whole pixels, which makes slow speeds stutter), it is time-based so it
  // runs at the same speed on every screen, and it hands over to the visitor on touch/drag.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || projects.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const SPEED = 36; // pixels per second
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const step = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const max = el.scrollWidth - el.clientWidth;
      if (!paused && max > 0) {
        pos += SPEED * dt;
        if (pos >= max) pos = 0;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };

    const pause = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const resume = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        pos = el.scrollLeft;
        paused = false;
      }, 1500);
    };

    el.addEventListener('pointerdown', pause, { passive: true });
    el.addEventListener('pointerup', resume, { passive: true });
    el.addEventListener('pointercancel', resume, { passive: true });
    el.addEventListener('mouseenter', pause, { passive: true });
    el.addEventListener('mouseleave', resume, { passive: true });
    el.addEventListener('wheel', pause, { passive: true });

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('pointerup', resume);
      el.removeEventListener('pointercancel', resume);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('wheel', pause);
    };
  }, [projects]);

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Category not found</p>
          <Link to="/" className="text-white/70 hover:text-white underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black min-h-screen text-white">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="px-6 md:px-12 lg:px-20 mb-10">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <p className="text-xs tracking-[0.3em] text-white/50 uppercase mb-3">Portfolio</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">{displayTitle}</h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Complete collection of {displayTitle.toLowerCase()} projects. Swipe or drag the cards.
          </p>
        </div>

        {loading ? (
          <CategorySkeleton />
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-white/50 px-6">
            No projects in this category yet.
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 px-6 md:px-12 lg:px-20 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex-shrink-0 w-[280px] md:w-[340px] group"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/40 transition-all shadow-2xl">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">
                        {project.title}
                      </h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all"
                >
                  <h3 className="font-bold text-white text-lg mb-2">{project.title}</h3>
                  <p className="text-sm text-white/60 mb-4">{project.description}</p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      View Website
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
