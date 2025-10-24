-- Run these in your database if not already applied

-- 1) Ensure products table has updated_at managed by trigger (optional)
-- If you want automatic timestamps, create columns and trigger:
-- alter table public.products add column if not exists updated_at timestamptz default now();
-- create or replace function public.set_updated_at()
-- returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
-- drop trigger if exists trg_products_updated_at on public.products;
-- create trigger trg_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();

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
