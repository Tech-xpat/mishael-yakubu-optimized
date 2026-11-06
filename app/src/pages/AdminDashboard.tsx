import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Loader2, Upload, ExternalLink, Trash2, Play, Edit2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { slug: 'web', name: 'Web Development' },
  { slug: 'website', name: 'Live Websites' },
  { slug: 'flyer', name: 'Flyers & Graphics' },
  { slug: 'brand', name: 'Brand Design' },
  { slug: 'ai', name: 'AI Automation' },
  { slug: 'video', name: 'Videos' },
  { slug: 'motion', name: 'Motion Graphics' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

const SUBCATEGORIES: Record<string, string[]> = {
  flyer: ['Birthday Flyers', 'Church Flyers', 'Social Media Flyers', 'Event Flyers', 'Business Flyers', 'Other Flyers'],
  brand: ['Logo', 'Brand Identity', 'Social Media Kit', 'Other Branding'],
  video: ['Promo Videos', 'Testimonials', 'Tutorials', 'Other Videos'],
  motion: ['Logo Animation', 'Explainer', 'Social Motion', 'Other Motion'],
};

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category?: string;
  subcategory?: string | null;
  website_url?: string | null;
  priority?: number | null;
  created_at?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategorySlug>('web');
  const [subcategory, setSubcategory] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [priority, setPriority] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<CategorySlug>('web');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPriority, setEditPriority] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  const availableSubs = SUBCATEGORIES[category] || [];
  const editAvailableSubs = SUBCATEGORIES[editCategory] || [];

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
  }, [currentUser, isAdmin]);

  useEffect(() => {
    setSubcategory('');
  }, [category]);

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditCategory((item.category as CategorySlug) || 'web');
    setEditSubcategory(item.subcategory || '');
    setEditWebsite(item.website_url || '');
    setEditPriority(item.priority || 0);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from('portfolio_items')
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        category: editCategory,
        subcategory: editSubcategory || null,
        website_url: editWebsite.trim() || null,
        priority: editPriority || 0,
      })
      .eq('id', editing.id);

    setSavingEdit(false);
    if (error) {
      setStatus('Update failed: ' + error.message);
    } else {
      setStatus('Item updated');
      setEditing(null);
      await loadItems();
    }
  };

  const changePriority = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newPriority = Math.max(0, (item.priority || 0) + delta);
    await supabase.from('portfolio_items').update({ priority: newPriority }).eq('id', id);
    await loadItems();
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
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    if (!title.trim()) {
      setStatus('Title is required');
      return;
    }
    if (files.length === 0) {
      setStatus('Select at least one file');
      return;
    }
    if (category === 'website' && !websiteUrl.trim()) {
      setStatus('Website URL is required for Live Websites');
      return;
    }

    setUploading(true);
    setStatus(`Uploading ${files.length} file(s)...`);

    try {
      let success = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/\s+/g, '-');
        const path = `${category}/${Date.now()}-${i}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from('portfolio')
          .upload(path, file, { upsert: true, contentType: file.type });

        if (upErr) {
          setStatus(`Upload failed on ${file.name}: ${upErr.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);
        const itemTitle =
          files.length > 1 ? `${title.trim()} (${i + 1})` : title.trim();

        const { error: dbErr } = await supabase.from('portfolio_items').insert({
          title: itemTitle,
          description: description.trim() || null,
          image_url: urlData.publicUrl,
          category,
          subcategory: subcategory || null,
          website_url: category === 'website' ? websiteUrl.trim() : null,
          priority: priority || 0,
        });

        if (dbErr) {
          setStatus(`Saved file but DB failed: ${dbErr.message}`);
          continue;
        }
        success++;
      }

      setStatus(
        success > 0
          ? `Uploaded ${success} item(s) to ${CATEGORIES.find((c) => c.slug === category)?.name}${subcategory ? ` / ${subcategory}` : ''}`
          : 'No items uploaded'
      );
      setTitle('');
      setDescription('');
      setWebsiteUrl('');
      setSubcategory('');
      setPriority(0);
      setFiles([]);
      await loadItems();
    } catch (err: any) {
      setStatus(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('portfolio_items').delete().eq('id', id);
    await loadItems();
  };

  const filtered =
    filter === 'all' ? items : items.filter((i) => (i.category || 'web') === filter);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-sm bg-black/80">
        <div className="px-6 md:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/50 mt-1">{currentUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Total items</p>
            <p className="text-3xl font-bold">
              {loadingItems ? '…' : items.length}
            </p>
          </div>
          {CATEGORIES.slice(0, 3).map((c) => (
            <div key={c.slug} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{c.name}</p>
              <p className="text-2xl font-bold">
                {items.filter((i) => (i.category || 'web') === c.slug).length}
              </p>
            </div>
          ))}
        </div>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Upload size={20} />
            Upload to category
          </h2>
          <form onSubmit={handleUpload} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug)}
                className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40 text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {availableSubs.length > 0 && (
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Subcategory (optional)</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40 text-white"
                >
                  <option value="">None</option>
                  {availableSubs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Priority (higher number shows first)</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40"
                min="0"
              />
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40"
            />

            {category === 'website' && (
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Website URL</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                  className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Files (images or videos)</label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-white/70"
              />
              {files.length > 0 && <p className="text-xs text-white/40 mt-2">{files.length} file(s) selected</p>}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {status && <p className="text-sm text-white/60">{status}</p>}
          </form>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 size={20} />
              Library
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs ${
                  filter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setFilter(c.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs ${
                    filter === c.slug ? 'bg-white text-black' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {loadingItems ? (
            <Loader2 className="animate-spin text-white/50" />
          ) : filtered.length === 0 ? (
            <p className="text-white/40">No items in this category yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const isVideo = item.image_url?.match(/\.(mp4|webm|mov)$/i);
                return (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group"
                  >
                    <div className="relative">
                      {isVideo ? (
                        <div className="w-full h-40 bg-zinc-900 flex items-center justify-center">
                          <Play size={32} className="text-white/60" />
                        </div>
                      ) : (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => changePriority(item.id, 1)}
                          className="p-1.5 rounded-lg bg-black/70 text-white"
                          title="Increase priority"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => changePriority(item.id, -1)}
                          className="p-1.5 rounded-lg bg-black/70 text-white"
                          title="Decrease priority"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg bg-black/70 text-blue-400"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-black/70 text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">
                        {CATEGORIES.find((c) => c.slug === item.category)?.name || item.category || 'web'}
                        {item.subcategory ? ` · ${item.subcategory}` : ''}
                        {item.priority ? ` · P${item.priority}` : ''}
                      </p>
                      <p className="font-medium text-sm mt-0.5">{item.title}</p>
                      {item.website_url && (
                        <a
                          href={item.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white mt-1"
                        >
                          <ExternalLink size={12} />
                          Preview site
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Item</h3>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => {
                    setEditCategory(e.target.value as CategorySlug);
                    setEditSubcategory('');
                  }}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {editAvailableSubs.length > 0 && (
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Subcategory</label>
                  <select
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-white"
                  >
                    <option value="">None</option>
                    {editAvailableSubs.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Website URL</label>
                <input
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Priority</label>
                <input
                  type="number"
                  value={editPriority}
                  onChange={(e) => setEditPriority(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-lg"
                  min="0"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="flex-1 py-2.5 bg-white text-black rounded-lg font-medium disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 border border-white/20 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
