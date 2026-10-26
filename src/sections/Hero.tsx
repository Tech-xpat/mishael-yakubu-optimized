import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center pt-20 overflow-hidden bg-[#f8f7f4]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 5, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-lime-50/80 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-24 right-1/4 w-64 h-64 border border-gray-200/40 rounded-3xl rotate-6"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6">
          Empire Digitals Worldwide
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[#111]"
        >
          Digital experiences<br />
          <span className="italic text-lime-700">built to perform.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-lg text-gray-600 max-w-xl mx-auto"
        >
          High-performance websites, brand systems, and AI automation for businesses across Delta State and beyond.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <a href="#work" className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-gray-900 transition">
            View Selected Work <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
