-- Newsletter subscribers (replaces Firestore). Run once in Supabase -> SQL Editor.
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  status text not null default 'active' check (status in ('active','unsubscribed')),
  welcome_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists subscribers_email_lower_idx on public.subscribers (lower(email));

alter table public.subscribers enable row level security;

-- Nobody on the public site can read or write this table directly.
-- Visitors subscribe through /api/subscribe, which uses the server-only service role key.
-- Signed-in admins (Supabase Auth) can view, update and delete subscribers from the dashboard.
drop policy if exists "admins read subscribers" on public.subscribers;
create policy "admins read subscribers" on public.subscribers for select to authenticated using (true);
drop policy if exists "admins update subscribers" on public.subscribers;
create policy "admins update subscribers" on public.subscribers for update to authenticated using (true) with check (true);
drop policy if exists "admins delete subscribers" on public.subscribers;
create policy "admins delete subscribers" on public.subscribers for delete to authenticated using (true);
