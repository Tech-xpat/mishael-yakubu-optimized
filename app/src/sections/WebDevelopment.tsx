import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

interface WebProject {
  id: string;
  subcategory: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  createdAt: any;
}

const webSubcategories = [
  'Church Website',
  'Banking & Investment',
  'Real Estate Agent',
  'Company Management',
  'School Management',
  'Broker Site',
  'E-Commerce',
  'Courier Service',
  'Other Businesses',
];

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const WebDevelopment = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Record<string, WebProject[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init: Record<string, WebProject[]> = {};
    webSubcategories.forEach((cat) => {
      init[cat] = [];
    });
    setProjects(init);

    const q = query(collection(firestore, 'webDevelopment'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Record<string, WebProject[]> = { ...init };
        snapshot.forEach((doc) => {
          const project = { id: doc.id, ...doc.data() } as WebProject;
          if (data[project.subcategory]) {
            data[project.subcategory].push(project);
          }
        });

        Object.keys(data).forEach((key) => {
          data[key].sort(
            (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
          );
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

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 bg-black px-6 md:px-12 lg:px-20"
    >
      <div ref={headingRef} className="mb-16">
        <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
          Portfolio
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Web Development
        </h2>
        <p className="text-lg text-white/60 max-w-2xl">
          Explore websites built for various industries and businesses. Tap any category to view the
          full collection.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/50">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {webSubcategories.map((category) => (
            <Link
              key={category}
              to={`/portfolio/web-development/${titleToSlug(category)}`}
              className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all"
            >
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white">
                {category}
              </h3>
              <p className="text-sm text-white/50">
                {projects[category]?.length || 0} project
                {(projects[category]?.length || 0) === 1 ? '' : 's'}
              </p>
              <p className="mt-4 text-sm text-white/70 group-hover:text-white">View full list →</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default WebDevelopment;
