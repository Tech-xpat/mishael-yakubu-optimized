import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Loader2, Upload, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { slug: 'web', name: 'Web Development' },
  { slug: 'website', name: 'Live Websites' },
  { slug: 'flyer', name: 'Flyers & Graphics' },
  { slug: 'brand', name: 'Brand Design' },
  { slug: 'ai', name: 'AI Automation' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category?: string;
  website_url?: string | null;
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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<string>('all');

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
      setStatus('Select at least one image');
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
          website_url: category === 'website' ? websiteUrl.trim() : null,
        });

        if (dbErr) {
          setStatus(`Saved image but DB failed: ${dbErr.message}`);
          continue;
        }
        success++;
      }

      setStatus(
        success > 0
          ? `Uploaded ${success} item(s) to ${CATEGORIES.find((c) => c.slug === category)?.name}`
          : 'No items uploaded'
      );
      setTitle('');
      setDescription('');
      setWebsiteUrl('');
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
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug)}
                className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl outline-none focus:border-white/40 text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
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
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                  Website URL (opens when visitors click the card)
                </label>
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
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
                Images (select multiple)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-white/70"
              />
              {files.length > 0 && (
                <p className="text-xs text-white/40 mt-2">{files.length} file(s) selected</p>
              )}
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
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">
                      {CATEGORIES.find((c) => c.slug === item.category)?.name || item.category || 'web'}
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
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
