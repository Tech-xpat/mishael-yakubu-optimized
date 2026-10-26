-- Safe SQL — does not re-insert categories that already exist

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

-- 2) Categories — only add missing column. Do NOT insert (names already exist).
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int default 0
);

alter table public.categories
  add column if not exists sort_order int default 0;

-- Optional: ensure sort_order values if null
update public.categories set sort_order = 1 where slug = 'web' and (sort_order is null or sort_order = 0);
update public.categories set sort_order = 2 where slug = 'website' and (sort_order is null or sort_order = 0);
update public.categories set sort_order = 3 where slug = 'flyer' and (sort_order is null or sort_order = 0);
update public.categories set sort_order = 4 where slug = 'brand' and (sort_order is null or sort_order = 0);
update public.categories set sort_order = 5 where slug = 'ai' and (sort_order is null or sort_order = 0);

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
