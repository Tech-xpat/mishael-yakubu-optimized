-- Fixed SQL — handles existing tables that are missing columns

-- 1) Portfolio items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  category text not null default 'web',
  website_url text,
  created_at timestamptz default now()
);

alter table public.portfolio_items
  add column if not exists category text default 'web',
  add column if not exists website_url text;

create index if not exists portfolio_items_category_idx on public.portfolio_items (category);
create index if not exists portfolio_items_created_at_idx on public.portfolio_items (created_at desc);

-- 2) Categories (create if missing, then add sort_order if the table already existed without it)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int default 0
);

alter table public.categories
  add column if not exists sort_order int default 0;

insert into public.categories (slug, name, sort_order) values
  ('web', 'Web Development', 1),
  ('website', 'Live Websites', 2),
  ('flyer', 'Flyers & Graphics', 3),
  ('brand', 'Brand Design', 4),
  ('ai', 'AI Automation', 5)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 3) RLS on portfolio_items
alter table public.portfolio_items enable row level security;

drop policy if exists "Public read portfolio" on public.portfolio_items;
create policy "Public read portfolio" on public.portfolio_items for select using (true);

drop policy if exists "Auth insert portfolio" on public.portfolio_items;
create policy "Auth insert portfolio" on public.portfolio_items for insert to authenticated with check (true);

drop policy if exists "Auth update portfolio" on public.portfolio_items;
create policy "Auth update portfolio" on public.portfolio_items for update to authenticated using (true);

drop policy if exists "Auth delete portfolio" on public.portfolio_items;
create policy "Auth delete portfolio" on public.portfolio_items for delete to authenticated using (true);

-- Categories public read
alter table public.categories enable row level security;
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);

-- 4) Storage bucket
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

-- 5) Storage policies
drop policy if exists "Public read portfolio storage" on storage.objects;
create policy "Public read portfolio storage" on storage.objects for select using (bucket_id = 'portfolio');

drop policy if exists "Auth upload portfolio storage" on storage.objects;
create policy "Auth upload portfolio storage" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio');

drop policy if exists "Auth update portfolio storage" on storage.objects;
create policy "Auth update portfolio storage" on storage.objects for update to authenticated using (bucket_id = 'portfolio');

drop policy if exists "Auth delete portfolio storage" on storage.objects;
create policy "Auth delete portfolio storage" on storage.objects for delete to authenticated using (bucket_id = 'portfolio');
