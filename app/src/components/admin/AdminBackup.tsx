import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchConfig } from '../../lib/categories';
import type { PortfolioItem } from '../../lib/portfolioApi';

// One-tap backup of everything the dashboard manages, saved as a JSON file on the phone.
// Images and videos live in Supabase Storage; their links are in the file and the nightly
// GitHub backup (scripts/backup.mjs) keeps copies of the files themselves.
export default function AdminBackup({ items }: { items: PortfolioItem[] }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const run = async () => {
    setBusy(true);
    setNote('');
    try {
      const [config, subs] = await Promise.all([
        fetchConfig(),
        supabase.from('subscribers').select('*').then((r) => r.data ?? []),
      ]);
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), portfolio_items: items, categories: config, subscribers: subs }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setNote(`Saved ${items.length} projects, categories and ${subs.length} subscribers.`);
    } catch {
      setNote('Backup failed. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">Downloads a file with all your projects, category setup and subscribers. Do this before big changes.</p>
      <button onClick={run} disabled={busy} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black text-sm font-medium disabled:opacity-50">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download backup
      </button>
      {note && <p className="text-sm text-white/60">{note}</p>}
    </div>
  );
}
