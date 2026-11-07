import { lazy, useEffect, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useSeo } from './lib/seo';
import { scrollToTarget } from './lib/scrollTo';
import { homeRestorePending } from './lib/scrollRestore';

import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Portfolio from './sections/Portfolio';
import Services from './sections/Services';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import DeferredSection from './components/DeferredSection';
import { SectionSkeleton, SiteSkeleton } from './components/Skeletons';

// These three read from Firestore, so they (and the Firebase SDK) load just before
// they scroll into view instead of blocking the first paint.
const WebDevelopment = lazy(() => import('./sections/WebDevelopment'));
const BrandDesign = lazy(() => import('./sections/BrandDesign'));
const AIAutomation = lazy(() => import('./sections/AIAutomation'));

const HERO_IMAGE = '/apppublichero-bg.webp';
const MAX_WAIT_MS = 2200;

function App() {
  const location = useLocation();
  const navType = useNavigationType();
  const [ready, setReady] = useState(false);
  const [overlay, setOverlay] = useState(true);
  // Coming back with the Back button? Mount the lower sections right away so the saved
  // scroll position lands on the same content.
  const [restoring] = useState(() => navType === 'POP' && homeRestorePending());

  useSeo({
    title: 'Mishael Yakubu | Web Developer, Brand Designer & AI Automation | Empire Digitals',
    description:
      'Mishael Yakubu is the CEO of Empire Digitals and a web developer based in Ughelli, Delta State, Nigeria. Browse web development, brand design and AI automation projects.',
    path: '/',
  });

  // Page loader: the skeleton stays up until the hero image and fonts are ready (or 2.2s max),
  // then fades out and the hero intro plays on a fully painted page.
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.src = HERO_IMAGE;
    const imageReady: Promise<unknown> = img.decode
      ? img.decode().catch(() => undefined)
      : new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
    const fontsReady = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 900)),
    ]);
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    Promise.race([Promise.all([imageReady, fontsReady]), timeout]).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setOverlay(false), 550);
    return () => clearTimeout(t);
  }, [ready]);

  // Back-to-top button visibility
  useEffect(() => {
    const btn = document.getElementById('back-to-top');
    const onScroll = () => {
      if (!btn) return;
      const show = window.scrollY > 500;
      btn.classList.toggle('opacity-0', !show);
      btn.classList.toggle('pointer-events-none', !show);
      btn.classList.toggle('opacity-100', show);
      btn.classList.toggle('pointer-events-auto', show);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to a section requested from another page (kept out of the URL).
  // Skipped on Back/Forward so the restored position wins.
  useEffect(() => {
    if (!ready || navType === 'POP') return;
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target || target === '#home') return;
    const t = setTimeout(() => scrollToTarget(target), 250);
    return () => clearTimeout(t);
  }, [ready, navType, location.state]);

  return (
    <div className="relative bg-black min-h-screen">
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero ready={ready} />
        <About />
        <Portfolio />
        <DeferredSection eager={restoring} fallback={<SectionSkeleton />}>
          <WebDevelopment />
        </DeferredSection>
        <DeferredSection eager={restoring} fallback={<SectionSkeleton />}>
          <BrandDesign />
        </DeferredSection>
        <DeferredSection eager={restoring} fallback={<SectionSkeleton />}>
          <AIAutomation />
        </DeferredSection>
        <Services />
        <Contact />
        <Footer />
      </main>
      {overlay && <SiteSkeleton hiding={ready} />}
    </div>
  );
}

export default App;
