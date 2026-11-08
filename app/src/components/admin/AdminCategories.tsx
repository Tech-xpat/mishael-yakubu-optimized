import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Trash2, X, Plus, ExternalLink, Pencil, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  CONFIG_PATH,
  allCategories,
  slugify,
  subcategoriesFor,
  BUILTIN_SUBCATEGORIES,
  type CategoryConfig,
} from '../../lib/categories';

interface Item {
  category?: string;
  subcategory?: string | null;
}

interface Props {
  config: CategoryConfig;
  items: Item[];
  onConfig: (cfg: CategoryConfig) => void;
}

const field =
  'w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40 text-white';

/** Admin tool: create / rename / remove categories and subcategories. Changes go live on the site immediately. */
export default function AdminCategories({ config, items, onConfig }: Props) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'folder' | 'play'>('folder');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [subDraft, setSubDraft] = useState<Record<string, string>>({});
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const cats = allCategories(config, items.map((i) => i.category || 'web'));
  const countOf = (slug: string) => items.filter((i) => (i.category || 'web') === slug).length;
  const subCount = (slug: string, sub: string) =>
    items.filter((i) => (i.category || 'web') === slug && i.subcategory === sub).length;

  const save = async (next: CategoryConfig, ok: string) => {
    setBusy(true);
    setNote('Saving...');
    const body = new Blob([JSON.stringify(next)], { type: 'application/json' });
    const { error } = await supabase.storage
      .from('portfolio')
      .upload(CONFIG_PATH, body, { upsert: true, contentType: 'application/json', cacheControl: '30' });
    setBusy(false);
    if (error) {
      setNote('Could not save: ' + error.message);
      return false;
    }
    onConfig(next);
    setNote(ok);
    return true;
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    const slug = slugify(clean);
    if (!clean || !slug) return setNote('Type a category name');
    if (cats.some((c) => c.slug === slug || c.name.toLowerCase() === clean.toLowerCase()))
      return setNote('That category already exists');
    const ok = await save(
      { ...config, custom: [...config.custom, { slug, name: clean, kind }] },
      `"${clean}" added. It is on the site now (folded under empty folders until it has projects).`
    );
    if (ok) setName('');
  };

  const removeCategory = async (slug: string, label: string) => {
    if (!confirm(`Remove the empty category "${label}"?`)) return;
    const subs = { ...config.subs };
    delete subs[slug];
    await save({ custom: config.custom.filter((c) => c.slug !== slug), subs }, `"${label}" removed`);
  };

  const rename = async (slug: string) => {
    const clean = renameValue.trim();
    if (!clean) return;
    const ok = await save(
      { ...config, custom: config.custom.map((c) => (c.slug === slug ? { ...c, name: clean } : c)) },
      'Renamed'
    );
    if (ok) setRenaming(null);
  };

  const addSub = async (slug: string) => {
    const clean = (subDraft[slug] || '').trim();
    if (!clean) return;
    if (subcategoriesFor(slug, config).some((s) => s.toLowerCase() === clean.toLowerCase()))
      return setNote('That subcategory already exists');
    const ok = await save(
      { ...config, subs: { ...config.subs, [slug]: [...(config.subs[slug] || []), clean] } },
      `Subcategory "${clean}" added`
    );
    if (ok) setSubDraft((d) => ({ ...d, [slug]: '' }));
  };

  const removeSub = async (slug: string, sub: string) => {
    if (!confirm(`Remove subcategory "${sub}"?`)) return;
    await save(
      { ...config, subs: { ...config.subs, [slug]: (config.subs[slug] || []).filter((s) => s !== sub) } },
      'Subcategory removed'
    );
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <FolderPlus size={20} />
        Categories
      </h2>
      <p className="text-sm text-white/50 mb-6">
        Add a category here, then pick it when you upload. It appears on the website instantly as a folder in the
        Portfolio section and as its own gallery page.
      </p>

      <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name (e.g. Podcasts)"
          className={field}
          maxLength={40}
        />
        <select value={kind} onChange={(e) => setKind(e.target.value as 'folder' | 'play')} className={`${field} sm:w-48`}>
          <option value="folder">Images / designs</option>
          <option value="play">Videos / motion</option>
        </select>
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 whitespace-nowrap"
        >
          Add category
        </button>
      </form>
      {note && <p className="text-sm text-white/70 mb-4">{note}</p>}

      <div className="mt-6 space-y-3">
        {cats.map((c) => {
          const count = countOf(c.slug);
          const subs = subcategoriesFor(
            c.slug,
            config,
            items.filter((i) => (i.category || 'web') === c.slug && i.subcategory).map((i) => i.subcategory as string)
          );
          const custom = !c.builtin && config.custom.some((x) => x.slug === c.slug);
          return (
            <div key={c.slug} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center gap-3">
                {renaming === c.slug ? (
                  <>
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="px-3 py-2 bg-black/40 border border-white/15 rounded-lg outline-none text-white"
                      maxLength={40}
                      autoFocus
                    />
                    <button onClick={() => rename(c.slug)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" aria-label="Save name">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setRenaming(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" aria-label="Cancel">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <h3 className="font-semibold">{c.name}</h3>
                )}
                <span className="text-xs text-white/40">
                  {count} item{count === 1 ? '' : 's'} · /gallery/{c.slug}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to={`/gallery/${c.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                    aria-label="View on site"
                  >
                    <ExternalLink size={16} />
                  </Link>
                  {custom && renaming !== c.slug && (
                    <button
                      onClick={() => {
                        setRenaming(c.slug);
                        setRenameValue(c.name);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                      aria-label="Rename"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {custom && count === 0 && (
                    <button
                      onClick={() => removeCategory(c.slug, c.name)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      aria-label="Remove category"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {subs.map((s) => {
                  const removable = (config.subs[c.slug] || []).includes(s) && !(BUILTIN_SUBCATEGORIES[c.slug] || []).includes(s);
                  return (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">
                      {s}
                      <span className="text-white/40">{subCount(c.slug, s)}</span>
                      {removable && subCount(c.slug, s) === 0 && (
                        <button onClick={() => removeSub(c.slug, s)} aria-label={`Remove ${s}`} className="text-white/50 hover:text-white">
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  );
                })}
                <span className="inline-flex items-center gap-1">
                  <input
                    value={subDraft[c.slug] || ''}
                    onChange={(e) => setSubDraft((d) => ({ ...d, [c.slug]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSub(c.slug))}
                    placeholder="+ subcategory"
                    maxLength={40}
                    className="w-36 px-3 py-1 bg-black/40 border border-white/15 rounded-full outline-none text-xs text-white focus:border-white/40"
                  />
                  <button
                    onClick={() => addSub(c.slug)}
                    disabled={busy}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    aria-label="Add subcategory"
                  >
                    <Plus size={12} />
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
