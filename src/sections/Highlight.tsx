import { motion } from "framer-motion";

const highlights = [
  { src: "/images/gallery1.webp", label: "Coding & Development" },
  { src: "/images/gallery2.webp", label: "Tech Coaching" },
  { src: "/images/about2.webp", label: "Creative Process" },
  { src: "/images/gallery3.webp", label: "Studio Work" },
];

export default function Highlight() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">In Practice</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2 text-[#111]">How the work happens</h2>
          </div>
          <a href="#/about" className="text-sm text-gray-500 hover:text-black hidden md:inline">More about Mishael →</a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group"
            >
              <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-48 md:h-56 object-cover rounded-xl group-hover:scale-[1.03] transition duration-500"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-800">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 md:hidden text-center">
          <a href="#/about" className="text-sm text-gray-500 hover:text-black">More about Mishael →</a>
        </div>
      </div>
    </section>
  );
}
