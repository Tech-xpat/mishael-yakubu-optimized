import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

function InteractiveCard({ src, label, className, delay = 0 }: { src: string; label: string; className?: string; delay?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, type: "spring" }}
      style={{ rotateX, rotateY, x, y }}
      drag
      dragConstraints={{ left: -40, right: 40, top: -30, bottom: 30 }}
      dragElastic={0.15}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.04, zIndex: 20 }}
      className={`absolute bg-white p-2.5 rounded-2xl shadow-2xl border border-gray-100/80 cursor-grab active:cursor-grabbing ${className}`}
    >
      <div className="overflow-hidden rounded-xl">
        <img src={src} alt={label} className="w-full h-full object-cover" />
      </div>
      <p className="text-[11px] font-medium mt-2 px-1 text-gray-800">{label}</p>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.25, 0.45]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden bg-[#f7f6f3]">
      {/* Climbing background layer */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-lime-100/60 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/4 -left-32 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-gray-200/50 to-transparent blur-2xl" />
        <motion.div
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-1/3 w-72 h-72 border border-gray-300/30 rounded-[2.5rem]"
        />
      </motion.div>

      {/* Shadow that appears as background climbs */}
      <motion.div
        style={{ opacity: shadowOpacity }}
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-5"
            >
              Empire Digitals Worldwide
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.92] tracking-tight text-[#111]"
            >
              Digital<br />experiences<br />
              <span className="italic text-lime-700">that perform.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-gray-600 max-w-md mx-auto lg:mx-0"
            >
              Websites, brand systems and AI automation built for clarity and results across Delta State.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <a href="#work" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-gray-900 transition">
                View Work <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#/about" className="inline-flex items-center gap-2 border border-gray-300 bg-white/80 backdrop-blur px-6 py-3.5 rounded-full text-sm font-medium hover:bg-white transition">
                About Mishael
              </a>
            </motion.div>
          </div>

          {/* Interactive visual cards — better spaced on desktop */}
          <div className="relative h-[460px] lg:h-[520px]">
            <InteractiveCard
              src="/images/gallery1.webp"
              label="Web Development"
              className="left-0 top-6 w-44 sm:w-52 h-40 sm:h-44"
              delay={0.25}
            />
            <InteractiveCard
              src="/images/about1.webp"
              label="Founder"
              className="right-0 top-20 w-52 sm:w-60 h-52 sm:h-60"
              delay={0.4}
            />
            <InteractiveCard
              src="/images/gallery2.webp"
              label="Tech Coaching"
              className="left-8 bottom-8 w-40 sm:w-48 h-36 sm:h-40"
              delay={0.55}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              drag
              dragConstraints={{ left: -30, right: 30, top: -20, bottom: 20 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-6 bottom-12 bg-black text-white p-4 rounded-2xl shadow-xl w-40 cursor-grab active:cursor-grabbing"
            >
              <p className="text-sm font-medium">AI Automation</p>
              <p className="text-xs text-white/70 mt-1">Systems that run while you sleep</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
