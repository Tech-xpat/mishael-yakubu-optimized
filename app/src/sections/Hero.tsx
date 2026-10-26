import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background zoom and unblur animation
      gsap.fromTo(
        bgRef.current,
        { scale: 1.2, filter: 'blur(10px)' },
        { scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'expo.out' }
      );

      // Heading character animation
      if (headingRef.current) {
        const chars = headingRef.current.querySelectorAll('.char');
        gsap.fromTo(
          chars,
          { opacity: 0, rotateX: 90, y: -50 },
          {
            opacity: 1,
            rotateX: 0,
            y: 0,
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.05,
            delay: 0.2,
          }
        );
      }

      // Subheading decode effect
      if (subheadingRef.current) {
        gsap.fromTo(
          subheadingRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 1.5 }
        );
      }

      // Corner elements slide in
      gsap.fromTo(
        '.corner-tl',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'expo.out', delay: 1.8 }
      );
      gsap.fromTo(
        '.corner-tr',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, ease: 'expo.out', delay: 1.9 }
      );
      gsap.fromTo(
        '.corner-bl',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 2 }
      );
      gsap.fromTo(
        '.corner-br',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 2.1 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const name = 'MISHAEL YAKUBU';

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Background Image with Parallax */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <img
          src="/apppublichero-bg.jpeg"
          alt="Mishael Yakubu"
          className="w-full h-full object-cover breathing"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Corner Metadata */}
      <div className="corner-tl absolute top-8 left-8 z-20 opacity-0">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase font-body">
          Based In Delta State, NG
        </p>
      </div>

      <div className="corner-tr absolute top-8 right-8 z-20 opacity-0">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase font-body">
          Portfolio 2026
        </p>
      </div>

      <div className="corner-bl absolute bottom-8 left-8 z-20 opacity-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <p className="text-xs tracking-[0.2em] text-white/60 uppercase font-body">
            Available for freelance 
          </p>
        </div>
      </div>

      <div className="corner-br absolute bottom-8 right-8 z-20 opacity-0">
        <p className="text-xs tracking-[0.2em] text-white/60 uppercase font-body">
          Scroll to explore
        </p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Heading with 3D Character Animation */}
        <h1
          ref={headingRef}
          className="font-display text-responsive-xl font-bold text-white text-center leading-none tracking-tight"
          style={{ perspective: '1000px' }}
        >
          {name.split('').map((char, index) => (
            <span
              key={index}
              className="char inline-block"
              style={{
                transformStyle: 'preserve-3d',
                textShadow: '0 0 80px rgba(255,255,255,0.1)',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Subheading */}
        <p
          ref={subheadingRef}
          className="mt-8 text-sm md:text-base tracking-[0.4em] text-white/70 uppercase font-body text-center max-w-3xl opacity-0"
        >
          Web Developer / Brand Designer / AI Automator / Software Developer
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 opacity-0 animate-[fadeUp_1s_ease-out_2.5s_forwards]">
          <a
            href="#portfolio"
            className="px-8 py-4 bg-white text-black font-body text-sm tracking-wider uppercase hover:bg-white/90 transition-all duration-300 hover:scale-105"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-8 py-4 border border-white/30 text-white font-body text-sm tracking-wider uppercase hover:bg-white/10 transition-all duration-300"
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  );
};

export default Hero;
