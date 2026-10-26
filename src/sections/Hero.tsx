import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-4"
          >
            Empire Digitals Worldwide
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[#111]"
          >
            Gone Digital.<br />
            <span className="italic text-lime-600">The future is now.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-gray-600 max-w-md"
          >
            Mishael Yakubu — web developer, tech coach and founder building high-performance digital experiences for brands across Delta State and beyond.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a href="#contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
              Start a Project <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#gallery" className="inline-flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition">
              <Play className="w-4 h-4" /> View Work
            </a>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div 
            animate={{ y: [0, -12, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img src="/images/hero.webp" alt="Mishael Yakubu" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl" />
          </motion.div>
          
          {/* Floating cards */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.5 }}
            className="absolute -left-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 w-48"
          >
            <p className="text-xs text-gray-500">Web Development</p>
            <p className="font-medium text-sm mt-1">Next.js · React · TypeScript</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 40 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.7 }}
            className="absolute -right-4 bottom-16 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 w-44"
          >
            <p className="text-xs text-gray-500">AI Automation</p>
            <p className="font-medium text-sm mt-1">Agents · Workflows</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
