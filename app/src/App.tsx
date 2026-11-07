import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSeo } from './lib/seo';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Portfolio from './sections/Portfolio';
import WebDevelopment from './sections/WebDevelopment';
import BrandDesign from './sections/BrandDesign';
import AIAutomation from './sections/AIAutomation';
import Services from './sections/Services';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useSeo({
    title: 'Mishael Yakubu | Web Developer, Brand Designer & AI Automation | Empire Digitals',
    description:
      'Mishael Yakubu is the CEO of Empire Digitals and a web developer in Delta State, Nigeria. Browse web development, brand design and AI automation projects.',
    path: '/',
  });

  useEffect(() => {
    // Always start homepage at the top on load/refresh
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.6,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    // Snap to top immediately after Lenis boots
    lenis.scrollTo(0, { immediate: true });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const backToTopBtn = document.getElementById('back-to-top');
    const handleScroll = () => {
      if (!backToTopBtn) return;
      if (window.scrollY > 500) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
      } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);

  // Scroll to a section requested from another page (no "#" in the URL)
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target || target === '#home') return;
    const t = setTimeout(() => {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
    return () => clearTimeout(t);
  }, [location.state]);

  return (
    <div className="relative bg-black min-h-screen">
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <WebDevelopment />
        <BrandDesign />
        <AIAutomation />
        <Services />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}

export default App;
