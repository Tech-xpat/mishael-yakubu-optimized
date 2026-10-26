import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

type Item = { id: string; title: string; image_url: string; description?: string };

export default function Portfolio() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase.from("portfolio_items").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  return (
    <section id="portfolio" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3">Portfolio</p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#111]">Selected Work</h2>
          <p className="mt-3 text-gray-500">Websites, brand systems, and digital products</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6 }}
              className="group relative h-80"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-md border border-gray-100">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="font-medium">{item.title}</p>
                  {item.description && <p className="text-xs text-white/80 mt-1 line-clamp-2">{item.description}</p>}
                </div>
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              Portfolio items will appear here once uploaded from the admin panel.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
