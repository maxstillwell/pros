alter table public.products
  add column if not exists image_url text,
  add column if not exists pickup_note text,
  add column if not exists sort_order integer not null default 0;

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  amount integer not null check (amount > 0),
  currency text not null default 'aud',
  customer_name text,
  customer_email text,
  customer_phone text,
  member_number text,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'failed', 'cancelled', 'refunded')),
  pickup_status text not null default 'pending_event_pickup' check (pickup_status in ('pending_event_pickup', 'ready_for_pickup', 'picked_up', 'contact_required', 'cancelled')),
  pickup_note text,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists products_active_sort_order_idx
  on public.products(active, sort_order);

create index if not exists shop_orders_created_at_idx
  on public.shop_orders(created_at desc);

create index if not exists shop_orders_status_created_at_idx
  on public.shop_orders(status, created_at desc);

create index if not exists shop_orders_product_id_idx
  on public.shop_orders(product_id);

drop trigger if exists shop_orders_set_updated_at on public.shop_orders;
create trigger shop_orders_set_updated_at
before update on public.shop_orders
for each row execute function public.set_updated_at();

alter table public.shop_orders enable row level security;

drop policy if exists "Shop orders are manageable by admins" on public.shop_orders;
create policy "Shop orders are manageable by admins"
on public.shop_orders for all
using (public.is_admin())
with check (public.is_admin());
