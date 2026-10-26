import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Loader2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const load = async () => {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setItems(data);
      setLoadingItems(false);
    };

    load();
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
    if (!title.trim() || !file) {
      setStatus('Title and image are required');
      return;
    }

    setUploading(true);
    setStatus('Uploading...');

    try {
      const path = `portfolio/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: upErr } = await supabase.storage
        .from('portfolio')
        .upload(path, file, { upsert: true });

      if (upErr) {
        setStatus(upErr.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);

      const { error: dbErr } = await supabase.from('portfolio_items').insert({
        title: title.trim(),
        description: description.trim() || null,
        image_url: urlData.publicUrl,
      });

      if (dbErr) {
        setStatus(dbErr.message);
        setUploading(false);
        return;
      }

      setStatus('Uploaded successfully');
      setTitle('');
      setDescription('');
      setFile(null);

      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setItems(data);
    } catch (err: any) {
      setStatus(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Portfolio Items</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              {loadingItems ? <Loader2 size={24} className="animate-spin" /> : items.length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Storage</p>
            <p className="text-lg font-medium">Supabase</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Auth</p>
            <p className="text-lg font-medium">Supabase</p>
          </div>
        </div>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Upload size={20} />
            Upload portfolio item
          </h2>
          <form onSubmit={handleUpload} className="space-y-4 max-w-lg">
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-white/70"
            />
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
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Recent items
          </h2>
          {loadingItems ? (
            <Loader2 className="animate-spin text-white/50" />
          ) : items.length === 0 ? (
            <p className="text-white/40">No portfolio items yet. Upload above.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{item.description}</p>
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
