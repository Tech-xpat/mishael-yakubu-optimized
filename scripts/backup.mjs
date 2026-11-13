// Full Supabase backup: database rows + every file in the Storage bucket.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup.mjs [outDir]
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const URL_ = (process.env.SUPABASE_URL || 'https://mmnsovgpmojjeqajbcfo.supabase.co').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'portfolio';
const TABLES = (process.env.BACKUP_TABLES || 'portfolio_items,categories,subscribers').split(',');
if (!KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const out = process.argv[2] || join('backups', new Date().toISOString().slice(0, 10));
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function table(name) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${URL_}/rest/v1/${name}?select=*`, { headers: { ...H, Range: `${from}-${from + 999}` } });
    if (!r.ok) { console.warn(`skip table ${name}: ${r.status}`); return null; }
    const page = await r.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}

async function walk(prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const r = await fetch(`${URL_}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 100, offset }),
    });
    if (!r.ok) throw new Error(`list ${prefix}: ${r.status}`);
    const page = await r.json();
    for (const e of page) {
      const path = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) files.push(...(await walk(path))); else files.push(path);
    }
    if (page.length < 100) break;
  }
  return files;
}

await mkdir(join(out, 'db'), { recursive: true });
for (const t of TABLES) {
  const rows = await table(t.trim());
  if (rows) { await writeFile(join(out, 'db', `${t.trim()}.json`), JSON.stringify(rows, null, 2)); console.log(`db/${t}: ${rows.length} rows`); }
}

const files = await walk();
let n = 0;
for (const f of files) {
  const r = await fetch(`${URL_}/storage/v1/object/authenticated/${BUCKET}/${f.split('/').map(encodeURIComponent).join('/')}`, { headers: H });
  if (!r.ok) { console.warn(`skip ${f}: ${r.status}`); continue; }
  const dest = join(out, 'storage', BUCKET, f);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await r.arrayBuffer()));
  n++;
}
console.log(`storage/${BUCKET}: ${n}/${files.length} files -> ${out}`);
