import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, Palette, Bot, Terminal, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Service {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

const services: Service[] = [
  {
    id: 1,
    title: 'Web Development',
    description:
      'Building high-performance, responsive websites and web applications using modern technologies.',
    icon: Code,
    features: [
      'React & Next.js',
      'TypeScript',
      'Node.js Backend',
      'API Integration',
    ],
  },
  {
    id: 2,
    title: 'Brand Design',
    description:
      'Creating distinctive brand identities that communicate your values and resonate with your audience.',
    icon: Palette,
    features: [
      'Logo Design',
      'Brand Strategy',
      'Visual Identity',
      'Brand Guidelines',
    ],
  },
  {
    id: 3,
    title: 'AI Automation',
    description:
      'Implementing intelligent automation solutions to streamline workflows and boost productivity.',
    icon: Bot,
    features: [
      'Workflow Automation',
      'Chatbot Development',
      'Data Processing',
      'AI Integration',
    ],
  },
  {
    id: 4,
    title: 'Software Dev',
    description:
      'Developing custom software solutions tailored to your specific business requirements.',
    icon: Terminal,
    features: [
      'Custom Applications',
      'SaaS Products',
      'Database Design',
      'Cloud Solutions',
    ],
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll('.service-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { rotateY: 90, opacity: 0, z: -500 },
          {
            rotateY: 0,
            opacity: 1,
            z: 0,
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Card tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    setHoveredCard(cardId);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform =
      'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    setHoveredCard(null);
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full min-h-screen bg-black py-20 md:py-32"
    >
      <div className="w-full px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div ref={headingRef} className="mb-16 md:mb-24">
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
            What I Do
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-display text-responsive-lg font-bold text-white">
              MY EXPERTISE
            </h2>
            <p className="text-sm text-white/50 font-body max-w-md">
              Combining technical expertise with creative vision to deliver
              comprehensive digital solutions.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{ perspective: '1000px' }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            const isHovered = hoveredCard === service.id;

            return (
              <div
                key={service.id}
                className="service-card relative group"
                onMouseMove={(e) => handleMouseMove(e, service.id)}
                onMouseLeave={handleMouseLeave}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div
                  className={`relative p-8 md:p-10 h-full border transition-all duration-500 ${
                    isHovered
                      ? 'border-white/30 bg-white/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                    style={{
                      background: `radial-gradient(circle at ${isHovered ? '50% 50%' : '50% 50%'}, rgba(255,255,255,0.1) 0%, transparent 70%)`,
                    }}
                  />

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div
                      className={`w-14 h-14 flex items-center justify-center border transition-all duration-500 ${
                        isHovered
                          ? 'border-white/40 bg-white/10'
                          : 'border-white/20 bg-transparent'
                      }`}
                    >
                      <Icon
                        size={24}
                        className={`transition-colors duration-300 ${
                          isHovered ? 'text-white' : 'text-white/60'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                    {service.title}
                  </h3>

                  <p className="text-sm text-white/60 font-body leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-white/50 font-body"
                      >
                        <span className="w-1 h-1 bg-white/40 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div
                    className={`flex items-center gap-2 text-sm font-body tracking-wider uppercase transition-all duration-300 ${
                      isHovered ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    <span>Learn More</span>
                    <ArrowRight
                      size={16}
                      className={`transform transition-transform duration-300 ${
                        isHovered ? 'translate-x-2' : ''
                      }`}
                    />
                  </div>

                  {/* Index */}
                  <div className="absolute top-8 right-8">
                    <span className="font-display text-5xl font-bold text-white/5">
                      0{service.id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
