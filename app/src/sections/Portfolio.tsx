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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg bg-zinc-900">
              <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-medium">{item.title}</p>
                {item.description && <p className="text-xs text-white/70 mt-1">{item.description}</p>}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-white/40 py-16">Upload work from the admin to populate this section.</p>
          )}
        </div>
      </div>
    </section>
  );
}
