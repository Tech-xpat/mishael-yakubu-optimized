import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  BarChart3,
  Loader2,
  Upload,
  ExternalLink,
  Trash2,
  Play,
  Edit2,
  ArrowUp,
  ArrowDown,
  X,
  FolderPlus,
  Globe,
  ImagePlus,
  Plus,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSeo } from '../lib/seo';
import AdminCategories from '../components/admin/AdminCategories';
import Collapsible from '../components/admin/Collapsible';
import AdminEmailMarketing from '../components/admin/AdminEmailMarketing';
import AdminBackup from '../components/admin/AdminBackup';
import { allCategories, subcategoriesFor, fetchConfig, EMPTY_CONFIG, type CategoryConfig } from '../lib/categories';
import { comparePosition, type PortfolioItem } from '../lib/portfolioApi';
import { HOME_SECTIONS, titleToSlug } from '../lib/homeSections';

/** Highest position offered in the dropdowns. */
const MAX_POSITION = 30;

const input =
  'w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40 text-white text-base';
const label = 'text-xs text-white/50 uppercase tracking-wider block mb-2';
const iconBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30';

const isVideoUrl = (url?: string) => !!url?.match(/\.(mp4|webm|mov)$/i);

/** "Position on site" dropdown: 1 shows first, 2 second... "Automatic" goes after the numbered ones. */
function PositionSelect({
  value,
  onChange,
  compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  compact?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Position on site"
      className={`bg-black/40 border border-white/15 rounded-lg text-white outline-none focus:border-white/40 ${
        compact ? 'h-10 px-2 text-sm' : 'w-full rounded-xl px-4 py-3 text-base'
      }`}
    >
      <option value={0}>{compact ? 'Auto' : 'Automatic (after numbered)'}</option>
      {Array.from({ length: MAX_POSITION }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {compact ? `Position ${n}` : n === 1 ? 'Position 1 (shows first)' : `Position ${n}`}
        </option>
      ))}
    </select>
  );
}

