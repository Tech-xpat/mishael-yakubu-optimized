import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown, ExternalLink, Play } from 'lucide-react';
import { fetchItems, cachedItems, type PortfolioItem } from '../lib/portfolioApi';
import { cachedConfig, fetchConfig, subcategoriesFor, EMPTY_CONFIG, type CategoryConfig } from '../lib/categories';
import { titleToSlug, isVideoUrl, type HomeSectionDef } from '../lib/homeSections';
import { CardGridSkeleton } from './Skeletons';
import CategoryCard from './CategoryCard';
import EmptyFold from './EmptyFold';

gsap.registerPlugin(ScrollTrigger);

/** How many projects a card shows openly; the rest are folded behind a button. */
const OPEN_PROJECTS = 2;
/** How many filled categories a section shows openly; the rest are folded behind a button. */
const OPEN_GROUPS = 2;

interface Group {
  title: string;
  slug: string;
  items: PortfolioItem[];
}

function Thumb({ item, className = '' }: { item: PortfolioItem; className?: string }) {
  return isVideoUrl(item.image_url) ? (
    <div className={`flex items-center justify-center bg-white/10 ${className}`}>
      <Play size={28} className="text-white/70" />
    </div>
  ) : (
    <img
      src={item.image_url}
      alt={item.title}
      loading="lazy"
      decoding="async"
      className={`bg-white/5 object-cover ${className}`}
    />
  );
}

/** A project: opens its website if it has one, otherwise the category page. */
function ProjectLink({ item, to, children, className }: { item: PortfolioItem; to: string; children: React.ReactNode; className: string }) {
  return item.website_url ? (
    <a href={item.website_url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function GroupCard({ def, group }: { def: HomeSectionDef; group: Group }) {
  const [open, setOpen] = useState(false);
  const to = group.slug ? `/portfolio/${def.type}/${group.slug}` : `/portfolio/${def.type}`;
  const shown = group.items.slice(0, OPEN_PROJECTS);
  const rest = group.items.slice(OPEN_PROJECTS);

  return (
    <article className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{group.title}</h3>
        <span className="shrink-0 text-xs text-white/50">
          {group.items.length} project{group.items.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className={`grid gap-3 ${shown.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {shown.map((item) => (
          <ProjectLink key={item.id} item={item} to={to} className="group relative block overflow-hidden rounded-lg border border-white/10">
            <Thumb item={item} className={`${shown.length > 1 ? "aspect-[4/3]" : "aspect-[16/9]"} w-full transition-transform duration-500 group-hover:scale-105`} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8">
              <p className="line-clamp-1 text-sm font-medium text-white">{item.title}</p>
            </div>
            {item.website_url && <ExternalLink size={14} className="absolute right-2 top-2 text-white/80" />}
          </ProjectLink>
        ))}
      </div>

      {rest.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10"
          >
            <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            {open ? 'Show less' : `Show ${rest.length} more`}
          </button>
          <div
            inert={!open}
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
              open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <ul className="space-y-2">
                {rest.map((item) => (
                  <li key={item.id}>
                    <ProjectLink item={item} to={to} className="flex items-center gap-3 rounded-lg border border-white/10 p-2 hover:bg-white/10">
                      <Thumb item={item} className="h-14 w-14 shrink-0 rounded-md" />
                      <span className="min-w-0 flex-1 truncate text-sm text-white">{item.title}</span>
                      {item.website_url && <ExternalLink size={14} className="shrink-0 text-white/60" />}
                    </ProjectLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      <Link to={to} className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
        Open full collection <ArrowRight size={14} />
      </Link>
    </article>
  );
}

const grid = 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3';

/** One home-page section (Web Development, Brand Design, AI Automation), fed by the admin's uploads. */
export default function CategorySection({ def }: { def: HomeSectionDef }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<PortfolioItem[] | null>(() => cachedItems(def.category));
  const [config, setConfig] = useState<CategoryConfig>(() => cachedConfig() ?? EMPTY_CONFIG);

  useEffect(() => {
    let alive = true;
    fetchItems(def.category)
      .then((rows) => alive && setItems(rows))
      .catch(() => alive && setItems((prev) => prev ?? []));
    fetchConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, [def.category]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: headingRef.current, start: 'top 88%', toggleActions: 'play none none reverse' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Group by subcategory (known ones first, then any the admin typed), best-positioned items first.
  let filled: Group[] = [];
  let empty: Group[] = [];
  if (items) {
    const seen = items.map((i) => i.subcategory).filter(Boolean) as string[];
    const names = subcategoriesFor(def.category, config, seen);
    const groups: Group[] = names.map((n) => ({
      title: n,
      slug: titleToSlug(n),
      items: items.filter((i) => (i.subcategory || '').toLowerCase() === n.toLowerCase()),
    }));
    const loose = items.filter((i) => !i.subcategory || !names.some((n) => n.toLowerCase() === i.subcategory!.toLowerCase()));
    if (loose.length) groups.unshift({ title: names.length ? 'More projects' : def.title, slug: '', items: loose });
    filled = groups.filter((g) => g.items.length > 0);
    empty = groups.filter((g) => g.items.length === 0);
  }

  const openGroups = filled.slice(0, OPEN_GROUPS);
  const foldedGroups = filled.slice(OPEN_GROUPS);
  const card = (g: Group) => <GroupCard key={g.title} def={def} group={{ ...g, slug: g.slug || '' }} />;

  return (
    <section ref={sectionRef} className="relative w-full bg-black px-5 py-14 sm:px-6 md:px-12 md:py-32 lg:px-20">
      <div ref={headingRef} className="mb-10 md:mb-16">
        <p className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-white/50">Portfolio</p>
        <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{def.title}</h2>
        <p className="max-w-2xl text-lg text-white/60">{def.description} The best work is shown first; tap a button to see more.</p>
      </div>

      {items === null ? (
        <CardGridSkeleton count={3} />
      ) : filled.length === 0 ? (
        <>
          <p className="text-white/50">Projects are being added. Check back soon.</p>
          <EmptyFold count={empty.length} noun="category" plural="categories">
            <div className={grid}>
              {empty.map((g) => (
                <CategoryCard key={g.title} to={`/portfolio/${def.type}/${g.slug}`} title={g.title} count={0} unit="project" />
              ))}
            </div>
          </EmptyFold>
        </>
      ) : (
        <>
          <div className={grid}>{openGroups.map(card)}</div>

          <EmptyFold count={foldedGroups.length} noun="category" plural="categories" adjective="more">
            <div className={grid}>{foldedGroups.map(card)}</div>
          </EmptyFold>

          <EmptyFold count={empty.length} noun="category" plural="categories">
            <div className={grid}>
              {empty.map((g) => (
                <CategoryCard key={g.title} to={`/portfolio/${def.type}/${g.slug}`} title={g.title} count={0} unit="project" />
              ))}
            </div>
          </EmptyFold>
        </>
      )}
    </section>
  );
}
