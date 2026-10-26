import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Background climbs upward while hero content stays fixed
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.4]);

  return (
    <section ref={ref} className="relative min-h-[110vh] bg-[#faf9f7]">
      {/* Climbing background — moves up on scroll */}
      <motion.div
        style={{ y: bgY, opacity: bgOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-lime-100/40 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-gray-100 to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-white to-transparent" />
      </motion.div>

      {/* Static hero content */}
      <div className="sticky top-0 min-h-screen flex items-center pt-20">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text block — centered, editorial */}
            <div className="text-center lg:text-left z-10">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-6">
                Empire Digitals Worldwide
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.8rem] leading-[0.9] tracking-tight text-[#111]">
                Digital<br />
                experiences<br />
                <span className="italic text-lime-700">that perform.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-sm mx-auto lg:mx-0">
                Websites, brand systems and AI automation for businesses across Delta State.
              </p>
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium"
                >
                  View Work <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#/about"
                  className="inline-flex items-center gap-2 border border-gray-300 bg-white px-6 py-3.5 rounded-full text-sm font-medium"
                >
                  About Mishael
                </a>
              </div>
            </div>

            {/* Floating cards — spring back to origin */}
            <div className="relative h-[480px] lg:h-[520px]">
              <motion.div
                drag
                dragConstraints={{ left: -30, right: 30, top: -20, bottom: 20 }}
                dragElastic={0.12}
                whileDrag={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="absolute left-4 top-8 w-44 sm:w-52 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 cursor-grab active:cursor-grabbing"
              >
                <img src="/images/gallery1.webp" alt="Development" className="w-full h-32 object-cover rounded-xl" />
                <p className="text-xs font-medium mt-2 px-1">Web Development</p>
              </motion.div>

              <motion.div
                drag
                dragConstraints={{ left: -25, right: 25, top: -15, bottom: 15 }}
                dragElastic={0.1}
                whileDrag={{ scale: 1.02 }}
                className="absolute right-0 top-24 w-52 sm:w-60 bg-white p-2.5 rounded-2xl shadow-2xl border border-gray-100 cursor-grab active:cursor-grabbing"
              >
                <img src="/images/about1.webp" alt="Mishael" className="w-full h-44 object-cover rounded-xl" />
                <p className="text-xs font-medium mt-2 px-1">Founder · Mishael Yakubu</p>
              </motion.div>

              <motion.div
                drag
                dragConstraints={{ left: -20, right: 20, top: -12, bottom: 12 }}
                dragElastic={0.1}
                className="absolute left-10 bottom-10 w-40 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 cursor-grab active:cursor-grabbing"
              >
                <img src="/images/gallery2.webp" alt="Coaching" className="w-full h-28 object-cover rounded-xl" />
                <p className="text-xs font-medium mt-2 px-1">Tech Coaching</p>
              </motion.div>

              <motion.div
                drag
                dragConstraints={{ left: -15, right: 15, top: -10, bottom: 10 }}
                className="absolute right-6 bottom-16 bg-black text-white px-4 py-3 rounded-2xl shadow-lg w-36 cursor-grab active:cursor-grabbing"
              >
                <p className="text-sm font-medium">AI Automation</p>
                <p className="text-[11px] text-white/70 mt-1">Always on</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
