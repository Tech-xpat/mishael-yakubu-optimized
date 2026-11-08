import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { scrollToTarget } from '../lib/scrollTo';

interface HeroProps {
  /** true once the page loader has finished: the intro animation starts then. */
  ready: boolean;
}

const Hero = ({ ready }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Hidden starting state, applied before the first paint.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.char', { opacity: 0, rotateX: 90, y: -50 });
      gsap.set(subheadingRef.current, { opacity: 0, y: 20 });
      gsap.set('.hero-cta', { opacity: 0, y: 24 });
      gsap.set('.corner-bl, .corner-br', { opacity: 0, y: 40 });
      gsap.set(bgRef.current, { scale: 1.12 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Intro: plays once the loader is gone.
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to(bgRef.current, { scale: 1, duration: 1.6 }, 0)
        .to('.char', { opacity: 1, rotateX: 0, y: 0, duration: 1.1, stagger: 0.045 }, 0.1)
        .to(subheadingRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.8)
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 1.0)
        .to('.corner-bl', { opacity: 1, y: 0, duration: 0.9 }, 1.1)
        .to('.corner-br', { opacity: 1, y: 0, duration: 0.9 }, 1.2);
    }, heroRef);
    return () => ctx.revert();
  }, [ready]);

  // Mouse parallax (desktop only). Runs outside React state, so moving the mouse
  // never re-renders the hero.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = parallaxRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => {
      xTo((e.clientX / window.innerWidth - 0.5) * 12);
      yTo((e.clientY / window.innerHeight - 0.5) * 12);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const name = 'MISHAEL YAKUBU';

  const goTo = (selector: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(selector);
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="force-dark relative w-full overflow-hidden bg-black"
      style={{ height: '100svh', minHeight: 560 }}
    >
      {/* Background image: entry zoom on bgRef, mouse parallax on parallaxRef */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full will-change-transform">
        <div ref={parallaxRef} className="absolute -inset-4 will-change-transform">
          <img
            src="/apppublichero-bg.webp"
            alt="Mishael Yakubu"
            width={896}
            height={1116}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover breathing"
          />
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      <div className="corner-bl absolute bottom-6 left-5 z-20 opacity-0 sm:bottom-8 sm:left-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <p className="text-xs tracking-[0.2em] text-white/60 uppercase font-body">
            Available for freelance
          </p>
        </div>
      </div>

      <div className="corner-br absolute bottom-8 right-8 z-20 hidden opacity-0 sm:block">
        <p className="text-xs tracking-[0.2em] text-white/60 uppercase font-body">
          Scroll to explore
        </p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Heading with 3D Character Animation */}
        <h1
          ref={headingRef}
          aria-label={name}
          className="font-display flex flex-col items-center text-[clamp(3.75rem,19vw,6.5rem)] font-bold leading-[0.9] tracking-tight text-white sm:flex-row sm:gap-[0.28em] sm:text-responsive-xl sm:leading-none"
          style={{ perspective: '1000px' }}
        >
          {name.split(' ').map((word, w) => (
            <span key={w} className="inline-flex" aria-hidden="true">
              {word.split('').map((char, index) => (
                <span
                  key={index}
                  className="char inline-block"
                  style={{
                    transformStyle: 'preserve-3d',
                    textShadow: '0 0 80px rgba(255,255,255,0.1)',
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subheading */}
        <p
          ref={subheadingRef}
          className="mt-6 max-w-3xl px-2 text-center font-body text-xs uppercase leading-relaxed tracking-[0.18em] text-white/70 opacity-0 sm:mt-8 sm:text-sm sm:tracking-[0.32em] md:text-base md:tracking-[0.4em]"
        >
          Web Developer / Brand Designer / AI Automator / Software Developer
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta mt-10 flex w-full max-w-xs flex-col gap-5 opacity-0 sm:mt-12 sm:w-auto sm:max-w-none sm:flex-row sm:gap-6">
          <a
            href="#portfolio"
            onClick={goTo('#portfolio')}
            className="key-btn px-8 py-4 text-center font-body text-sm font-semibold uppercase tracking-wider"
          >
            View My Work
          </a>
          <a
            href="#contact"
            onClick={goTo('#contact')}
            className="key-btn-outline px-8 py-4 text-center font-body text-sm font-semibold uppercase tracking-wider"
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-28 sm:h-32"
        style={{ background: 'linear-gradient(to top, rgb(var(--t-black)), rgb(var(--t-black) / 0))' }}
      />
    </section>
  );
};

export default Hero;
