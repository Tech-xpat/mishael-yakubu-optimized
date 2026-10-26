import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Item = { id: string; title: string; image_url: string; description?: string };

export default function Portfolio() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
      });
  }, []);

  return (
    <section id="portfolio" className="py-24 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">Selected Work</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-12">Portfolio</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative h-80 perspective-1000">
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-zinc-900 shadow-lg">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="font-medium text-sm">{item.title}</p>
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 rounded-2xl p-6 flex flex-col justify-center border border-white/10">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {item.description || "Custom digital solution by Empire Digitals Worldwide."}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-white/40 py-16">
              Upload portfolio items from the admin panel. They will appear here as flip cards.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
