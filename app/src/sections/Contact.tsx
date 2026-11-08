import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_DISPLAY, WHATSAPP_LOCAL, whatsappUrl } from '../lib/contact';

gsap.registerPlugin(ScrollTrigger);

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: PHONE_DISPLAY,
    href: PHONE_TEL,
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: WHATSAPP_DISPLAY,
    href: whatsappUrl(),
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Ughelli, Delta State, Nigeria',
    href: 'https://www.google.com/maps/search/?api=1&query=Ughelli%2C+Delta+State%2C+Nigeria',
  },
];

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      gsap.fromTo(
        ctaRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );

      gsap.fromTo(
        infoRef.current?.querySelectorAll('.info-item') || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: infoRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative w-full bg-black py-16 md:py-32">
      <div className="w-full px-5 sm:px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div ref={headingRef} className="mb-10 md:mb-20">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-white/50">Get In Touch</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            <h2 className="font-display text-responsive-lg font-bold text-white">LET'S WORK TOGETHER</h2>
            <p className="max-w-md font-body text-sm text-white/50">
              Have a project in mind? Message me on WhatsApp and let's bring your vision to life.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Large WhatsApp call to action */}
          <div
            ref={ctaRef}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-10 md:p-12"
          >
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#25D366]" />
              </span>
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-white">
                Online now
              </span>
            </div>

            <h3 className="font-display text-4xl font-bold leading-[0.95] text-white sm:text-5xl">
              Chat with me on WhatsApp
            </h3>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-white/60 sm:text-base">
              I'm online and ready to talk. Tell me about your project and I'll reply right here, usually
              within minutes.
            </p>

            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="key-btn key-btn-wa mt-8 flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6"
            >
              <span className="flex items-center gap-4 text-left">
                <MessageCircle size={36} strokeWidth={2} fill="currentColor" className="shrink-0" />
                <span className="flex flex-col">
                  <span className="font-display text-2xl font-bold leading-none sm:text-3xl">
                    Chat on WhatsApp
                  </span>
                  <span className="mt-1.5 font-body text-xs font-semibold uppercase tracking-wider opacity-80">
                    Online now · {WHATSAPP_LOCAL}
                  </span>
                </span>
              </span>
              <ArrowUpRight size={30} className="shrink-0" />
            </a>
          </div>

          {/* Contact Info */}
          <div ref={infoRef} className="space-y-8">
            <div className="info-item">
              <h3 className="mb-4 font-display text-xl font-bold text-white">Contact Information</h3>
              <p className="font-body text-sm leading-relaxed text-white/60">
                Prefer another way? Reach out through any of the channels below. I'm always open to
                discussing new projects, creative ideas, or opportunities to be part of your vision.
              </p>
            </div>

            <div className="space-y-5">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const external = item.href.startsWith('http');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="info-item group flex items-start gap-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/20 transition-colors duration-300 group-hover:border-white/40">
                      <Icon
                        size={20}
                        className="text-white/60 transition-colors duration-300 group-hover:text-white"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1 font-body text-xs uppercase tracking-wider text-white/40">{item.label}</p>
                      <p className="break-words font-body text-white transition-colors duration-300 group-hover:text-white/80">
                        {item.value}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="info-item inline-flex items-center gap-3 border border-white/10 bg-white/5 px-6 py-4">
              <span className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
              <div>
                <p className="font-body text-sm text-white">Available for new projects</p>
                <p className="font-body text-xs text-white/50">Based in Ughelli, Delta State</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
