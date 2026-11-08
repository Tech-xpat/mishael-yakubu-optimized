import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Rocket, Package, TrendingUp, Layers, Crown, ArrowUpRight, MessageCircle, Image as ImageIcon, Clapperboard,
  Facebook, Youtube, Share2, Search, Flag, Printer, IdCard, Megaphone, Palette, Globe, ChartNoAxesCombined,
  CalendarDays, Briefcase, Gauge, PenTool, Clock, Zap, Gem,
} from 'lucide-react';
import { servicesWhatsappUrl } from '../lib/contact';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: React.ElementType;
  text: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  features: Feature[];
}

const f = (icon: React.ElementType, text: string): Feature => ({ icon, text });

/** Five levels: each one includes more than the last. Every card leads to the services WhatsApp line. */
const services: Service[] = [
  {
    id: 1,
    title: 'Starter Package',
    description: 'Everything you need to get noticed online from day one.',
    icon: Rocket,
    features: [
      f(ImageIcon, '2 Flyers'),
      f(Clapperboard, '2 Advertisement Videos'),
      f(Facebook, 'Facebook Setup'),
      f(Youtube, 'YouTube Setup'),
      f(MessageCircle, 'WhatsApp Setup'),
    ],
  },
  {
    id: 2,
    title: 'Mini Package',
    description: 'More designs and video, with your social media set up and ready.',
    icon: Package,
    features: [
      f(ImageIcon, '4 Flyers'),
      f(Clapperboard, '3 Advertisement Videos'),
      f(Share2, 'Social Media Setup'),
    ],
  },
  {
    id: 3,
    title: 'Growth Package',
    description: 'Get found on Google and put your brand in people\'s hands.',
    icon: TrendingUp,
    features: [
      f(Search, 'Google Registration'),
      f(Flag, '2 Physical Banners'),
      f(Printer, '50 Printed Flyers'),
      f(IdCard, '2 ID Cards'),
      f(ImageIcon, '6 Flyers'),
      f(Clapperboard, '4 Advertisement Videos'),
    ],
  },
  {
    id: 4,
    title: 'Mega Package',
    description: 'Print, video and social media, set up and managed for you.',
    icon: Layers,
    features: [
      f(Search, 'Google Registration'),
      f(Flag, '4 Physical Banners'),
      f(Printer, '100 Printed Flyers'),
      f(IdCard, '4 ID Cards'),
      f(ImageIcon, '10 Flyers'),
      f(Clapperboard, '6 Advertisement Videos'),
      f(Share2, 'Social Media Setup'),
      f(Megaphone, 'Social Media Management'),
    ],
  },
  {
    id: 5,
    title: 'Super Package',
    description: 'The complete business presence, built and run end to end.',
    icon: Crown,
    features: [
      f(Gem, 'Everything in the Mega Package'),
      f(PenTool, 'Full Branding'),
      f(Globe, 'Full Website Development & Administration'),
      f(ChartNoAxesCombined, 'Full SEO Packages'),
      f(Share2, 'All Social Media Platforms Setup'),
      f(CalendarDays, 'Monthly Social Media Management'),
      f(Briefcase, 'Business Cards'),
    ],
  },
];

const additional: Feature[] = [
  f(Gauge, 'SSD Optimization'),
  f(Megaphone, 'Social Media Management'),
  f(IdCard, 'Up to 8 ID Cards'),
  f(CalendarDays, '7 Social Media Posts/Flyers for Daily Posting'),
  f(Palette, 'Custom Designs'),
  f(Briefcase, 'Business Cards'),
  f(Flag, 'Physical Banners'),
];

const enquiry = (s: Service) =>
  `Hello Mishael, I'm interested in the ${s.title} (${s.features.map((x) => x.text).join(', ')}). I'd like to get started.`;

