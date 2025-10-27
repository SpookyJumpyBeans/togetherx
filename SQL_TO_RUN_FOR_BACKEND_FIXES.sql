-- Run these in your database if not already applied

-- 1) Product Contacts Table - Track founder contact clicks for leaderboard
-- Use a trigger-populated month key (YYYYMM) for uniqueness

create table if not exists public.product_contacts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  contacted_at timestamptz default now() not null,
  contact_month int -- YYYYMM, populated by trigger
);

-- Trigger to populate contact_month
create or replace function public.set_contact_month()
returns trigger
language plpgsql
as $$
begin
  NEW.contact_month := (extract(year from NEW.contacted_at at time zone 'UTC')::int * 100)
                        + extract(month from NEW.contacted_at at time zone 'UTC')::int;
  return NEW;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_product_contacts_set_month'
  ) then
    create trigger trg_product_contacts_set_month
      before insert or update on public.product_contacts
      for each row execute procedure public.set_contact_month();
  end if;
end $$;

-- Enforce one contact per user per product per month
create unique index if not exists idx_product_contacts_unique_monthly
  on public.product_contacts (product_id, user_id, contact_month);

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
  on public.product_contacts (product_id, contact_month);

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

-- 3) Secure aggregated contacts function for public/anon access
-- Returns per-product counts for the current month start you pass in
create or replace function public.get_monthly_contact_counts(month_start_input timestamptz)
returns table (
  product_id uuid,
  contact_count integer
)
language sql
security definer
set search_path = public
as $$
  select pc.product_id, count(*)::int as contact_count
  from public.product_contacts pc
  where pc.contacted_at >= month_start_input
  group by pc.product_id
$$;

-- Allow anonymous and authenticated clients to execute the function
grant execute on function public.get_monthly_contact_counts(timestamptz) to anon, authenticated;

-- Refresh API cache so the RPC becomes available immediately
select pg_notify('pgrst','reload schema');

-- 4) Add show_on_leaderboard column to products table
alter table public.products 
add column if not exists show_on_leaderboard boolean default false;

-- 5) Convert traction metric columns to text (they store ranges, not numbers)
alter table public.products 
alter column users type text using users::text,
alter column revenue type text using revenue::text,
alter column growth_rate type text using growth_rate::text;

-- 6) Add acquisition_details column
alter table public.products 
add column if not exists acquisition_details text;

-- 7) Add screenshot_urls column for multiple screenshots
alter table public.products 
add column if not exists screenshot_urls text[];

-- 8) Create storage bucket for product assets (screenshots and logos)
insert into storage.buckets (id, name, public)
values ('product-assets', 'product-assets', true)
on conflict (id) do nothing;

-- 9) Storage RLS policies for product-assets bucket
create policy "Anyone can view product assets"
on storage.objects for select
using (bucket_id = 'product-assets');

create policy "Authenticated users can upload product assets"
on storage.objects for insert
with check (
  bucket_id = 'product-assets' 
  and auth.role() = 'authenticated'
);

create policy "Users can update their own product assets"
on storage.objects for update
using (
  bucket_id = 'product-assets' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own product assets"
on storage.objects for delete
using (
  bucket_id = 'product-assets' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Refresh API cache
select pg_notify('pgrst','reload schema');
