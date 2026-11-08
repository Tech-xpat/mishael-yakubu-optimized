import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { CardGridSkeleton } from '../components/Skeletons';
import CategoryCard from '../components/CategoryCard';
import EmptyFold from '../components/EmptyFold';

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

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const BrandDesign = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Record<string, BrandProject[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init: Record<string, BrandProject[]> = {};
    brandSubcategories.forEach((cat) => {
      init[cat] = [];
    });
    setProjects(init);

    const q = query(collection(firestore, 'brandDesign'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Record<string, BrandProject[]> = { ...init };
        snapshot.forEach((doc) => {
          const project = { id: doc.id, ...doc.data() } as BrandProject;
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
      className="relative w-full bg-black px-5 py-14 sm:px-6 md:px-12 md:py-32 lg:px-20"
    >
      <div ref={headingRef} className="mb-10 md:mb-16">
        <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
          Portfolio
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Brand Design
        </h2>
        <p className="text-lg text-white/60 max-w-2xl">
          Creative branding and design work. Tap any category to view the full collection.
        </p>
      </div>

      {loading ? (
        <CardGridSkeleton count={brandSubcategories.length} />
      ) : (() => {
        const filled = brandSubcategories.filter((c) => (projects[c]?.length || 0) > 0);
        const empty = brandSubcategories.filter((c) => !(projects[c]?.length || 0));
        const card = (category: string) => (
          <CategoryCard
            key={category}
            to={`/portfolio/brand-design/${titleToSlug(category)}`}
            title={category}
            count={projects[category]?.length || 0}
            unit="design"
            thumbs={(projects[category] || []).map((p) => p.imageUrl)}
          />
        );
        return (
          <>
            {filled.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filled.map(card)}</div>
            ) : (
              <p className="text-white/50">Projects are being added. Check back soon.</p>
            )}
            <EmptyFold count={empty.length} noun="category">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{empty.map(card)}</div>
            </EmptyFold>
          </>
        );
      })()}
    </section>
  );
};

export default BrandDesign;
