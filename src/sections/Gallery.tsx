import { motion } from "framer-motion";

const items = [
  { src: "/images/gallery1.webp", title: "Coding Session" },
  { src: "/images/gallery2.webp", title: "Tech Coaching" },
  { src: "/images/gallery3.webp", title: "Creative Studio" },
  { src: "/images/gallery5.webp", title: "Portrait" },
  { src: "/images/gallery6.webp", title: "Workshop" },
  { src: "/images/about2.webp", title: "In Focus" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 text-center mb-3">Visual Archive</p>
        <h2 className="font-serif text-4xl md:text-5xl text-center mb-12">Mishael in Frame</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group"
            >
              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-56 md:h-64 object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <p className="text-sm font-medium mt-3 px-1 text-gray-800">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
