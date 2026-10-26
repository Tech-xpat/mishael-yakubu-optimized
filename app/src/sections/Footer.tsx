import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Instagram, Dribbble, Github, ArrowUpRight } from 'lucide-react';
import NewsletterSignup from '../components/NewsletterSignup';

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
      // CTA text fill animation on scroll
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

      // Social links animation
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer
      ref={sectionRef}
      className="relative w-full bg-black pt-20 md:pt-32 pb-8"
    >
      {/* Newsletter Signup */}
      <div className="w-full px-6 md:px-12 lg:px-20 mb-20">
        <div className="mb-6">
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
            Newsletter
          </p>
        </div>
        <NewsletterSignup />
      </div>

      {/* Top Section */}
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 mb-20">
          {/* Left - Contact */}
          <div>
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
              Start a Project
            </p>
            <a
              href="mailto:empiredigitalsworldwide@gmail.com"
              className="font-display text-2xl md:text-3xl font-bold text-white hover:text-white/80 transition-colors duration-300"
            >
              empiredigitalsworldwide@gmail.com
            </a>
          </div>

          {/* Right - Socials */}
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

        {/* Main CTA - Let's Talk */}
        <div ref={ctaRef} className="relative py-16 md:py-24 border-t border-b border-white/10">
          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="group block relative overflow-hidden"
          >
            {/* Outline Text */}
            <h2 className="font-display text-[15vw] md:text-[12vw] font-bold text-stroke leading-none text-center">
              LET'S TALK
            </h2>

            {/* Filled Text (Clipped) */}
            <div
              ref={fillRef}
              className="absolute inset-0 overflow-hidden"
              style={{ height: '0%' }}
            >
              <h2 className="font-display text-[15vw] md:text-[12vw] font-bold text-white leading-none text-center">
                LET'S TALK
              </h2>
            </div>

            {/* Arrow */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight size={48} className="text-white" />
            </div>
          </a>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 pt-8">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="font-display text-2xl font-bold text-white tracking-tight"
          >
            Mishael
          </a>

          {/* Navigation */}
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

          {/* Copyright */}
          <p className="text-xs text-white/40 font-body">
            © {new Date().getFullYear()} Mishael Yakubu. All rights reserved.
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all duration-300 z-50 opacity-0 pointer-events-none"
        id="back-to-top"
        aria-label="Back to top"
      >
        <ArrowUpRight size={20} className="-rotate-45" />
      </button>
    </footer>
  );
};

export default Footer;
