import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-[#f7f6f3]">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: [0, 12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -right-32 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-lime-100/50 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-24 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-gray-200/40 to-transparent blur-2xl"
        />
        <motion.div
          animate={{ x: [0, 40, 0], rotate: [8, 16, 8] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-16 right-1/4 w-56 h-56 border border-gray-300/40 rounded-[2rem]"
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Text side */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-4"
            >
              Empire Digitals Worldwide
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-serif text-5xl sm:text-6xl lg:text-[4.6rem] leading-[0.92] tracking-tight text-[#111]"
            >
              Digital<br />experiences<br />
              <span className="italic text-lime-700">that perform.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-gray-600 max-w-md mx-auto lg:mx-0"
            >
              Websites, brand systems and AI automation built for clarity and results across Delta State.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <a href="#work" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium">
                View Work <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#/about" className="inline-flex items-center gap-2 border border-gray-300 bg-white px-6 py-3.5 rounded-full text-sm font-medium">
                About Mishael
              </a>
            </motion.div>
          </div>

          {/* Visual side — floating framed images */}
          <div className="lg:col-span-6 relative h-[420px] sm:h-[480px] lg:h-[520px]">
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="absolute left-4 top-8 w-44 sm:w-52 bg-white p-2 rounded-2xl shadow-xl border border-gray-100"
            >
              <img src="/images/gallery1.webp" alt="Development" className="w-full h-32 sm:h-36 object-cover rounded-xl" />
              <p className="text-xs font-medium mt-2 px-1">Web Development</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="absolute right-2 top-24 w-48 sm:w-56 bg-white p-2 rounded-2xl shadow-2xl border border-gray-100"
            >
              <img src="/images/about1.webp" alt="Mishael" className="w-full h-40 sm:h-48 object-cover rounded-xl" />
              <p className="text-xs font-medium mt-2 px-1">Founder</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -5 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="absolute left-12 bottom-6 w-40 sm:w-48 bg-white p-2 rounded-2xl shadow-xl border border-gray-100"
            >
              <img src="/images/gallery2.webp" alt="Coaching" className="w-full h-28 sm:h-32 object-cover rounded-xl" />
              <p className="text-xs font-medium mt-2 px-1">Tech Coaching</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-8 bottom-16 w-36 bg-black text-white p-3 rounded-2xl shadow-lg text-xs"
            >
              <p className="font-medium">AI Automation</p>
              <p className="text-white/70 mt-1">Systems that work while you sleep</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
