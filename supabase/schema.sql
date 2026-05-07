-- Restaurant Takip Sistemi - Supabase baslangic semasi

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  role text not null check (role in ('admin', 'manager', 'staff')),
  permissions jsonb,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists permissions jsonb;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_id uuid,
  price numeric(10,2) not null check (price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items add column if not exists description text;
alter table public.menu_items add column if not exists category_id uuid;

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items
  drop constraint if exists menu_items_category_id_fkey;
alter table public.menu_items
  add constraint menu_items_category_id_fkey
  foreign key (category_id) references public.menu_categories(id) on delete set null;

-- Stok: Malzemeler (ingredients) + Recete (menu_item_ingredients) + Stok hareketleri (inventory_movements)
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null default 'adet', -- adet, gr, ml vb.
  on_hand numeric(14,3) not null default 0 check (on_hand >= 0),
  reorder_level numeric(14,3) not null default 0 check (reorder_level >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_item_ingredients (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  qty_per_item numeric(14,3) not null check (qty_per_item > 0),
  created_at timestamptz not null default now(),
  unique (menu_item_id, ingredient_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  movement_type text not null check (movement_type in ('in', 'out', 'adjust')),
  qty numeric(14,3) not null check (qty > 0),
  reason text,
  related_sale_id uuid references public.sales(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'menu_items'
      and column_name = 'category'
  ) then
    insert into public.menu_categories (name)
    select distinct mi.category
    from public.menu_items mi
    where coalesce(trim(mi.category), '') <> ''
    on conflict (name) do nothing;

    update public.menu_items mi
    set category_id = mc.id
    from public.menu_categories mc
    where mi.category_id is null
      and lower(trim(mi.category)) = lower(trim(mc.name));
  end if;
end
$$;

alter table public.menu_items
  alter column category_id set not null;

alter table public.menu_items
  drop column if exists category;

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

-- Sales receipt no üretimini veritabanına taşı (race condition önleme)
create sequence if not exists public.sales_receipt_no_seq;

create or replace function public.generate_sales_receipt_no(p_created_at timestamptz default now())
returns text
language plpgsql
as $$
declare
  receipt_date text;
  seq_value bigint;
begin
  receipt_date := to_char(coalesce(p_created_at, now()), 'YYYY-MM-DD');
  seq_value := nextval('public.sales_receipt_no_seq');
  return 'F-' || receipt_date || '-' || lpad(seq_value::text, 6, '0');
end;
$$;

create or replace function public.assign_sales_receipt_no()
returns trigger
language plpgsql
as $$
begin
  if new.receipt_no is null or btrim(new.receipt_no) = '' then
    new.receipt_no := public.generate_sales_receipt_no(new.created_at);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_sales_receipt_no on public.sales;
create trigger trg_assign_sales_receipt_no
before insert on public.sales
for each row
execute function public.assign_sales_receipt_no();

-- Satis + kalemleri atomik olarak olustur (tek transaction)
create or replace function public.create_sale_with_items(p_items jsonb)
returns table (
  id uuid,
  receipt_no text,
  created_at timestamptz,
  total_amount numeric
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  actor_profile_id uuid;
  sale_id uuid;
  sale_receipt_no text;
  sale_created_at timestamptz;
  computed_total numeric(10,2) := 0;
  current_item jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'p_items must be a non-empty array';
  end if;

  actor_profile_id := public.get_current_profile_id();
  if actor_profile_id is null then
    raise exception 'current profile not found';
  end if;

  for current_item in select * from jsonb_array_elements(p_items)
  loop
    if coalesce((current_item->>'qty')::integer, 0) <= 0 then
      raise exception 'qty must be greater than 0';
    end if;
    if coalesce((current_item->>'unitPrice')::numeric, 0) < 0 then
      raise exception 'unitPrice cannot be negative';
    end if;
    computed_total := computed_total + coalesce(
      (current_item->>'lineTotal')::numeric,
      ((current_item->>'qty')::numeric * (current_item->>'unitPrice')::numeric)
    );
  end loop;

  insert into public.sales (created_by, total_amount, payment_status)
  values (actor_profile_id, computed_total, 'paid_manual')
  returning sales.id, sales.receipt_no, sales.created_at
  into sale_id, sale_receipt_no, sale_created_at;

  insert into public.sale_items (sale_id, menu_item_id, name, qty, unit_price, line_total)
  select
    sale_id,
    nullif(raw_item->>'menuItemId', '')::uuid,
    coalesce(nullif(raw_item->>'name', ''), 'Urun'),
    (raw_item->>'qty')::integer,
    (raw_item->>'unitPrice')::numeric,
    coalesce(
      (raw_item->>'lineTotal')::numeric,
      ((raw_item->>'qty')::numeric * (raw_item->>'unitPrice')::numeric)
    )
  from jsonb_array_elements(p_items) as raw_item;

  return query
  select sale_id, sale_receipt_no, sale_created_at, computed_total;
end;
$$;

grant execute on function public.create_sale_with_items(jsonb) to authenticated;

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  ayar_anahtari text not null unique,
  ayar_degeri text not null,
  aciklama text,
  guncelleyen_kullanici uuid references public.users(id),
  guncellenme_tarihi timestamptz not null default now()
);

-- RLS (production-safe)
alter table public.users enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_categories enable row level security;
alter table public.ingredients enable row level security;
alter table public.menu_item_ingredients enable row level security;
alter table public.inventory_movements enable row level security;
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

-- menu_categories: herkes okuyabilir, sadece manager/admin degistirebilir
drop policy if exists "menu_categories_select_authenticated" on public.menu_categories;
drop policy if exists "menu_categories_write_admin_manager" on public.menu_categories;
create policy "menu_categories_select_authenticated"
  on public.menu_categories
  for select
  to authenticated
  using (true);
create policy "menu_categories_write_admin_manager"
  on public.menu_categories
  for all
  to authenticated
  using (public.get_current_user_role() in ('admin', 'manager'))
  with check (public.get_current_user_role() in ('admin', 'manager'));

-- ingredients: herkes okuyabilir, sadece manager/admin degistirebilir
drop policy if exists "ingredients_select_authenticated" on public.ingredients;
drop policy if exists "ingredients_write_admin_manager" on public.ingredients;
create policy "ingredients_select_authenticated"
  on public.ingredients
  for select
  to authenticated
  using (true);
create policy "ingredients_write_admin_manager"
  on public.ingredients
  for all
  to authenticated
  using (public.get_current_user_role() in ('admin', 'manager'))
  with check (public.get_current_user_role() in ('admin', 'manager'));

-- menu_item_ingredients (recete): herkes okuyabilir, sadece manager/admin degistirebilir
drop policy if exists "menu_item_ingredients_select_authenticated" on public.menu_item_ingredients;
drop policy if exists "menu_item_ingredients_write_admin_manager" on public.menu_item_ingredients;
create policy "menu_item_ingredients_select_authenticated"
  on public.menu_item_ingredients
  for select
  to authenticated
  using (true);
create policy "menu_item_ingredients_write_admin_manager"
  on public.menu_item_ingredients
  for all
  to authenticated
  using (public.get_current_user_role() in ('admin', 'manager'))
  with check (public.get_current_user_role() in ('admin', 'manager'));

-- inventory_movements: herkes okuyabilir, sadece manager/admin degistirebilir
drop policy if exists "inventory_movements_select_authenticated" on public.inventory_movements;
drop policy if exists "inventory_movements_write_admin_manager" on public.inventory_movements;
create policy "inventory_movements_select_authenticated"
  on public.inventory_movements
  for select
  to authenticated
  using (true);
create policy "inventory_movements_write_admin_manager"
  on public.inventory_movements
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
    if tg_table_name = 'users'
      and (to_jsonb(old)->>'role') is distinct from (to_jsonb(new)->>'role') then
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
drop trigger if exists trg_audit_menu_categories_iud on public.menu_categories;
drop trigger if exists trg_audit_ingredients_iud on public.ingredients;
drop trigger if exists trg_audit_menu_item_ingredients_iud on public.menu_item_ingredients;
drop trigger if exists trg_audit_inventory_movements_iud on public.inventory_movements;
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

create trigger trg_audit_menu_categories_iud
after insert or update or delete on public.menu_categories
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_ingredients_iud
after insert or update or delete on public.ingredients
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_menu_item_ingredients_iud
after insert or update or delete on public.menu_item_ingredients
for each row
execute function public.audit_log_data_change();

create trigger trg_audit_inventory_movements_iud
after insert or update or delete on public.inventory_movements
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
