import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import CategoryCard from '../components/CategoryCard';
import EmptyFold from '../components/EmptyFold';


gsap.registerPlugin(ScrollTrigger);

interface AIProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

const AIAutomation = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(firestore, 'aiAutomation'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AIProject[] = [];
        snapshot.forEach((doc) => {
          const project = { id: doc.id, ...doc.data() } as AIProject;
          data.push(project);
        });
        data.sort(
          (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
        );
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
          AI Automation
        </h2>
        <p className="text-lg text-white/60 max-w-2xl">
          AI-powered solutions and automation projects. View the complete collection.
        </p>
      </div>

      {loading ? (
        <div className="max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-8" aria-busy="true">
          <div className="skeleton mb-4 h-7 w-1/2 rounded" />
          <div className="skeleton mb-6 h-4 w-1/4 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
        </div>
      ) : (() => {
        const card = (
          <CategoryCard
            to="/portfolio/ai-automation"
            title="All AI Projects"
            count={projects.length}
            unit="project"
            thumbs={projects.map((p) => p.imageUrl)}
          />
        );
        return projects.length > 0 ? (
          <div className="max-w-md">{card}</div>
        ) : (
          <EmptyFold count={1} noun="category">
            <div className="max-w-md">{card}</div>
          </EmptyFold>
        );
      })()}
    </section>
  );
};

export default AIAutomation;
