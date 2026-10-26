import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Palette } from 'lucide-react';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import GalleryGrid from '../components/GalleryGrid';

gsap.registerPlugin(ScrollTrigger);

interface BrandProject {
  id: string;
  subcategory: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

const brandSubcategories = [
  'Church Branding',
  'Flyers',
  'Birthday Flyers',
  'Logo',
  'Other Visuals',
];

const BrandDesign = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Record<string, BrandProject[]>>({});
  const [selectedCategory, setSelectedCategory] = useState('Logo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize empty categories
    const init: Record<string, BrandProject[]> = {};
    brandSubcategories.forEach((cat) => {
      init[cat] = [];
    });
    setProjects(init);

    // Subscribe to real-time updates
    const q = query(collection(firestore, 'brandDesign'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Record<string, BrandProject[]> = init;
        snapshot.forEach((doc) => {
          const project = { id: doc.id, ...doc.data() } as BrandProject;
          if (data[project.subcategory]) {
            data[project.subcategory].push(project);
          }
        });

        // Sort by creation date
        Object.keys(data).forEach((key) => {
          data[key].sort((a, b) => b.createdAt - a.createdAt);
        });

        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const currentProjects = projects[selectedCategory] || [];
  const images = currentProjects.map((p) => ({
    id: p.id,
    url: p.imageUrl,
    title: p.title,
  }));

  return (
    <section
      ref={sectionRef}
      id="brand-design"
      className="relative w-full py-20 md:py-32 bg-black px-6 md:px-12 lg:px-20"
    >
      {/* Header */}
      <div ref={headingRef} className="mb-16">
        <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
          Portfolio
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Brand Design
        </h2>
        <p className="text-lg text-white/60 max-w-2xl">
          Creative branding and design work including logos, flyers, and visual identity
        </p>
      </div>

      {/* Subcategory Tabs */}
      <div className="mb-12 overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {brandSubcategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-body tracking-wider uppercase transition-all ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'border border-white/20 text-white/70 hover:border-white/50'
              }`}
            >
              {category}
              <span className="ml-2 text-xs opacity-60">
                ({projects[category]?.length || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-12 text-center text-white/50">
          <p>Loading designs...</p>
        </div>
      ) : currentProjects.length > 0 ? (
        <>
          <GalleryGrid items={images} columns={3} />

          {/* Project Details */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      {project.description}
                    </p>
                  </div>
                  <Palette size={20} className="text-white/30 flex-shrink-0" />
                </div>

                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                  {project.subcategory}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-white/50">
          <p>No designs in this category yet</p>
        </div>
      )}
    </section>
  );
};

export default BrandDesign;
