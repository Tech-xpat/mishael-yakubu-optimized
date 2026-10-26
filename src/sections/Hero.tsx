import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen bg-[#faf9f7]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-6 items-center">
          {/* Text */}
          <div className="text-center lg:text-left z-10">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-4">
              Empire Digitals Worldwide
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[0.92] tracking-tight text-[#111]">
              Digital<br />experiences<br />
              <span className="italic text-lime-700">that perform.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xs mx-auto lg:mx-0">
              Websites, brand systems and AI automation for businesses across Delta State.
            </p>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
              <a href="#work" className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full text-sm font-medium">
                View Work <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#/about" className="inline-flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 rounded-full text-sm font-medium">
                About Mishael
              </a>
            </div>
          </div>

          {/* Pure image — no background, no frame */}
          <div className="relative h-[380px] sm:h-[440px] flex items-center justify-center">
            <img
              src="/images/hero.webp"
              alt="Mishael Yakubu"
              className="relative z-10 w-56 sm:w-64 lg:w-72 h-auto object-contain grayscale contrast-110"
            />

            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute left-0 top-10 bg-white/95 backdrop-blur px-3 py-2.5 rounded-xl shadow-md border border-gray-100 w-32"
            >
              <p className="text-base font-semibold">6+</p>
              <p className="text-[10px] text-gray-500">Years Experience</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="absolute right-0 top-16 bg-white/95 backdrop-blur px-3 py-2.5 rounded-xl shadow-md border border-gray-100 w-36"
            >
              <p className="text-xs font-medium">Web Development</p>
              <p className="text-[10px] text-gray-500">Next.js · React</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute left-2 bottom-8 bg-white/95 backdrop-blur px-3 py-2.5 rounded-xl shadow-md border border-gray-100 w-32"
            >
              <p className="text-xs font-medium">AI Automation</p>
              <p className="text-[10px] text-gray-500">Agents</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="absolute right-2 bottom-16 bg-black text-white px-3 py-2.5 rounded-xl shadow-md w-28"
            >
              <p className="text-xs font-medium">Tech Coaching</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
