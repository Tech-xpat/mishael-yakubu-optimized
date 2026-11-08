import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';
import { getLenis, scrollToTarget } from '../lib/scrollTo';
import { SoundToggle, ThemeToggle } from '../components/ThemeToggle';
import { SECTIONS, showSectionInUrl } from '../lib/sections';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  const navLinks = SECTIONS;
  const [active, setActive] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      // Add background when scrolled
      setIsScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;

      // Which section is on screen: highlights its menu item and keeps the address bar in step.
      if (location.pathname === '/') {
        let current = SECTIONS[0];
        for (const sec of SECTIONS) {
          const el = document.querySelector<HTMLElement>(sec.href);
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = sec;
        }
        setActive((prev) => {
          if (prev !== current.href) showSectionInUrl(current.path);
          return current.href;
        });
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (navRef.current) {
      gsap.to(navRef.current, {
        y: isVisible || isMobileMenuOpen ? 0 : -100,
        duration: 0.4,
        ease: 'expo.out',
      });
    }
  }, [isVisible, isMobileMenuOpen]);

  // While the full-screen menu is open the page behind it must not scroll.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const lenis = getLenis() as any;
    lenis?.stop?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      lenis?.start?.();
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const menuWasOpen = isMobileMenuOpen;
    setIsMobileMenuOpen(false);

    // On any page other than the homepage, go home first, then scroll.
    // Uses router state instead of "#..." so the address bar stays clean.
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href } });
      return;
    }

    // The open menu pauses smooth scrolling and locks the page: let it release first, then scroll.
    if (menuWasOpen) {
      (getLenis() as any)?.start?.();
      window.setTimeout(() => scrollToTarget(href), 120);
      return;
    }
    scrollToTarget(href);
  };

  const handleAdminLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const newCount = adminClicks + 1;
    setAdminClicks(newCount);

    // Navigate to admin after 5 clicks
    if (newCount >= 5) {
      navigate('/greatness');
      setAdminClicks(0);
    }

    // Reset counter after 3 seconds of inactivity
    setTimeout(() => {
      setAdminClicks(0);
    }, 3000);
  };

  // Over the dark hero photo the bar keeps light text in either theme.
  const overHero = location.pathname === '/' && !isScrolled && !isMobileMenuOpen;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-500 ${
          overHero ? 'force-dark' : ''
        } ${
          isScrolled || isMobileMenuOpen
            ? 'bg-black/85 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between h-16 md:h-20 gap-3">
            {/* Logo */}
            <a
              href="#home"
              onClick={handleAdminLogoClick}
              data-no-press
              className="font-display text-2xl font-bold text-white tracking-tight hover:opacity-80 transition-opacity cursor-pointer relative group"
              title={adminClicks > 0 ? `Admin: ${adminClicks}/5` : 'Mishael'}
            >
              Mishael
              {adminClicks > 0 && (
                <span className="absolute -bottom-1 -right-2 text-xs opacity-50 text-white">
                  {adminClicks}/5
                </span>
              )}
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  aria-current={active === link.href ? 'true' : undefined}
                  className={`relative text-sm hover:text-white font-body tracking-wider uppercase transition-colors duration-300 group ${
                    active === link.href ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-white group-hover:w-full transition-all duration-300 ${
                      active === link.href ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              ))}
            </div>

            {/* Right cluster: sound, theme, call to action, mobile menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <SoundToggle />
              <ThemeToggle />
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, '#contact')}
                className="key-btn hidden md:inline-block px-6 py-2.5 text-sm font-body font-semibold tracking-wider uppercase"
              >
                Let's Talk
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-no-press
                className="md:hidden inline-flex h-10 w-10 items-center justify-center text-white"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-500 overflow-y-auto ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ height: '100dvh' }}
      >
        <div className="flex min-h-full flex-col items-center justify-center gap-7 px-6 py-24">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              aria-current={active === link.href ? 'true' : undefined}
              className={`font-display text-4xl font-bold transition-colors hover:text-white/70 ${
                active === link.href ? 'text-white underline underline-offset-8' : 'text-white/70'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="key-btn mt-4 px-10 py-4 font-body text-sm font-semibold tracking-wider uppercase"
          >
            Let's Talk
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
