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
  receipt_no text unique,
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
  receipt_no text unique,
  title text not null,
  supplier text,
  amount numeric(10,2) not null check (amount > 0),
  expense_date date not null,
  note text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

alter table public.sales add column if not exists receipt_no text;
alter table public.expenses add column if not exists receipt_no text;
with ranked_sales as (
  select
    id,
    concat('F-', to_char(created_at, 'YYYY-MM-DD'), '-', lpad(row_number() over (partition by date(created_at) order by created_at, id)::text, 3, '0')) as next_receipt_no
  from public.sales
  where receipt_no is null
)
update public.sales s
set receipt_no = ranked_sales.next_receipt_no
from ranked_sales
where s.id = ranked_sales.id;

with ranked_expenses as (
  select
    id,
    concat('F-', to_char(expense_date, 'YYYY-MM-DD'), '-', lpad(row_number() over (partition by expense_date order by created_at, id)::text, 3, '0')) as next_receipt_no
  from public.expenses
  where receipt_no is null
)
update public.expenses e
set receipt_no = ranked_expenses.next_receipt_no
from ranked_expenses
where e.id = ranked_expenses.id;
create unique index if not exists sales_receipt_no_unique_idx on public.sales(receipt_no);
create unique index if not exists expenses_receipt_no_unique_idx on public.expenses(receipt_no);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  ayar_anahtari text not null unique,
  ayar_degeri text not null,
  aciklama text,
  guncelleyen_kullanici uuid references public.users(id),
  guncellenme_tarihi timestamptz not null default now()
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

insert into public.app_settings (ayar_anahtari, ayar_degeri, aciklama)
values
  ('restaurant_name', 'LUMINOX', 'Restoran gorunen adi'),
  ('currency', 'TRY', 'Para birimi'),
  ('timezone', 'Europe/Istanbul', 'Saat dilimi'),
  ('tax_rate', '10', 'Varsayilan KDV orani')
on conflict (ayar_anahtari) do nothing;

-- RLS (production-safe)
alter table public.users enable row level security;
alter table public.menu_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.expenses enable row level security;
alter table public.app_settings enable row level security;

-- Yardimci fonksiyonlar
create or replace function public.get_current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.get_current_user_role()
returns text
language sql
stable
as $$
  select role from public.users where auth_user_id = auth.uid() limit 1;
$$;

-- users: tum authenticated kullanicilar profilleri gorebilir.
-- admin ve manager profilleri guncelleyebilir, staff sadece kendi profilini.
drop policy if exists "users_select_authenticated" on public.users;
drop policy if exists "users_update_admin_manager_or_self" on public.users;
create policy "users_select_authenticated"
  on public.users
  for select
  to authenticated
  using (true);
create policy "users_update_admin_manager_or_self"
  on public.users
  for update
  to authenticated
  using (
    public.get_current_user_role() in ('admin', 'manager')
    or auth_user_id = auth.uid()
  )
  with check (
    public.get_current_user_role() in ('admin', 'manager')
    or auth_user_id = auth.uid()
  );

-- menu_items: herkes okuyabilir, sadece manager/admin degistirebilir
drop policy if exists "menu_select_authenticated" on public.menu_items;
drop policy if exists "menu_write_admin_manager" on public.menu_items;
create policy "menu_select_authenticated"
  on public.menu_items
  for select
  to authenticated
  using (true);
create policy "menu_write_admin_manager"
  on public.menu_items
  for all
  to authenticated
  using (public.get_current_user_role() in ('admin', 'manager'))
  with check (public.get_current_user_role() in ('admin', 'manager'));

-- sales: tum authenticated okuyabilir, herkes kendi profile id'si ile insert yapar
drop policy if exists "sales_select_authenticated" on public.sales;
drop policy if exists "sales_insert_authenticated" on public.sales;
create policy "sales_select_authenticated"
  on public.sales
  for select
  to authenticated
  using (true);
create policy "sales_insert_authenticated"
  on public.sales
  for insert
  to authenticated
  with check (created_by = public.get_current_profile_id());

-- sale_items: tum authenticated okuyabilir, insert sadece kendi olusturdugu sale icin
drop policy if exists "sale_items_select_authenticated" on public.sale_items;
drop policy if exists "sale_items_insert_own_sale" on public.sale_items;
create policy "sale_items_select_authenticated"
  on public.sale_items
  for select
  to authenticated
  using (true);
create policy "sale_items_insert_own_sale"
  on public.sale_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
      and s.created_by = public.get_current_profile_id()
    )
  );

-- expenses: tum authenticated okuyabilir, insert sadece kendi profile id'si ile
drop policy if exists "expenses_select_authenticated" on public.expenses;
drop policy if exists "expenses_insert_authenticated" on public.expenses;
create policy "expenses_select_authenticated"
  on public.expenses
  for select
  to authenticated
  using (true);
create policy "expenses_insert_authenticated"
  on public.expenses
  for insert
  to authenticated
  with check (created_by = public.get_current_profile_id());

-- app_settings: tum authenticated okuyabilir, sadece manager/admin yazabilir
drop policy if exists "ayarlar_select_authenticated" on public.app_settings;
drop policy if exists "ayarlar_write_admin_manager" on public.app_settings;
create policy "ayarlar_select_authenticated"
  on public.app_settings
  for select
  to authenticated
  using (true);
create policy "ayarlar_write_admin_manager"
  on public.app_settings
  for all
  to authenticated
  using (public.get_current_user_role() in ('admin', 'manager'))
  with check (public.get_current_user_role() in ('admin', 'manager'));
