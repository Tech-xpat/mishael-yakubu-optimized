import { lazy, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Instagram, Dribbble, Github, ArrowUpRight } from 'lucide-react';
import DeferredSection from '../components/DeferredSection';

const NewsletterSignup = lazy(() => import('../components/NewsletterSignup'));

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/mishael_yakubu' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/mishael-yakubu' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/mishael_yakubu' },
    { name: 'Dribbble', icon: Dribbble, href: 'https://dribbble.com/mishael-yakubu' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/mishael-yakubu' },
  ];

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillRef.current,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        '.social-link',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToTarget = (href: string) => {
    if (!href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    const lenis = (window as any).__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      scrollToTarget(href);
    }
  };

  return (
    <footer ref={sectionRef} className="relative w-full bg-black pb-24 pt-16 md:pb-8 md:pt-32">
      <div className="mb-14 w-full px-5 sm:px-6 md:mb-20 md:px-12 lg:px-20">
        <div className="mb-6">
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
            Newsletter
          </p>
        </div>
        <DeferredSection
          fallback={
            <div className="max-w-xl" aria-busy="true">
              <div className="h-6 w-1/2 skeleton rounded mb-4" />
              <div className="h-12 w-full skeleton" />
            </div>
          }
        >
          <NewsletterSignup />
        </DeferredSection>
      </div>

      <div className="w-full px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="mb-14 flex flex-col gap-10 md:mb-20 md:flex-row md:items-start md:justify-between md:gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
              Start a Project
            </p>
            <a
              href="mailto:empiredigitalsworldwide@gmail.com"
              className="break-all font-display text-xl font-bold text-white transition-colors duration-300 hover:text-white/80 sm:text-2xl md:text-3xl"
            >
              empiredigitalsworldwide@gmail.com
            </a>
          </div>

          <div className="flex flex-wrap gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link w-12 h-12 flex items-center justify-center border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        <div ref={ctaRef} className="relative py-16 md:py-24 border-t border-b border-white/10">
          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="group block relative overflow-hidden"
          >
            <h2 className="font-display text-[15vw] md:text-[12vw] font-bold text-stroke leading-none text-center">
              LET'S TALK
            </h2>

            <div
              ref={fillRef}
              className="absolute inset-0 overflow-hidden"
              style={{ height: '0%' }}
            >
              <h2 className="font-display text-[15vw] md:text-[12vw] font-bold text-white leading-none text-center">
                LET'S TALK
              </h2>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight size={48} className="text-white" />
            </div>
          </a>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 pt-8">
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="font-display text-2xl font-bold text-white tracking-tight"
          >
            Mishael
          </a>

          <nav className="flex flex-wrap gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm text-white/50 hover:text-white font-body tracking-wider uppercase transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <p className="text-xs text-white/40 font-body">
            © {new Date().getFullYear()} Mishael Yakubu. All rights reserved.
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          const lenis = (window as any).__lenis;
          if (lenis?.scrollTo) lenis.scrollTo(0, { duration: 1.1 });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="key-btn fixed bottom-24 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full opacity-0 pointer-events-none transition-opacity duration-300 sm:right-7"
        id="back-to-top"
        aria-label="Back to top"
      >
        <ArrowUpRight size={20} className="-rotate-45" />
      </button>
    </footer>
  );
};

export default Footer;
