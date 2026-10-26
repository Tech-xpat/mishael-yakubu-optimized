-- Run this in Supabase SQL Editor if tables/columns are missing

-- Categories + website link support
alter table if exists portfolio_items
  add column if not exists category text default 'web',
  add column if not exists website_url text;

-- Ensure base table exists
create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  category text not null default 'web',
  website_url text,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int default 0
);

insert into categories (slug, name, sort_order) values
  ('web', 'Web Development', 1),
  ('website', 'Live Websites', 2),
  ('flyer', 'Flyers & Graphics', 3),
  ('brand', 'Brand Design', 4),
  ('ai', 'AI Automation', 5)
on conflict (slug) do nothing;

-- Public read for portfolio
alter table portfolio_items enable row level security;

drop policy if exists "Public read portfolio" on portfolio_items;
create policy "Public read portfolio" on portfolio_items
  for select using (true);

drop policy if exists "Auth insert portfolio" on portfolio_items;
create policy "Auth insert portfolio" on portfolio_items
  for insert to authenticated with check (true);

drop policy if exists "Auth update portfolio" on portfolio_items;
create policy "Auth update portfolio" on portfolio_items
  for update to authenticated using (true);

drop policy if exists "Auth delete portfolio" on portfolio_items;
create policy "Auth delete portfolio" on portfolio_items
  for delete to authenticated using (true);

-- Storage bucket (run once)
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

-- Storage policies
drop policy if exists "Public read portfolio storage" on storage.objects;
create policy "Public read portfolio storage" on storage.objects
  for select using (bucket_id = 'portfolio');

drop policy if exists "Auth upload portfolio storage" on storage.objects;
create policy "Auth upload portfolio storage" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio');

drop policy if exists "Auth update portfolio storage" on storage.objects;
create policy "Auth update portfolio storage" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio');

drop policy if exists "Auth delete portfolio storage" on storage.objects;
create policy "Auth delete portfolio storage" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio');
