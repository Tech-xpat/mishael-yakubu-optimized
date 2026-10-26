import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: '5+', label: 'Years Experience' },
    { value: '50+', label: 'Projects Completed' },
    { value: '30+', label: 'Happy Clients' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image scale and grayscale effect on scroll
      gsap.fromTo(
        imageRef.current,
        { scale: 1, filter: 'grayscale(100%)' },
        {
          scale: 1.1,
          filter: 'grayscale(0%)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Heading character reveal
      if (headingRef.current) {
        const chars = headingRef.current.querySelectorAll('.char');
        gsap.fromTo(
          chars,
          { y: '100%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.03,
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Content fade up
      gsap.fromTo(
        contentRef.current?.querySelectorAll('.content-item') || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats counter animation
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll('.stat-item');
        gsap.fromTo(
          statItems,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const heading = 'ABOUT ME';

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen bg-black py-20 md:py-32"
    >
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Sticky Image */}
          <div className="relative lg:sticky lg:top-32">
            <div
              ref={imageRef}
              className="relative aspect-[4/5] overflow-hidden"
            >
              <img
                src="/about-portrait.jpg"
                alt="Mishael Yakubu"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-white/10" />
            <div className="absolute -top-4 -left-4 w-20 h-20 border border-white/10" />
          </div>

          {/* Right Column - Content */}
          <div className="lg:pt-20">
            {/* Heading */}
            <h2
              ref={headingRef}
              className="font-display text-responsive-lg font-bold text-white mb-8 overflow-hidden"
            >
              {heading.split('').map((char, index) => (
                <span key={index} className="char inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h2>

            {/* Content */}
            <div ref={contentRef} className="space-y-6">
              <p className="content-item text-lg md:text-xl text-white/80 font-body leading-relaxed">
                I specialize in building digital experiences that merge creativity
                with technical precision. From brand identity to full-stack
                development, I craft solutions that leave a lasting impact.
              </p>

              <p className="content-item text-base text-white/60 font-body leading-relaxed">
                With over 5 years of experience in the digital space, I've had the
                privilege of working with startups, agencies, and established brands
                across various industries. My approach combines strategic thinking
                with meticulous attention to detail, ensuring every project exceeds
                expectations.
              </p>

              <p className="content-item text-base text-white/60 font-body leading-relaxed">
                Whether it's creating a stunning brand identity, developing a
                high-performance web application, or implementing AI-driven
                automation solutions, I bring the same level of dedication and
                expertise to every project.
              </p>

              {/* Skills Tags */}
              <div className="content-item flex flex-wrap gap-3 pt-4">
                {[
                  'React',
                  'TypeScript',
                  'Node.js',
                  'Python',
                  'Figma',
                  'AI/ML',
                  'Brand Strategy',
                  'UI/UX',
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 border border-white/20 text-sm text-white/70 font-body tracking-wider uppercase hover:border-white/40 hover:text-white transition-all duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10"
            >
              {stats.map((stat, index) => (
                <div key={index} className="stat-item text-center md:text-left">
                  <span className="block font-display text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/50 font-body tracking-wider uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
