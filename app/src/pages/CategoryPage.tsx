import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  subcategory?: string;
  createdAt: any;
}

const categoryConfig: Record<string, { collection: string; title: string; subcategories?: string[] }> = {
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
    subcategories: [
      'Church Branding',
      'Flyers',
      'Birthday Flyers',
      'Logo',
      'Other Visuals',
    ],
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
  return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const CategoryPage = () => {
  const { type, subcategory } = useParams<{ type: string; subcategory?: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const config = type ? categoryConfig[type] : null;
  const displayTitle = subcategory ? slugToTitle(subcategory) : config?.title || 'Portfolio';

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    let q = query(collection(firestore, config.collection));

    if (subcategory && config.subcategories) {
      const fullTitle = config.subcategories.find((s) => titleToSlug(s) === subcategory) || slugToTitle(subcategory);
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

  // Smooth auto-scroll for the carousel (pauses on touch/hover)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || projects.length === 0) return;

    let raf: number;
    let speed = 0.6;
    let paused = false;

    const step = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    el.addEventListener('pointerdown', pause);
    el.addEventListener('pointerup', resume);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('pointerup', resume);
      el.removeEventListener('pointerleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
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
            onClick={() => navigate(-1)}
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
          <div className="py-20 text-center text-white/50">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-white/50 px-6">No projects in this category yet.</div>
        ) : (
          <>
            {/* Stylish horizontal moving cards — touch interactive */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 px-6 md:px-12 lg:px-20 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex-shrink-0 w-[280px] md:w-[340px] snap-center group"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/40 transition-all shadow-2xl">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">{project.title}</h3>
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

            {/* Detailed list below */}
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
