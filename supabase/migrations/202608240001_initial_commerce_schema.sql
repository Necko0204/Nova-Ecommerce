create extension if not exists pgcrypto;

create type public.product_status as enum ('draft', 'active', 'archived');
create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'refunded');
create type public.fulfillment_status as enum ('unfulfilled', 'partial', 'fulfilled', 'returned');
create type public.discount_type as enum ('percentage', 'fixed_amount', 'free_shipping');
create type public.inventory_adjustment_reason as enum ('received', 'sale', 'return', 'correction', 'damage', 'transfer');

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('customer', 'admin')),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  phone text,
  avatar_url text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_lower_idx on public.profiles (lower(email));
create index profiles_role_id_idx on public.profiles(role_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  image_url text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 2 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  status public.product_status not null default 'draft',
  featured boolean not null default false,
  bestseller boolean not null default false,
  is_new boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_id_idx on public.products(category_id);
create index products_status_created_at_idx on public.products(status, created_at desc);
create index products_search_idx on public.products using gin (to_tsvector('english', name || ' ' || description));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text,
  url text not null,
  alt_text text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique(product_id, position)
);
create index product_images_product_id_idx on public.product_images(product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  cost numeric(12,2) check (cost is null or cost >= 0),
  color text,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  size text,
  image_url text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, name)
);
create index product_variants_product_id_idx on public.product_variants(product_id);

create table public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  available integer not null default 0 check (available >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  incoming integer not null default 0 check (incoming >= 0),
  low_stock_threshold integer not null default 8 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  check (reserved <= available)
);

create table public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  reason public.inventory_adjustment_reason not null,
  quantity_delta integer not null check (quantity_delta <> 0),
  quantity_before integer not null,
  quantity_after integer not null check (quantity_after >= 0),
  note text,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);
create index inventory_adjustments_variant_created_idx on public.inventory_adjustments(variant_id, created_at desc);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_token uuid,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_token is not null)
);
create unique index carts_active_user_idx on public.carts(user_id) where status = 'active' and user_id is not null;
create unique index carts_active_guest_idx on public.carts(guest_token) where status = 'active' and guest_token is not null;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, variant_id)
);
create index cart_items_cart_id_idx on public.cart_items(cart_id);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Saved items',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(wishlist_id, product_id)
);
create index wishlist_items_wishlist_id_idx on public.wishlist_items(wishlist_id);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  company text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  country_code char(2) not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index addresses_user_id_idx on public.addresses(user_id);
create unique index addresses_one_default_idx on public.addresses(user_id) where is_default;

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  type public.discount_type not null,
  value numeric(12,2) not null check (value >= 0),
  minimum_purchase numeric(12,2) check (minimum_purchase is null or minimum_purchase >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at),
  check ((type = 'percentage' and value <= 100) or type <> 'percentage')
);
create index discounts_active_window_idx on public.discounts(active, starts_at, ends_at);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  currency char(3) not null default 'USD',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_total numeric(12,2) not null default 0 check (discount_total >= 0),
  shipping_total numeric(12,2) not null default 0 check (shipping_total >= 0),
  tax_total numeric(12,2) not null default 0 check (tax_total >= 0),
  total numeric(12,2) not null check (total >= 0),
  discount_id uuid references public.discounts(id) on delete set null,
  shipping_address jsonb not null,
  billing_address jsonb,
  shipping_method text not null default 'standard',
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index orders_customer_email_idx on public.orders(lower(customer_email));

create sequence public.order_number_seq start 1053;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  sku text not null,
  image_url text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

create table public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts(id) on delete restrict,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  redeemed_at timestamptz not null default now()
);
create index discount_redemptions_discount_id_idx on public.discount_redemptions(discount_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 3 and 100),
  body text not null check (char_length(body) between 20 and 2000),
  verified_purchase boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, user_id)
);
create index reviews_product_approved_created_idx on public.reviews(product_id, approved, created_at desc);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id uuid,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index analytics_events_name_occurred_idx on public.analytics_events(event_name, occurred_at desc);
create index analytics_events_session_idx on public.analytics_events(session_id);

