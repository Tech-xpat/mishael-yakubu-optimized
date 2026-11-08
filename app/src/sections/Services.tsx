import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, CreditCard, Megaphone, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { servicesWhatsappUrl } from '../lib/contact';

gsap.registerPlugin(ScrollTrigger);

interface Service {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

/** The 15 website integrations, grouped into four cards. Every card leads to the services WhatsApp line. */
const services: Service[] = [
  {
    id: 1,
    title: 'Messaging & Support',
    description: 'Meet customers where they already are and answer them around the clock.',
    icon: MessageCircle,
    features: [
      'WhatsApp Business API',
      'AI Chatbot Integration',
      'Customer Support Automation',
      'Automated Notifications & Emails',
    ],
  },
  {
    id: 2,
    title: 'Payments & Sales',
    description: 'Let visitors pay, book and buy straight from your website.',
    icon: CreditCard,
    features: ['Payment Gateway', 'Online Booking / Appointments', 'E-commerce Integration', 'CRM Integration'],
  },
  {
    id: 3,
    title: 'Marketing & Leads',
    description: 'Capture every enquiry and follow up automatically so no lead goes cold.',
    icon: Megaphone,
    features: ['Lead Generation System', 'Email Marketing Automation', 'Facebook Pixel / Meta Conversion API'],
  },
  {
    id: 4,
    title: 'Analytics & Security',
    description: 'Know what works, connect the tools you already use, and keep it all safe.',
    icon: ShieldCheck,
    features: [
      'Google Analytics & Conversion Tracking',
      'Google Search Console',
      'Third-Party API Integrations',
      'Website Security & Backup',
    ],
  },
];

const enquiry = (s: Service) =>
  `Hello Mishael, I'm interested in "${s.title}" website integrations (${s.features.join(', ')}). I'd like to discuss what fits my business.`;

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
            <h2 className="font-display text-responsive-lg font-bold text-white">ADVANCED WEBSITE INTEGRATIONS</h2>
            <p className="max-w-md font-body text-sm text-white/50">
              Connect your website to the tools that grow your business. Tap any card to talk it through on WhatsApp.
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
                            key={feature}
                            className="flex items-center gap-2.5 border-b border-white/10 pb-2.5 font-body text-xs text-white/75 md:gap-3 md:pb-3 md:text-sm"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                            {feature}
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
                        <span>Discuss on WhatsApp</span>
                        <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
