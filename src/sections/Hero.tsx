import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen bg-[#faf9f7] overflow-hidden">
      {/* Static hero — stays fixed */}
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div className="text-center lg:text-left z-10">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-5">
              Empire Digitals Worldwide
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.6rem] leading-[0.9] tracking-tight text-[#111]">
              Digital<br />experiences<br />
              <span className="italic text-lime-700">that perform.</span>
            </h1>
            <p className="mt-5 text-base text-gray-600 max-w-sm mx-auto lg:mx-0">
              Websites, brand systems and AI automation for businesses across Delta State.
            </p>
            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              <a href="#work" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium">
                View Work <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#/about" className="inline-flex items-center gap-2 border border-gray-300 bg-white px-6 py-3.5 rounded-full text-sm font-medium">
                About Mishael
              </a>
            </div>
          </div>

          {/* Single B&W portrait with floating cards */}
          <div className="relative h-[420px] lg:h-[500px] flex items-center justify-center">
            {/* Central black & white image */}
            <div className="relative z-10">
              <img
                src="/images/hero.webp"
                alt="Mishael Yakubu"
                className="w-64 sm:w-72 lg:w-80 h-[340px] sm:h-[380px] lg:h-[420px] object-cover rounded-3xl grayscale contrast-125"
              />
            </div>

            {/* Floating experience cards */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute left-0 top-16 bg-white px-4 py-3 rounded-2xl shadow-lg border border-gray-100 w-36"
            >
              <p className="text-lg font-semibold text-[#111]">6+</p>
              <p className="text-[11px] text-gray-500">Years Experience</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="absolute right-0 top-24 bg-white px-4 py-3 rounded-2xl shadow-lg border border-gray-100 w-40"
            >
              <p className="text-sm font-medium text-[#111]">Web Development</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Next.js · React</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute left-4 bottom-12 bg-white px-4 py-3 rounded-2xl shadow-lg border border-gray-100 w-36"
            >
              <p className="text-sm font-medium text-[#111]">AI Automation</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Agents & Workflows</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="absolute right-2 bottom-20 bg-black text-white px-4 py-3 rounded-2xl shadow-lg w-32"
            >
              <p className="text-sm font-medium">Tech Coaching</p>
              <p className="text-[11px] text-white/70 mt-0.5">Mentorship</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
