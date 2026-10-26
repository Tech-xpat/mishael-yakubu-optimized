import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] py-20">
      <div className="max-w-4xl mx-auto px-6">
        <a href="/" className="text-sm text-gray-500 hover:text-black">← Back to portfolio</a>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">About</p>
          <h1 className="font-serif text-5xl mt-3 text-[#111]">Mishael Yakubu</h1>
          <p className="mt-4 text-gray-600 max-w-lg">
            Web developer, tech coach and founder of Empire Digitals Worldwide, based in Delta State, Nigeria.
          </p>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <img src="/images/hero.webp" alt="Mishael Yakubu" className="w-full h-80 object-cover rounded-xl" />
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <img src="/images/about1.webp" alt="In studio" className="w-full h-80 object-cover rounded-xl" />
          </div>
        </div>

        <div className="mt-12 prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">
            Mishael builds modern web applications, mentors aspiring developers, and delivers AI automation and brand design for clients across Warri, Ughelli and Delta State. Empire Digitals Worldwide focuses on clarity, performance and practical results.
          </p>
        </div>
      </div>
    </div>
  );
}