const AdminDashboard = () => {
  useSeo({ title: 'Admin | Mishael Yakubu', description: 'Admin', path: typeof window !== 'undefined' ? window.location.pathname : '/', noindex: true });
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [config, setConfig] = useState<CategoryConfig>(EMPTY_CONFIG);

  // upload form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('web');
  const [subcategory, setSubcategory] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [position, setPosition] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState('');

  // edit sheet
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('web');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPosition, setEditPosition] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  // small message at the bottom of the screen
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>(0);
  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3200);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const catOf = (i: PortfolioItem) => i.category || 'web';
  const CATEGORIES = allCategories(config, items.map(catOf));
  const seenSubs = (slug: string) =>
    items.filter((i) => catOf(i) === slug && i.subcategory).map((i) => i.subcategory as string);
  const availableSubs = subcategoriesFor(category, config, seenSubs(category));
  const editAvailableSubs = subcategoriesFor(editCategory, config, seenSubs(editCategory));
  const nameOf = (slug?: string) => CATEGORIES.find((c) => c.slug === slug)?.name || slug || 'Web';

  const loadItems = async () => {
    setLoadingItems(true);
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoadingItems(false);
  };

  useEffect(() => {
    if (!currentUser || !isAdmin) return;
    loadItems();
    fetchConfig(true).then(setConfig);
  }, [currentUser, isAdmin]);

  useEffect(() => {
    setSubcategory('');
  }, [category]);

  /**
   * Makes room for `count` items starting at `start` inside one category: anything already at or after
   * that position moves down by `count`, so the item placed there really shows in that spot on the site.
   */
  const makeRoom = async (cat: string, start: number, count: number, excludeId?: string) => {
    if (start <= 0) return;
    const inCat = items.filter((i) => i.id !== excludeId && catOf(i) === cat);
    const clash = inCat.some((i) => (i.priority || 0) >= start && (i.priority || 0) < start + count);
    if (!clash) return;
    const movers = inCat.filter((i) => (i.priority || 0) >= start);
    await Promise.all(
      movers.map((i) =>
        supabase.from('portfolio_items').update({ priority: (i.priority || 0) + count }).eq('id', i.id)
      )
    );
  };

  const setItemPosition = async (item: PortfolioItem, n: number) => {
    if (n === (item.priority || 0)) return;
    await makeRoom(catOf(item), n, 1, item.id);
    const { error } = await supabase.from('portfolio_items').update({ priority: n }).eq('id', item.id);
    flash(error ? 'Could not change position: ' + error.message : n ? `Moved to position ${n}` : 'Position cleared');
    await loadItems();
  };

  const moveUp = (item: PortfolioItem) => {
    const p = item.priority || 0;
    if (p === 1) return;
    if (p > 1) return setItemPosition(item, p - 1);
    // unnumbered: add it to the end of the numbered ones
    const numbered = items.filter((i) => catOf(i) === catOf(item) && (i.priority || 0) > 0);
    const last = numbered.reduce((m, i) => Math.max(m, i.priority || 0), 0);
    return setItemPosition(item, Math.min(MAX_POSITION, last + 1));
  };

  const moveDown = (item: PortfolioItem) => {
    const p = item.priority || 0;
    if (p === 0 || p >= MAX_POSITION) return;
    return setItemPosition(item, p + 1);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditCategory(catOf(item));
    setEditSubcategory(item.subcategory || '');
    setEditWebsite(item.website_url || '');
    setEditPosition(item.priority && item.priority > 0 ? item.priority : 0);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    await makeRoom(editCategory, editPosition, 1, editing.id);
    const { error } = await supabase
      .from('portfolio_items')
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        category: editCategory,
        subcategory: editSubcategory || null,
        website_url: editWebsite.trim() || null,
        priority: editPosition,
      })
      .eq('id', editing.id);

    setSavingEdit(false);
    if (error) {
      flash('Update failed: ' + error.message);
    } else {
      flash('Item updated');
      setEditing(null);
      await loadItems();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/60 mb-4">You are not authorized</p>
          <button
            onClick={() => navigate('/greatness')}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/greatness');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setUploadNote('Title is required');
    if (files.length === 0) return setUploadNote('Select at least one file');
    if (category === 'website' && !websiteUrl.trim()) return setUploadNote('Website URL is required for Live Websites');

    setUploading(true);
    setUploadNote(`Uploading ${files.length} file(s)...`);

    try {
      // Several files at once take consecutive positions, in the order they were chosen.
      await makeRoom(category, position, files.length);

      let success = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/\s+/g, '-');
        const path = `${category}/${Date.now()}-${i}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from('portfolio')
          .upload(path, file, { upsert: true, contentType: file.type });

        if (upErr) {
          setUploadNote(`Upload failed on ${file.name}: ${upErr.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);
        const itemTitle = files.length > 1 ? `${title.trim()} (${i + 1})` : title.trim();

        const { error: dbErr } = await supabase.from('portfolio_items').insert({
          title: itemTitle,
          description: description.trim() || null,
          image_url: urlData.publicUrl,
          category,
          subcategory: subcategory || null,
          website_url: category === 'website' ? websiteUrl.trim() : null,
          priority: position > 0 ? position + i : 0,
        });

        if (dbErr) {
          setUploadNote(`Saved file but DB failed: ${dbErr.message}`);
          continue;
        }
        success++;
      }

      if (success > 0) {
        setUploadNote('');
        flash(`Uploaded ${success} item(s) to ${nameOf(category)}${subcategory ? ` / ${subcategory}` : ''}`);
      } else {
        setUploadNote('No items uploaded');
      }
      setTitle('');
      setDescription('');
      setWebsiteUrl('');
      setSubcategory('');
      setPosition(0);
      setFiles([]);
      await loadItems();
    } catch (err: any) {
      setUploadNote(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  /** "Add here" on an empty folder: open the upload form with that category already chosen. */
  const addHere = (slug: string) => {
    setCategory(slug);
    window.dispatchEvent(new CustomEvent('admin-open', { detail: 'upload' }));
    window.setTimeout(() => {
      document.getElementById('admin-upload')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    flash(`Upload form set to ${nameOf(slug)}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('portfolio_items').delete().eq('id', id);
    flash('Item deleted');
    await loadItems();
  };

  const groups = CATEGORIES.map((c) => ({
    cat: c,
    list: items.filter((i) => catOf(i) === c.slug).sort(comparePosition),
  })).filter((g) => g.list.length > 0);
  const emptyCats = CATEGORIES.filter((c) => !items.some((i) => catOf(i) === c.slug));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header: title on the left, actions on the right. Logout is always reachable with the thumb. */}
      <header
        className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold sm:text-2xl">Admin Dashboard</h1>
            <p className="truncate text-xs text-white/50">{currentUser.email}</p>
          </div>
          <Link
            to="/"
            target="_blank"
            aria-label="View site"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-sm text-white/80 hover:bg-white/20 sm:px-4"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">View site</span>
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 text-sm font-medium text-red-400 hover:bg-red-500/30 sm:px-4"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-5 sm:px-6 sm:py-8" style={{ paddingBottom: 'max(6rem, env(safe-area-inset-bottom))' }}>
        {/* Overview */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-1 text-[11px] uppercase tracking-wider text-white/50">Total items</p>
            <p className="text-2xl font-bold">{loadingItems ? '…' : items.length}</p>
          </div>
          {CATEGORIES.slice(0, 3).map((c) => (
            <div key={c.slug} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 truncate text-[11px] uppercase tracking-wider text-white/50">{c.name}</p>
              <p className="text-2xl font-bold">{items.filter((i) => catOf(i) === c.slug).length}</p>
            </div>
          ))}
        </div>

        {/* Upload */}
        <Collapsible title="Upload to category" icon={<Upload size={20} />} defaultOpen storageKey="upload">
          <form onSubmit={handleUpload} className="max-w-xl space-y-4">
            <div>
              <label className={label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {availableSubs.length > 0 && (
              <div>
                <label className={label}>Subcategory (optional)</label>
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={input}>
                  <option value="">None</option>
                  {availableSubs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {(() => {
              const sec = Object.values(HOME_SECTIONS).find((x) => x.category === category);
              return sec ? (
                <p className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/60">
                  Shows in the <strong className="text-white">{sec.title}</strong> section under Portfolio on the home
                  page{subcategory ? <> (folder “{subcategory}”)</> : null}, on{' '}
                  <span className="text-white/80">
                    /portfolio/{sec.type}{subcategory ? `/${titleToSlug(subcategory)}` : ''}
                  </span>
                  , and in the Portfolio folder “{nameOf(category)}”.
                </p>
              ) : null;
            })()}

            <div>
              <label className={label}>Position on site</label>
              <PositionSelect value={position} onChange={setPosition} />
              <p className="mt-2 text-xs text-white/40">
                1 shows first, 2 second, and so on. Items placed after it move down automatically.
              </p>
            </div>

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={input} />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className={input}
            />

            {category === 'website' && (
              <div>
                <label className={label}>Website URL</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                  className={input}
                />
              </div>
            )}

            <div>
              <label className={label}>Files (images or videos)</label>
              <label className="flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 px-4 py-4 text-sm text-white/70 hover:border-white/50 hover:text-white">
                <ImagePlus size={20} />
                {files.length > 0 ? `${files.length} file(s) selected` : 'Tap to choose files'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="sr-only"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="min-h-[48px] w-full rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50 sm:w-auto"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {uploadNote && <p className="text-sm text-white/60">{uploadNote}</p>}
          </form>
        </Collapsible>

        {/* Categories */}
        <Collapsible title="Categories" icon={<FolderPlus size={20} />} badge={CATEGORIES.length} storageKey="categories">
          <AdminCategories config={config} items={items} onConfig={setConfig} />
        </Collapsible>

        <Collapsible title="Subscribers & newsletter" icon={<Mail size={20} />} storageKey="subs" lazyMount>
          <AdminEmailMarketing />
        </Collapsible>

        <Collapsible title="Backup" icon={<ShieldCheck size={20} />} storageKey="backup">
          <AdminBackup items={items} />
        </Collapsible>

        {/* Library: one dropdown per category, listed in the same order as the website */}
        <div className="pt-2">
          <h2 className="mb-3 flex items-center gap-2 px-1 text-lg font-semibold">
            <BarChart3 size={20} />
            Library
          </h2>
          {loadingItems ? (
            <Loader2 className="animate-spin text-white/50" />
          ) : groups.length === 0 ? (
            <p className="px-1 text-white/40">Nothing uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {groups.map(({ cat, list }) => (
                <Collapsible key={cat.slug} title={cat.name} badge={list.length} storageKey={`lib:${cat.slug}`}>
                  <p className="mb-3 text-xs text-white/40">Listed in the same order as on the website.</p>
                  <ul className="grid gap-3 lg:grid-cols-2">
                    {list.map((item) => {
                      const pos = item.priority && item.priority > 0 ? item.priority : 0;
                      return (
                        <li key={item.id} className="flex gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10">
                            {isVideoUrl(item.image_url) ? (
                              <div className="flex h-full w-full items-center justify-center">
                                <Play size={24} className="text-white/60" />
                              </div>
                            ) : (
                              <img src={item.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                            )}
                            {pos > 0 && (
                              <span className="absolute left-1 top-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-black">
                                #{pos}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="truncate text-[11px] uppercase tracking-wider text-white/40">
                              {item.subcategory || nameOf(item.category)}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <PositionSelect compact value={pos} onChange={(n) => setItemPosition(item, n)} />
                              <button onClick={() => moveUp(item)} disabled={pos === 1} className={iconBtn} aria-label="Move earlier">
                                <ArrowUp size={16} />
                              </button>
                              <button onClick={() => moveDown(item)} disabled={pos === 0 || pos >= MAX_POSITION} className={iconBtn} aria-label="Move later">
                                <ArrowDown size={16} />
                              </button>
                              <button onClick={() => openEdit(item)} className={`${iconBtn} text-blue-400`} aria-label="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className={`${iconBtn} text-red-400`} aria-label="Delete">
                                <Trash2 size={16} />
                              </button>
                              {item.website_url && (
                                <a href={item.website_url} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label="Preview site">
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Collapsible>
              ))}
            </div>
          )}

          {emptyCats.length > 0 && !loadingItems && (
            <div className="mt-3">
              <Collapsible title="Empty portfolio folders" badge={emptyCats.length} storageKey="lib:empty">
                <p className="mb-3 text-xs text-white/40">
                  These folders are folded away at the bottom of the Portfolio section on the website until you add
                  something. Tap Add to upload into one.
                </p>
                <ul className="space-y-2">
                  {emptyCats.map((c) => (
                    <li key={c.slug} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                      <button
                        onClick={() => addHere(c.slug)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-black"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </div>
          )}
        </div>
      </main>

      {/* Edit: a bottom sheet on phones, a centred dialog on larger screens */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={() => setEditing(null)}>
          <div
            role="dialog"
            aria-label="Edit item"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-white/10 bg-black sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="text-lg font-semibold">Edit item</h3>
              <button onClick={() => setEditing(null)} aria-label="Close" className={iconBtn}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div>
                <label className={label}>Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => {
                    setEditCategory(e.target.value);
                    setEditSubcategory('');
                  }}
                  className={input}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {editAvailableSubs.length > 0 && (
                <div>
                  <label className={label}>Subcategory</label>
                  <select value={editSubcategory} onChange={(e) => setEditSubcategory(e.target.value)} className={input}>
                    <option value="">None</option>
                    {editAvailableSubs.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={label}>Title</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={input} />
              </div>

              <div>
                <label className={label}>Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={input} />
              </div>

              <div>
                <label className={label}>Website URL</label>
                <input value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} className={input} placeholder="https://..." />
              </div>

              <div>
                <label className={label}>Position on site</label>
                <PositionSelect value={editPosition} onChange={setEditPosition} />
              </div>
            </div>

            <div
              className="flex gap-2 border-t border-white/10 px-5 py-4"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="min-h-[48px] flex-1 rounded-xl bg-white font-semibold text-black disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(null)} className="min-h-[48px] flex-1 rounded-xl border border-white/20">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-white/20 bg-white px-4 py-3 text-center text-sm font-medium text-black shadow-lg"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