const extraEnquiry =
  'Hello Mishael, I saw your additional services (' + additional.map((x) => x.text).join(', ') + ') and I would like to place an order.';

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 767px)').matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 88%', toggleActions: 'play none none reverse' },
        }
      );

      if (reduceMotion) return;

      const sheets = gsap.utils.toArray<HTMLElement>('.paper-sheet');
      sheets.forEach((sheet, i) => {
        const inner = sheet.querySelector<HTMLElement>('.paper-inner');
        const shade = sheet.querySelector<HTMLElement>('.paper-shade');
        if (!inner) return;

        // 1) The card is laid onto the stack: it rises, un-tilts and fades in as it scrolls into view.
        gsap.fromTo(
          inner,
          { y: small ? 56 : 90, rotate: i % 2 === 0 ? -2 : 2, opacity: 0.2 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: sheet, start: 'top 98%', end: 'top 62%', scrub: 0.6 },
          }
        );

        // 2) When the next card lands on top, this one sinks back and dims a little.
        const next = sheets[i + 1];
        if (next) {
          gsap.to(inner, {
            scale: 0.94,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 22%', scrub: 0.6 },
          });
          if (shade) {
            gsap.to(shade, {
              opacity: 1,
              ease: 'none',
              scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 22%', scrub: 0.6 },
            });
          }
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="relative w-full bg-black py-16 md:py-32">
      <div className="w-full px-5 sm:px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div ref={headingRef} className="mb-10 md:mb-20">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-white/50">What I Do</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            <h2 className="font-display text-responsive-lg font-bold text-white">DIGITAL SERVICES & PACKAGES</h2>
            <p className="max-w-md font-body text-sm text-white/50">
              Pick the package that fits your business. Tap any card to order on WhatsApp.
            </p>
          </div>
        </div>

        {/* Stack of cards: each one sticks and the next lands on top of it */}
        <div className="mx-auto max-w-5xl pb-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="paper-sheet sticky mb-[14vh] last:mb-0 md:mb-[16vh]"
                style={{ top: `calc(var(--stack-top) + ${i} * var(--stack-step))`, zIndex: i + 1 }}
              >
                <div className="paper-inner relative origin-top overflow-hidden rounded-xl border border-white/10 bg-card p-5 sm:p-8 md:p-12">
                  {/* folded corner */}
                  <div
                    className="pointer-events-none absolute right-0 top-0 h-8 w-8 md:h-9 md:w-9"
                    style={{
                      background:
                        'linear-gradient(225deg, rgb(var(--t-black)) 50%, rgb(var(--c-white) / 0.14) 50%)',
                    }}
                    aria-hidden="true"
                  />
                  {/* dims the card as the next one covers it */}
                  <div className="paper-shade pointer-events-none absolute inset-0 opacity-0" aria-hidden="true" />

                  <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr] md:gap-14">
                    <div>
                      <div className="mb-4 flex items-center gap-4 md:mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-black md:h-14 md:w-14">
                          <Icon size={24} />
                        </div>
                        <span className="font-display text-4xl font-bold text-white/10 md:text-5xl">
                          0{service.id}
                        </span>
                        <div className="ml-auto flex flex-col items-end gap-1.5 md:ml-2" aria-label={`Level ${service.id} of ${services.length}`}>
                          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                            Level {service.id}
                          </span>
                          <span className="flex gap-1" aria-hidden="true">
                            {services.map((_, n) => (
                              <span
                                key={n}
                                className={`h-1.5 w-4 rounded-full ${n < service.id ? 'bg-white' : 'bg-white/15'}`}
                              />
                            ))}
                          </span>
                        </div>
                      </div>
                      <h3 className="mb-3 font-display text-3xl font-bold text-white md:mb-4 md:text-4xl">
                        {service.title}
                      </h3>
                      <p className="max-w-md font-body text-sm leading-relaxed text-white/65 md:text-base">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between gap-6 md:gap-8">
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1 md:gap-y-3">
                        {service.features.map((feature) => (
                          <li
                            key={feature.text}
                            className="flex items-center gap-2.5 border-b border-white/10 pb-2.5 font-body text-xs text-white/75 md:gap-3 md:pb-3 md:text-sm"
                          >
                            <feature.icon size={17} strokeWidth={1.5} className="shrink-0 text-white/90" aria-hidden="true" />
                            {feature.text}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={servicesWhatsappUrl(enquiry(service))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="key-btn key-btn-wa group inline-flex items-center justify-center gap-2.5 self-stretch px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider md:self-start"
                      >
                        <MessageCircle size={18} fill="currentColor" />
                        <span>Get this package</span>
                        <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Additional services + delivery */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:mt-24 md:grid-cols-[1.4fr_1fr] md:gap-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
            <p className="mb-2 font-body text-xs uppercase tracking-[0.3em] text-white/50">Add-ons</p>
            <h3 className="mb-5 font-display text-3xl font-bold text-white md:text-4xl">Additional Services</h3>
            <ul className="flex flex-wrap gap-2.5">
              {additional.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-body text-xs text-white/80 sm:text-sm"
                >
                  <item.icon size={16} strokeWidth={1.5} className="shrink-0 text-white/90" aria-hidden="true" />
                  {item.text}
                </li>
              ))}
            </ul>
            <a
              href={servicesWhatsappUrl(extraEnquiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="key-btn key-btn-wa group mt-7 inline-flex w-full items-center justify-center gap-2.5 px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider sm:w-auto"
            >
              <MessageCircle size={18} fill="currentColor" />
              <span>Order add-ons</span>
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
            <p className="mb-2 font-body text-xs uppercase tracking-[0.3em] text-white/50">Fast turnaround</p>
            <h3 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
              Delivery
            </h3>
            <div className="mb-5 flex items-end gap-3">
              <span className="font-display text-7xl font-bold leading-none text-white md:text-8xl">24</span>
              <span className="pb-2 font-display text-2xl font-bold uppercase leading-none text-white/60">
                hours
              </span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Zap size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-white/90" aria-hidden="true" />
                <span className="font-body text-sm leading-relaxed text-white/80 sm:text-base">
                  Get your designs within 24 hours.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-white/90" aria-hidden="true" />
                <span className="font-body text-sm leading-relaxed text-white/80 sm:text-base">
                  Get your projects within 24 hours (depending on project scope).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
