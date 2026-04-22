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
-- sadece admin rol guncelleme/yonetim yapabilir.
drop policy if exists "users_select_authenticated" on public.users;
drop policy if exists "users_update_admin_manager_or_self" on public.users;
drop policy if exists "users_update_admin_only" on public.users;
create policy "users_select_authenticated"
  on public.users
  for select
  to authenticated
  using (true);
create policy "users_update_admin_only"
  on public.users
  for update
  to authenticated
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

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

-- Audit log: tum degisiklikleri (insert/update/delete) takip et
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  event_type text not null,
  table_name text not null,
  record_id text not null,
  changed_by_auth_user_id uuid,
  changed_by_profile_id uuid references public.users(id) on delete set null,
  changed_by_role text,
  changed_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.audit_logs
  drop constraint if exists audit_logs_event_type_check;
alter table public.audit_logs
  add constraint audit_logs_event_type_check
  check (event_type in ('record_created', 'record_updated', 'record_deleted', 'role_changed'));

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_admin_manager" on public.audit_logs;
create policy "audit_logs_select_admin_manager"
  on public.audit_logs
  for select
  to authenticated
  using (public.get_current_user_role() in ('admin', 'manager'));

create or replace function public.audit_log_data_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid;
  actor_role text;
  target_record_id text;
  event_name text;
  changed_fields jsonb;
begin
  if tg_op = 'UPDATE' and to_jsonb(old) = to_jsonb(new) then
    return new;
  end if;

  actor_profile_id := public.get_current_profile_id();
  actor_role := public.get_current_user_role();
  target_record_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id', '[no-id]');

  if tg_op = 'INSERT' then
    event_name := 'record_created';
  elsif tg_op = 'DELETE' then
    event_name := 'record_deleted';
  else
    if tg_table_name = 'users' and old.role is distinct from new.role then
      event_name := 'role_changed';
    else
      event_name := 'record_updated';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(jsonb_agg(new_row.key), '[]'::jsonb)
    into changed_fields
    from jsonb_each(to_jsonb(new)) as new_row
    where (to_jsonb(old)->new_row.key) is distinct from new_row.value;
  else
    changed_fields := '[]'::jsonb;
  end if;

  insert into public.audit_logs (
    event_type,
    table_name,
    record_id,
    changed_by_auth_user_id,
    changed_by_profile_id,
    changed_by_role,
    old_data,
    new_data,
    metadata
  )
  values (
    event_name,
    tg_table_name,
    target_record_id,
    auth.uid(),
    actor_profile_id,
    actor_role,
    case
      when tg_op = 'INSERT' then null
      else to_jsonb(old)
    end,
    case
      when tg_op = 'DELETE' then null
      else to_jsonb(new)
    end,
    jsonb_build_object(
      'operation', tg_op,
      'changed_fields', changed_fields
    )
  );

  if tg_op = 'INSERT' then
    return new;
  elsif tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists trg_audit_users_iud on public.users;
drop trigger if exists trg_audit_menu_items_iud on public.menu_items;
drop trigger if exists trg_audit_sales_iud on public.sales;
drop trigger if exists trg_audit_sale_items_iud on public.sale_items;
drop trigger if exists trg_audit_expenses_iud on public.expenses;
drop trigger if exists trg_audit_app_settings_iud on public.app_settings;

drop trigger if exists trg_audit_users_role_change on public.users;
drop trigger if exists trg_audit_menu_items_delete on public.menu_items;
drop trigger if exists trg_audit_sales_delete on public.sales;
drop trigger if exists trg_audit_sale_items_delete on public.sale_items;
drop trigger if exists trg_audit_expenses_delete on public.expenses;

create trigger trg_audit_users_iud
after insert or update or delete on public.users
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_menu_items_iud
after insert or update or delete on public.menu_items
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_sales_iud
after insert or update or delete on public.sales
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_sale_items_iud
after insert or update or delete on public.sale_items
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_expenses_iud
after insert or update or delete on public.expenses
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_app_settings_iud
after insert or update or delete on public.app_settings
for each row
execute function public.audit_log_data_change();

-- Audit log retention: yalnizca son 1 ay tutulur
create or replace function public.audit_logs_enforce_retention()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.audit_logs
  where changed_at < now() - interval '1 month';
  return null;
end;
$$;

drop trigger if exists trg_audit_logs_retention on public.audit_logs;
create trigger trg_audit_logs_retention
after insert on public.audit_logs
for each statement
execute function public.audit_logs_enforce_retention();
