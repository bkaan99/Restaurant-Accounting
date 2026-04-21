-- Restaurant Takip Sistemi - Supabase baslangic semasi

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  role text not null check (role in ('admin', 'manager', 'staff')),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  payment_status text not null default 'paid_manual'
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  supplier text,
  amount numeric(10,2) not null check (amount > 0),
  expense_date date not null,
  note text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

insert into public.users (name, role, email)
values
  ('Ahmet Yildiz', 'admin', 'admin@restaurant.local'),
  ('Zeynep Kaya', 'manager', 'manager@restaurant.local'),
  ('Can Demir', 'staff', 'staff@restaurant.local')
on conflict (email) do nothing;

insert into public.menu_items (name, category, price, active)
values
  ('Doner Porsiyon', 'Ana Yemek', 180, true),
  ('Pilav Ustu Tavuk', 'Ana Yemek', 160, true),
  ('Ayran', 'Icecek', 30, true),
  ('Kola', 'Icecek', 45, true),
  ('Kunefe', 'Tatli', 95, true)
on conflict do nothing;

-- RLS (gelistirme asamasi)
-- Not: Bu policyler anon/authenticated rolleri icin genis izin verir.
-- Uretimde rol bazli, auth.uid() kontrollu policylere gecilmelidir.
alter table public.users enable row level security;
alter table public.menu_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "users_all_select" on public.users;
create policy "users_all_select"
  on public.users
  for select
  to anon, authenticated
  using (true);

drop policy if exists "menu_all_select" on public.menu_items;
drop policy if exists "menu_all_insert" on public.menu_items;
drop policy if exists "menu_all_update" on public.menu_items;
create policy "menu_all_select"
  on public.menu_items
  for select
  to anon, authenticated
  using (true);
create policy "menu_all_insert"
  on public.menu_items
  for insert
  to anon, authenticated
  with check (true);
create policy "menu_all_update"
  on public.menu_items
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "sales_all_select" on public.sales;
drop policy if exists "sales_all_insert" on public.sales;
create policy "sales_all_select"
  on public.sales
  for select
  to anon, authenticated
  using (true);
create policy "sales_all_insert"
  on public.sales
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "sale_items_all_select" on public.sale_items;
drop policy if exists "sale_items_all_insert" on public.sale_items;
create policy "sale_items_all_select"
  on public.sale_items
  for select
  to anon, authenticated
  using (true);
create policy "sale_items_all_insert"
  on public.sale_items
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "expenses_all_select" on public.expenses;
drop policy if exists "expenses_all_insert" on public.expenses;
create policy "expenses_all_select"
  on public.expenses
  for select
  to anon, authenticated
  using (true);
create policy "expenses_all_insert"
  on public.expenses
  for insert
  to anon, authenticated
  with check (true);
