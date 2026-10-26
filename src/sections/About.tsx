import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 md:order-1"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3">About</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight text-[#111]">
            The Visionary
          </h2>
          <p className="mt-5 text-gray-600 leading-relaxed">
            Mishael Yakubu is a web developer, tech coach and founder of Empire Digitals Worldwide, based in Delta State. He builds modern digital products and mentors the next generation of African developers.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            From high-performance websites to AI automation and brand design, every project is built for clarity, speed and lasting impact.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 md:order-2 flex justify-center"
        >
          <div className="bg-gray-50 p-4 rounded-[2rem] shadow-lg border border-gray-100">
            <img
              src="/images/about1.webp"
              alt="Mishael Yakubu in studio"
              className="w-full max-w-sm h-[420px] object-cover rounded-[1.5rem]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
