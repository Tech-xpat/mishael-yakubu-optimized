import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Ethereal Visions',
    category: 'Brand Identity',
    image: '/project1.jpg',
    description: 'Premium brand identity system crafted for a luxury wellness brand based in Delta State. Encompassing comprehensive visual guidelines, custom typography, and cohesive design language that elevated the brand presence across all digital and physical touchpoints.',
  },
  {
    id: 2,
    title: 'Neon Dynamics',
    category: 'Web Development',
    image: '/project2.jpg',
    description: 'High-performance e-commerce platform developed for a Delta State-based retailer. Features custom animations, optimized checkout flow, real-time inventory management, and mobile-first responsive design achieving 98+ Lighthouse scores.',
  },
  {
    id: 3,
    title: 'Quantum UI',
    category: 'Software Design',
    image: '/project3.jpg',
    description: 'AI-powered analytics dashboard designed for enterprise insights. Built with advanced data visualization, real-time metrics tracking, predictive analytics, and an intuitive interface serving over 500+ monthly active users across the region.',
  },
  {
    id: 4,
    title: 'Cyber Systems',
    category: 'AI Automation',
    image: '/project4.jpg',
    description: 'Enterprise automation solution streamlining operations for Delta State-based corporations. Integrated intelligent workflows reducing manual tasks by 85%, featuring API integrations, custom workflows, and comprehensive analytics dashboard.',
  },
];

const Portfolio = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
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

      // Horizontal scroll animation
      const track = trackRef.current;
      if (track) {
        const totalWidth = track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: -totalWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${totalWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
      }

      // Card animations
      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 100, opacity: 0, rotateY: 15 },
          {
            y: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      cardsRef.current[index] = el;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative w-full min-h-screen bg-black overflow-hidden"
    >
      {/* Section Header */}
      <div
        ref={headingRef}
        className="absolute top-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-20 pt-20 pb-10 bg-gradient-to-b from-black via-black/90 to-transparent"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
              Featured Work
            </p>
            <h2 className="font-display text-responsive-lg font-bold text-white">
              SELECTED WORKS
            </h2>
          </div>
          <p className="hidden md:block text-sm text-white/50 font-body max-w-xs text-right">
            A curated collection of projects showcasing my expertise across web
            development, brand design, and AI automation.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        className="flex items-center h-screen gap-8 px-6 md:px-12 lg:px-20 pt-32"
        style={{ width: 'fit-content' }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => addToRefs(el, index)}
            className="group relative flex-shrink-0 w-[80vw] md:w-[50vw] lg:w-[40vw] h-[70vh] cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            {/* Card */}
            <div className="relative w-full h-full overflow-hidden bg-white/5 border border-white/10 transition-all duration-500 group-hover:border-white/30 group-hover:scale-[1.02]">
              {/* Image */}
              <div className="absolute inset-0 img-zoom">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                {/* Category */}
                <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-3">
                  {project.category}
                </p>

                {/* Title */}
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 group-hover:translate-x-2 transition-transform duration-500">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/60 font-body mb-6 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {project.description}
                </p>

                {/* View Project Link */}
                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors duration-300">
                  <span className="text-sm font-body tracking-wider uppercase">
                    View Project
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Index Number */}
              <div className="absolute top-8 right-8">
                <span className="font-display text-6xl font-bold text-white/10">
                  0{project.id}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* End Card - CTA */}
        <div className="flex-shrink-0 w-[80vw] md:w-[50vw] lg:w-[40vw] h-[70vh] flex items-center justify-center border border-white/10 bg-white/5">
          <div className="text-center p-8">
            <p className="text-sm text-white/50 font-body mb-6">
              Want to see more?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-body text-sm tracking-wider uppercase hover:bg-white/90 transition-all duration-300"
            >
              Start a Project
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40 font-body">01</span>
          <div className="w-32 h-px bg-white/20 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-white/60 w-1/4" />
          </div>
          <span className="text-xs text-white/40 font-body">0{projects.length}</span>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
