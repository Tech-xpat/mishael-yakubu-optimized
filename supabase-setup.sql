-- Run this in Supabase SQL Editor

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Portfolio items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Storage bucket for images
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- RLS
alter table public.categories enable row level security;
alter table public.portfolio_items enable row level security;

-- Public read
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read portfolio" on public.portfolio_items for select using (true);

-- Admin write (service role or authenticated admin later)
-- For now allow service role full access; tighten with Auth later
create policy "Service full access categories" on public.categories for all using (auth.role() = 'service_role');
create policy "Service full access portfolio" on public.portfolio_items for all using (auth.role() = 'service_role');

-- Seed categories
insert into public.categories (name, slug) values
  ('Web Development', 'web-development'),
  ('Tech Coaching', 'tech-coaching'),
  ('Graphic Design', 'graphic-design'),
  ('AI & Automation', 'ai-automation'),
  ('Video & Photo', 'video-photo')
on conflict (slug) do nothing;
