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
      // Gentle zoom while scrolling (transform only, so it stays on the GPU)
      gsap.fromTo(
        imageRef.current,
        { scale: 1 },
        {
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );

      // Black & white -> colour once, as the portrait enters view
      ScrollTrigger.create({
        trigger: imageRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => imageRef.current?.classList.add('is-colored'),
      });

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
      className="relative w-full bg-black py-16 md:py-32"
    >
      <div className="w-full px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Left Column - Sticky Image */}
          <div className="relative mx-auto w-full max-w-md lg:sticky lg:top-32 lg:max-w-none">
            <div
              ref={imageRef}
              className="about-image force-dark relative aspect-[3/4] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 will-change-transform"
            >
              <img
                src="/about-mishael.webp"
                alt="Mishael Yakubu, CEO of Empire Digitals"
                width={736}
                height={981}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {/* Name plate */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-16">
                <p className="font-display text-2xl font-bold leading-none text-white">Mishael Yakubu</p>
                <p className="mt-1.5 font-body text-xs uppercase tracking-[0.2em] text-white/70">
                  CEO, Empire Digitals · Ughelli, Delta State
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="pointer-events-none absolute -bottom-3 -right-3 hidden h-28 w-28 rounded-br-2xl border border-white/15 sm:block" />
            <div className="pointer-events-none absolute -top-3 -left-3 hidden h-16 w-16 rounded-tl-2xl border border-white/15 sm:block" />
          </div>

          {/* Right Column - Content */}
          <div className="lg:pt-16">
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
              className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-12 sm:gap-8 md:mt-16 md:pt-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="stat-item text-center md:text-left">
                  <span className="mb-2 block font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="font-body text-[10px] uppercase tracking-wider text-white/50 sm:text-xs">
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
