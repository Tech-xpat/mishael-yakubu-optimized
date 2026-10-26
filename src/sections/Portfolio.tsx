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
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-serif text-4xl md:text-5xl text-center mb-4">Selected Work</h2>
        <p className="text-center text-gray-500 mb-12">Websites, flyers and digital products — hover to flip</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.03 }}
              className="group relative h-80 perspective-1000"
            >
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-lg">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 text-white">
                    <p className="font-medium">{item.title}</p>
                  </div>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#111] text-white rounded-2xl p-6 flex flex-col justify-center">
                  <h3 className="font-serif text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.description || "Custom digital solution by Empire Digitals"}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-12">Upload portfolio items from the admin panel to see them here.</p>
          )}
        </div>
      </div>
    </section>
  );
}
