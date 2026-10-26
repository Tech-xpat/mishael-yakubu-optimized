import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

type Item = {
  id: string;
  title: string;
  image_url: string;
  description?: string | null;
  category?: string;
  website_url?: string | null;
};

const CATEGORIES = [
  { slug: "all", name: "All" },
  { slug: "web", name: "Web Development" },
  { slug: "website", name: "Live Websites" },
  { slug: "flyer", name: "Flyers" },
  { slug: "brand", name: "Brand Design" },
  { slug: "ai", name: "AI Automation" },
];

export default function Portfolio() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
      });
  }, []);

  const filtered =
    filter === "all"
      ? items
      : items.filter((i) => (i.category || "web") === filter);

  return (
    <section id="portfolio" className="py-24 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
          Selected Work
        </p>
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Portfolio</h2>

        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setFilter(c.slug)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filter === c.slug
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => {
            const isWebsite = !!(item.website_url && item.category === "website");

            return (
              <div key={item.id} className="group relative h-80">
                <div className="relative w-full h-full [perspective:1000px]">
                  <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                    {/* Front */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden bg-zinc-900 shadow-lg">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] uppercase tracking-wider text-white/50">
                          {CATEGORIES.find((c) => c.slug === item.category)?.name ||
                            item.category ||
                            "Work"}
                        </p>
                        <p className="font-medium text-sm">{item.title}</p>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-zinc-900 rounded-2xl p-6 flex flex-col justify-center border border-white/10">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-white/70 leading-relaxed mb-4">
                        {item.description ||
                          "Custom digital solution by Empire Digitals Worldwide."}
                      </p>
                      {isWebsite && item.website_url && (
                        <a
                          href={item.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full w-fit transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                          Open live site
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct click for websites without needing flip */}
                {isWebsite && item.website_url && (
                  <a
                    href={item.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 rounded-2xl"
                    aria-label={`Open ${item.title}`}
                  />
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full text-center text-white/40 py-16">
              {items.length === 0
                ? "Upload portfolio items from the admin panel."
                : "No items in this category yet."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
