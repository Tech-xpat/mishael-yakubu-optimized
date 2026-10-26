import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap } from 'lucide-react';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import GalleryGrid from '../components/GalleryGrid';

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
    // Subscribe to real-time updates
    const q = query(collection(firestore, 'aiAutomation'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AIProject[] = [];
        snapshot.forEach((doc) => {
          const project = { id: doc.id, ...doc.data() } as AIProject;
          data.push(project);
        });

        // Sort by creation date
        data.sort((a, b) => b.createdAt - a.createdAt);

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

  const images = projects.map((p) => ({
    id: p.id,
    url: p.imageUrl,
    title: p.title,
  }));

  return (
    <section
      ref={sectionRef}
      id="ai-automation"
      className="relative w-full py-20 md:py-32 bg-black px-6 md:px-12 lg:px-20"
    >
      {/* Header */}
      <div ref={headingRef} className="mb-16">
        <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
          Portfolio
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          AI Automation
        </h2>
        <p className="text-lg text-white/60 max-w-2xl">
          AI-powered solutions and automation projects showcasing innovation
        </p>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-12 text-center text-white/50">
          <p>Loading projects...</p>
        </div>
      ) : projects.length > 0 ? (
        <>
          <GalleryGrid items={images} columns={3} />

          {/* Project Details */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {project.description}
                    </p>
                  </div>
                  <Zap size={20} className="text-white/30 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-white/50">
          <p>No AI automation projects yet</p>
        </div>
      )}
    </section>
  );
};

export default AIAutomation;
