import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

      // Form animation
      gsap.fromTo(
        formRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Info animation
      gsap.fromTo(
        infoRef.current?.querySelectorAll('.info-item') || [],
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset submitted state after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'empiredigitalsworldwide@gmail.com',
      href: 'mailto:empiredigitalsworldwide@gmail.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+234 814 265 6848',
      href: 'tel:+2348142656848',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+234 708 675 7575',
      href: 'https://wa.me/2347086757575',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Lagos, Nigeria',
      href: '#',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full min-h-screen bg-black py-20 md:py-32"
    >
      <div className="w-full px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div ref={headingRef} className="mb-16 md:mb-24">
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-body mb-4">
            Get In Touch
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-display text-responsive-lg font-bold text-white">
              LET'S WORK TOGETHER
            </h2>
            <p className="text-sm text-white/50 font-body max-w-md">
              Have a project in mind? Let's discuss how we can bring your vision
              to life.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-white/50 font-body tracking-wider uppercase mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-white/50 focus:ring-0 rounded-none h-12"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 font-body tracking-wider uppercase mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-white/50 focus:ring-0 rounded-none h-12"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 font-body tracking-wider uppercase mb-2">
                Subject
              </label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-white/50 focus:ring-0 rounded-none h-12"
                placeholder="Project inquiry"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 font-body tracking-wider uppercase mb-2">
                Message
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-white/50 focus:ring-0 rounded-none resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-6 bg-white text-black font-body text-sm tracking-wider uppercase hover:bg-white/90 transition-all duration-300 rounded-none disabled:opacity-50"
            >
              {isSubmitting ? (
                'Sending...'
              ) : submitted ? (
                'Message Sent!'
              ) : (
                <>
                  Send Message
                  <Send size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Contact Info */}
          <div ref={infoRef} className="space-y-8">
            <div className="info-item">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Contact Information
              </h3>
              <p className="text-sm text-white/60 font-body leading-relaxed">
                Feel free to reach out through any of the channels below. I'm
                always open to discussing new projects, creative ideas, or
                opportunities to be part of your vision.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="info-item flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-colors duration-300">
                      <Icon
                        size={20}
                        className="text-white/60 group-hover:text-white transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 font-body tracking-wider uppercase mb-1">
                        {item.label}
                      </p>
                      <p className="text-white font-body group-hover:text-white/80 transition-colors duration-300">
                        {item.value}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Availability Badge */}
            <div className="info-item inline-flex items-center gap-3 px-6 py-4 border border-white/10 bg-white/5">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div>
                <p className="text-sm text-white font-body">
                  Available for new projects
                </p>
                <p className="text-xs text-white/50 font-body">
                  Typical response time: 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
