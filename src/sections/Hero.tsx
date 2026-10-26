import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[#f8f7f4]">
      {/* 3D-style animated background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-lime-100/40 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ rotate: [0, -12, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-gray-200/50 to-transparent blur-2xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-1/4 w-64 h-64 border border-gray-200/60 rounded-3xl rotate-12"
        />
        <motion.div
          animate={{ x: [0, -20, 0], rotate: [12, 20, 12] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-1/3 w-48 h-48 border border-lime-200/40 rounded-2xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-5"
          >
            Empire Digitals Worldwide · Delta State
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-[4.2rem] leading-[0.92] tracking-tight text-[#111]"
          >
            Gone Digital.<br />
            <span className="italic text-lime-700">The future is now.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-base md:text-lg text-gray-600 max-w-md leading-relaxed"
          >
            Mishael Yakubu builds high-performance websites, mentors developers, and delivers AI-powered automation for brands across Warri, Ughelli and Delta State.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-gray-900 transition">
              Start a Project <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#portfolio" className="inline-flex items-center gap-2 border border-gray-300 bg-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-gray-50 transition">
              <Play className="w-4 h-4" /> View Work
            </a>
          </motion.div>
        </div>

        {/* Boxed portrait with floating framed cards */}
        <div className="relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-white p-3 rounded-[2rem] shadow-2xl border border-gray-100">
              <img
                src="/images/hero.webp"
                alt="Mishael Yakubu"
                className="w-[280px] md:w-[340px] h-[380px] md:h-[460px] object-cover rounded-[1.6rem]"
              />
            </div>

            {/* Floating boxed cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-12 top-16 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 w-40"
            >
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Web Dev</p>
              <p className="text-sm font-medium mt-0.5">Next.js · React</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-10 bottom-24 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 w-36"
            >
              <p className="text-[10px] uppercase tracking-wider text-gray-400">AI Systems</p>
              <p className="text-sm font-medium mt-0.5">Automation</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
