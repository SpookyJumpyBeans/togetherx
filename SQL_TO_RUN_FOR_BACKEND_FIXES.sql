-- Run these in your database if not already applied

-- 1) Product Contacts Table - Track founder contact clicks for leaderboard
-- Create immutable date_trunc wrapper for unique index
create or replace function public.immutable_date_trunc_month(timestamp with time zone)
returns timestamp with time zone
language sql
immutable
as $$
  select date_trunc('month', $1);
$$;

-- Unique contacts per user per product per month
create table if not exists public.product_contacts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  contacted_at timestamp with time zone default now() not null
);

-- Create unique index to enforce one contact per user per product per month
create unique index if not exists idx_product_contacts_unique_monthly
  on public.product_contacts (product_id, user_id, immutable_date_trunc_month(contacted_at));

-- Enable RLS
alter table public.product_contacts enable row level security;

-- RLS Policies for product_contacts
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_contacts' and policyname = 'Users can view their own contacts'
  ) then
    create policy "Users can view their own contacts" on public.product_contacts
      for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_contacts' and policyname = 'Authenticated users can insert contacts'
  ) then
    create policy "Authenticated users can insert contacts" on public.product_contacts
      for insert to authenticated with check (auth.uid() = user_id);
  end if;
end $$;

-- Index for faster leaderboard queries
create index if not exists idx_product_contacts_month 
  on public.product_contacts (product_id, date_trunc('month', contacted_at));

create index if not exists idx_product_contacts_product 
  on public.product_contacts (product_id, contacted_at desc);

-- 2) Pinned products table and policies
create table if not exists public.pinned_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  unique (user_id, product_id)
);

alter table public.pinned_products enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pinned_products' and policyname = 'Users can view their pins'
  ) then
    create policy "Users can view their pins" on public.pinned_products
      for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pinned_products' and policyname = 'Users can insert their pins'
  ) then
    create policy "Users can insert their pins" on public.pinned_products
      for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pinned_products' and policyname = 'Users can delete their pins'
  ) then
    create policy "Users can delete their pins" on public.pinned_products
      for delete to authenticated using (auth.uid() = user_id);
  end if;
end $$;

-- Refresh API cache
select pg_notify('pgrst','reload schema');