create table public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_activity_created_at_idx on public.admin_activity(created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger inventory_set_updated_at before update on public.inventory for each row execute function public.set_updated_at();
create trigger carts_set_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger cart_items_set_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
create trigger wishlists_set_updated_at before update on public.wishlists for each row execute function public.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger discounts_set_updated_at before update on public.discounts for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare customer_role uuid;
begin
  select id into customer_role from public.roles where name = 'customer';
  insert into public.profiles (id, role_id, full_name, email)
  values (new.id, customer_role, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.email);
  insert into public.wishlists (user_id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p join public.roles r on r.id = p.role_id
    where p.id = auth.uid() and r.name = 'admin'
  );
$$;

create or replace function public.adjust_inventory(
  p_variant_id uuid,
  p_quantity_delta integer,
  p_reason public.inventory_adjustment_reason,
  p_note text default null
)
returns public.inventory
language plpgsql
security definer
set search_path = public
as $$
declare current_row public.inventory;
begin
  if not public.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_quantity_delta = 0 then raise exception 'Adjustment must not be zero'; end if;
  select * into current_row from public.inventory where variant_id = p_variant_id for update;
  if not found then raise exception 'Inventory record not found'; end if;
  if current_row.available + p_quantity_delta < 0 then raise exception 'Inventory cannot be negative'; end if;

  insert into public.inventory_adjustments (variant_id, created_by, reason, quantity_delta, quantity_before, quantity_after, note)
  values (p_variant_id, auth.uid(), p_reason, p_quantity_delta, current_row.available, current_row.available + p_quantity_delta, p_note);
  update public.inventory set available = available + p_quantity_delta where variant_id = p_variant_id returning * into current_row;
  insert into public.admin_activity (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'Inventory adjusted', 'variant', p_variant_id, jsonb_build_object('delta', p_quantity_delta, 'reason', p_reason));
  return current_row;
end;
$$;

create or replace function public.create_checkout_order(
  p_customer_email text,
  p_customer_name text,
  p_shipping_address jsonb,
  p_shipping_method text,
  p_shipping_total numeric,
  p_discount_code text,
  p_items jsonb
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  variant_row record;
  computed_subtotal numeric(12,2) := 0;
  computed_discount numeric(12,2) := 0;
  computed_tax numeric(12,2) := 0;
  discount_row public.discounts;
  new_order public.orders;
  item_quantity integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if p_customer_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'Valid customer email required'; end if;
  if coalesce(length(trim(p_customer_name)), 0) < 2 then raise exception 'Customer name required'; end if;
  if p_shipping_method not in ('standard', 'express') then raise exception 'Invalid shipping method'; end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    item_quantity := (item ->> 'quantity')::integer;
    if item_quantity < 1 or item_quantity > 20 then raise exception 'Invalid item quantity'; end if;
    select pv.id, pv.product_id, pv.name, pv.sku, pv.price, pv.image_url, p.name as product_name, i.available, i.reserved
      into variant_row
      from public.product_variants pv
      join public.products p on p.id = pv.product_id and p.status = 'active'
      join public.inventory i on i.variant_id = pv.id
      where pv.id = (item ->> 'variant_id')::uuid and pv.active
      for update of i;
    if not found then raise exception 'A cart item is unavailable'; end if;
    if variant_row.available - variant_row.reserved < item_quantity then raise exception 'Insufficient stock for %', variant_row.product_name; end if;
    computed_subtotal := computed_subtotal + (variant_row.price * item_quantity);
  end loop;

  if nullif(trim(coalesce(p_discount_code, '')), '') is not null then
    select * into discount_row from public.discounts
      where code = upper(trim(p_discount_code)) and active and starts_at <= now() and (ends_at is null or ends_at > now())
      and (usage_limit is null or usage_count < usage_limit)
      for update;
    if not found then raise exception 'Discount code is invalid or expired'; end if;
    if discount_row.minimum_purchase is not null and computed_subtotal < discount_row.minimum_purchase then raise exception 'Order does not meet the discount minimum'; end if;
    computed_discount := case discount_row.type
      when 'percentage' then round(computed_subtotal * discount_row.value / 100, 2)
      when 'fixed_amount' then least(computed_subtotal, discount_row.value)
      when 'free_shipping' then least(p_shipping_total, p_shipping_total)
    end;
  end if;

  computed_tax := round((computed_subtotal - case when discount_row.type in ('percentage', 'fixed_amount') then computed_discount else 0 end) * 0.08, 2);
  insert into public.orders (
    order_number, user_id, customer_email, customer_name, status, payment_status,
    subtotal, discount_total, shipping_total, tax_total, total, discount_id, shipping_address, shipping_method
  ) values (
    'NV-' || nextval('public.order_number_seq'), auth.uid(), lower(trim(p_customer_email)), trim(p_customer_name),
    'confirmed', 'paid', computed_subtotal, computed_discount,
    case when discount_row.type = 'free_shipping' then 0 else p_shipping_total end,
    computed_tax,
    computed_subtotal - case when discount_row.type in ('percentage', 'fixed_amount') then computed_discount else 0 end + case when discount_row.type = 'free_shipping' then 0 else p_shipping_total end + computed_tax,
    discount_row.id, p_shipping_address, p_shipping_method
  ) returning * into new_order;

  for item in select * from jsonb_array_elements(p_items)
  loop
    item_quantity := (item ->> 'quantity')::integer;
    select pv.id, pv.product_id, pv.name, pv.sku, pv.price, pv.image_url, p.name as product_name, i.available
      into variant_row
      from public.product_variants pv join public.products p on p.id = pv.product_id
      join public.inventory i on i.variant_id = pv.id
      where pv.id = (item ->> 'variant_id')::uuid for update of i;
    insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, sku, image_url, quantity, unit_price)
    values (new_order.id, variant_row.product_id, variant_row.id, variant_row.product_name, variant_row.name, variant_row.sku, variant_row.image_url, item_quantity, variant_row.price);
    update public.inventory set available = available - item_quantity where variant_id = variant_row.id;
    insert into public.inventory_adjustments (variant_id, reason, quantity_delta, quantity_before, quantity_after, reference_type, reference_id)
    values (variant_row.id, 'sale', -item_quantity, variant_row.available, variant_row.available - item_quantity, 'order', new_order.id);
  end loop;

  if discount_row.id is not null then
    update public.discounts set usage_count = usage_count + 1 where id = discount_row.id;
    insert into public.discount_redemptions(discount_id, order_id, user_id, amount) values (discount_row.id, new_order.id, auth.uid(), computed_discount);
  end if;
  if auth.uid() is not null then update public.carts set status = 'converted' where user_id = auth.uid() and status = 'active'; end if;
  insert into public.admin_activity(action, entity_type, entity_id, metadata)
  values ('Order ' || new_order.order_number || ' was created', 'order', new_order.id, jsonb_build_object('total', new_order.total));
  return query select new_order.id, new_order.order_number, new_order.total;
end;
$$;

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.addresses enable row level security;
alter table public.discounts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.discount_redemptions enable row level security;
alter table public.reviews enable row level security;
alter table public.analytics_events enable row level security;
alter table public.admin_activity enable row level security;

create policy "roles are readable" on public.roles for select using (true);
create policy "users read own profile admins read all" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "public reads active categories" on public.categories for select using (active or public.is_admin());
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public reads active products" on public.products for select using (status = 'active' or public.is_admin());
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "public reads active product images" on public.product_images for select using (exists(select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.is_admin())));
create policy "admins manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "public reads active variants" on public.product_variants for select using (active and exists(select 1 from public.products p where p.id = product_id and p.status = 'active') or public.is_admin());
create policy "admins manage variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "public reads inventory availability" on public.inventory for select using (true);
create policy "admins manage inventory" on public.inventory for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read inventory adjustments" on public.inventory_adjustments for select using (public.is_admin());
create policy "users manage own carts" on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage items in own carts" on public.cart_items for all using (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "users manage own wishlists" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own wishlist items" on public.wishlist_items for all using (exists(select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())) with check (exists(select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));
create policy "users manage own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins manage discounts" on public.discounts for all using (public.is_admin()) with check (public.is_admin());
create policy "users read own orders admins read all" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "users read own order items admins read all" on public.order_items for select using (exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "users read own redemptions admins read all" on public.discount_redemptions for select using (user_id = auth.uid() or public.is_admin());
create policy "public reads approved reviews" on public.reviews for select using (approved or user_id = auth.uid() or public.is_admin());
create policy "users create own reviews" on public.reviews for insert with check (user_id = auth.uid());
create policy "users update own pending reviews" on public.reviews for update using (user_id = auth.uid() and not approved) with check (user_id = auth.uid());
create policy "admins moderate reviews" on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create policy "clients create analytics events" on public.analytics_events for insert with check (user_id is null or user_id = auth.uid());
create policy "admins read analytics events" on public.analytics_events for select using (public.is_admin());
create policy "admins read activity" on public.admin_activity for select using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.roles to anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.product_variants, public.inventory, public.reviews to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.carts, public.cart_items, public.wishlists, public.wishlist_items, public.addresses to authenticated;
grant select on public.orders, public.order_items, public.discount_redemptions to authenticated;
grant insert, update on public.reviews to authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_variants, public.inventory, public.discounts to authenticated;
grant update on public.orders to authenticated;
grant select on public.discounts, public.inventory_adjustments, public.analytics_events, public.admin_activity to authenticated;
grant execute on function public.create_checkout_order(text,text,jsonb,text,numeric,text,jsonb) to anon, authenticated;
grant execute on function public.adjust_inventory(uuid,integer,public.inventory_adjustment_reason,text) to authenticated;
