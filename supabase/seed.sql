-- Nova Commerce local demo data. Password for every seeded account: NovaDemo!2026
insert into public.roles (id, name, description) values
  ('10000000-0000-0000-0000-000000000001', 'customer', 'Customer storefront access'),
  ('10000000-0000-0000-0000-000000000002', 'admin', 'Merchant administration access');

insert into public.categories (id, name, slug, description, image_url, position) values
  ('20000000-0000-0000-0000-000000000001', 'Carry', 'carry', 'Bags designed around the way you move.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1400&q=85', 1),
  ('20000000-0000-0000-0000-000000000002', 'Audio', 'audio', 'Focused listening, wherever the day goes.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85', 2),
  ('20000000-0000-0000-0000-000000000003', 'Desk', 'desk', 'Tools for calmer, more intentional work.', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85', 3),
  ('20000000-0000-0000-0000-000000000004', 'Wear', 'wear', 'Everyday layers, refined to their essentials.', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=85', 4),
  ('20000000-0000-0000-0000-000000000005', 'Travel', 'travel', 'Considered companions for going further.', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=85', 5);

with product_seed(id, category_id, name, slug, description, status, featured, bestseller, is_new, image_url, alternate_url, price, compare_price, color) as (
  values
  ('30000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000001'::uuid, 'Nova Carry Backpack', 'nova-carry-backpack', 'A structured 22L carry built for commutes, long weekends, and everything between.', 'active'::public.product_status, true, true, false, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=88', 148, null, 'Graphite'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Aero Wireless Headphones', 'aero-wireless-headphones', 'Immersive sound, adaptive noise control, and an effortless all-day fit.', 'active', true, false, true, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=88', 219, 249, 'Sand'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Form Mechanical Keyboard', 'form-mechanical-keyboard', 'A compact aluminum keyboard with tactile switches and a softened acoustic profile.', 'active', true, true, false, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=88', 164, null, 'Bone'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'Orbit Desk Lamp', 'orbit-desk-lamp', 'Flicker-free, warm-to-cool task light with a precise, counterbalanced arm.', 'active', true, false, true, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=88', 129, null, 'Chalk'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'Arc Crossbody', 'arc-crossbody', 'A low-profile everyday bag with surprising organization and a soft woven strap.', 'active', false, true, false, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=88', 78, null, 'Olive'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 'Mono Travel Bottle', 'mono-travel-bottle', 'Double-wall stainless steel with a ceramic-lined interior and quiet carry loop.', 'active', false, true, false, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=88', 42, null, 'Moss'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 'Frame Sunglasses', 'frame-sunglasses', 'Polarized bio-acetate frames with a gently architectural silhouette.', 'active', false, false, true, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=88', 112, null, 'Tortoise'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', 'Halo Portable Speaker', 'halo-portable-speaker', 'Room-filling 360-degree sound in a water-resistant form built to travel.', 'active', true, false, false, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=88', 139, null, 'Ochre'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 'Studio Notebook', 'studio-notebook', 'Lay-flat binding, fountain-pen friendly paper, and a satisfying cloth-bound cover.', 'active', false, true, false, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1200&q=88', 28, null, 'Clay'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', 'Core Everyday Tee', 'core-everyday-tee', 'A substantial organic-cotton tee cut with a relaxed, considered drape.', 'active', false, false, false, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=88', 48, null, 'Ecru'),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000004', 'Motion Technical Jacket', 'motion-technical-jacket', 'A weather-ready shell with clean lines, hidden ventilation, and quiet fabric.', 'active', false, false, true, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=88', 238, null, 'Slate'),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000005', 'Terra Weekender', 'terra-weekender', 'A 38L soft-sided weekender that opens flat and keeps every trip composed.', 'active', true, false, false, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=88', 188, null, 'Cedar'),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000002', 'Signal Earbuds', 'signal-earbuds', 'Pocket-sized listening with clear calls, spatial sound, and 30-hour battery life.', 'active', false, false, false, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=88', 149, null, 'Ink'),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000003', 'Line Cable Organizer', 'line-cable-organizer', 'A weighted oak organizer that brings calm to the cables on your desk.', 'active', false, false, false, 'https://images.unsplash.com/photo-1615525137689-198778541af6?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1615525137689-198778541af6?auto=format&fit=crop&w=1200&q=88', 34, null, 'Natural'),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000004', 'Field Cap', 'field-cap', 'A breathable, packable five-panel cap for bright trails and slow weekends.', 'active', false, false, false, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=88', 44, null, 'Fern'),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000003', 'Fold Laptop Stand', 'fold-laptop-stand', 'A stable, height-adjustable aluminum stand that folds completely flat.', 'active', false, true, false, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=88', 84, null, 'Silver'),
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000005', 'Drift Travel Pouch', 'drift-travel-pouch', 'A padded, water-resistant home for chargers, documents, and small essentials.', 'active', false, false, false, 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=88', 56, null, 'Marine'),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000004', 'Tempo Analog Watch', 'tempo-analog-watch', 'A restrained 38mm field watch with sapphire crystal and a woven strap.', 'active', true, false, false, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=88', 196, null, 'Steel'),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000003', 'Beam Monitor Light', 'beam-monitor-light', 'Glare-free illumination that restores space and softness to your desk.', 'active', false, false, false, 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=88', 96, null, 'Graphite'),
  ('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000001', 'Pocket Card Wallet', 'pocket-card-wallet', 'Vegetable-tanned leather, four card slots, and a silhouette that stays slim.', 'active', false, false, false, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=88', 52, null, 'Umber'),
  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000001', 'Route Sling', 'route-sling', 'A reversible, body-hugging sling sized for daily essentials and a small camera.', 'active', false, false, false, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=88', 88, null, 'Stone'),
  ('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000002', 'Quiet Desktop Speakers', 'quiet-desktop-speakers', 'Warm near-field audio with walnut cabinets and a minimal footprint.', 'active', false, false, true, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=88', 184, null, 'Walnut'),
  ('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000005', 'Passage Packing Cubes', 'passage-packing-cubes', 'A set of three featherlight organizers with expandable compression.', 'active', false, false, false, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=88', 64, null, 'Mist'),
  ('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000001', 'Studio Tote', 'studio-tote', 'A structured cotton-canvas tote with a zip top and protected laptop sleeve.', 'active', false, false, true, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=88', 96, null, 'Canvas'),
  ('30000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000001', 'Axis Tech Case', 'axis-tech-case', 'Expandable storage for the chargers and tools that keep work moving.', 'active', false, false, false, 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=88', 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1200&q=88', 68, null, 'Black')
), inserted_products as (
  insert into public.products (id, category_id, name, slug, description, details, specifications, status, featured, bestseller, is_new, seo_title, seo_description)
  select id, category_id, name, slug, description,
    '["Designed for daily use","Responsibly selected materials","Two-year Nova Supply warranty"]'::jsonb,
    jsonb_build_object('Material', 'Premium mixed materials', 'Care', 'Wipe clean', 'Warranty', '2 years'),
    status, featured, bestseller, is_new, name || ' | Nova Supply', description
  from product_seed returning id
), inserted_images as (
  insert into public.product_images(product_id, url, alt_text, position)
  select id, image_url, name || ' in ' || color, 0 from product_seed
  union all
  select id, alternate_url, name || ' alternate view', 1 from product_seed returning id
), variant_seed as (
  select id as product_id, name, color, price, compare_price, image_url,
    '40000000-0000-0000-0000-' || lpad((row_number() over(order by id))::text, 12, '0') as variant_id,
    'NV-' || lpad((row_number() over(order by id))::text, 3, '0') || '-' || upper(left(color, 3)) as sku
  from product_seed
), inserted_variants as (
  insert into public.product_variants(id, product_id, name, sku, price, compare_at_price, cost, color, color_hex, image_url)
  select variant_id::uuid, product_id, color, sku, price, compare_price, round(price * .42, 2), color,
    case (row_number() over(order by product_id) % 4) when 0 then '#1D211F' when 1 then '#B7A68D' when 2 then '#6C7567' else '#C46E47' end,
    image_url from variant_seed returning id, product_id
)
insert into public.inventory(variant_id, available, reserved, incoming, low_stock_threshold)
select id, 5 + (row_number() over(order by product_id) * 7 % 68), row_number() over(order by product_id) % 4,
  case when row_number() over(order by product_id) % 5 = 0 then 24 else 0 end, 8
from inserted_variants;

-- Seed one merchant and 30 believable customer identities.
with people(id, full_name, email, created_days_ago) as (
  values
  ('50000000-0000-0000-0000-000000000001'::uuid, 'Mara Reyes', 'admin@novasupply.local', 420),
  ('50000000-0000-0000-0000-000000000002', 'Olivia Chen', 'olivia.chen@example.local', 368),
  ('50000000-0000-0000-0000-000000000003', 'Mateo Santos', 'mateo.santos@example.local', 352),
  ('50000000-0000-0000-0000-000000000004', 'Sofia Kim', 'sofia.kim@example.local', 339),
  ('50000000-0000-0000-0000-000000000005', 'Liam Patel', 'liam.patel@example.local', 322),
  ('50000000-0000-0000-0000-000000000006', 'Amara Okafor', 'amara.okafor@example.local', 305),
  ('50000000-0000-0000-0000-000000000007', 'Noah Williams', 'noah.williams@example.local', 294),
  ('50000000-0000-0000-0000-000000000008', 'Isla Thompson', 'isla.thompson@example.local', 281),
  ('50000000-0000-0000-0000-000000000009', 'Ethan Lim', 'ethan.lim@example.local', 269),
  ('50000000-0000-0000-0000-000000000010', 'Ava Martinez', 'ava.martinez@example.local', 252),
  ('50000000-0000-0000-0000-000000000011', 'Lucas Meyer', 'lucas.meyer@example.local', 241),
  ('50000000-0000-0000-0000-000000000012', 'Mia Andersson', 'mia.andersson@example.local', 225),
  ('50000000-0000-0000-0000-000000000013', 'Theo Johnson', 'theo.johnson@example.local', 213),
  ('50000000-0000-0000-0000-000000000014', 'Yuna Park', 'yuna.park@example.local', 199),
  ('50000000-0000-0000-0000-000000000015', 'Elijah Brooks', 'elijah.brooks@example.local', 187),
  ('50000000-0000-0000-0000-000000000016', 'Freya Nielsen', 'freya.nielsen@example.local', 172),
  ('50000000-0000-0000-0000-000000000017', 'Kai Mendoza', 'kai.mendoza@example.local', 160),
  ('50000000-0000-0000-0000-000000000018', 'Nora Haddad', 'nora.haddad@example.local', 149),
  ('50000000-0000-0000-0000-000000000019', 'Arthur Davies', 'arthur.davies@example.local', 137),
  ('50000000-0000-0000-0000-000000000020', 'Lena Fischer', 'lena.fischer@example.local', 126),
  ('50000000-0000-0000-0000-000000000021', 'Gabriel Silva', 'gabriel.silva@example.local', 115),
  ('50000000-0000-0000-0000-000000000022', 'Zoe Robinson', 'zoe.robinson@example.local', 103),
  ('50000000-0000-0000-0000-000000000023', 'Hugo Laurent', 'hugo.laurent@example.local', 92),
  ('50000000-0000-0000-0000-000000000024', 'Maeve Murphy', 'maeve.murphy@example.local', 81),
  ('50000000-0000-0000-0000-000000000025', 'Adrian Cruz', 'adrian.cruz@example.local', 70),
  ('50000000-0000-0000-0000-000000000026', 'Leila Rahman', 'leila.rahman@example.local', 59),
  ('50000000-0000-0000-0000-000000000027', 'Owen Clarke', 'owen.clarke@example.local', 47),
  ('50000000-0000-0000-0000-000000000028', 'Camille Dubois', 'camille.dubois@example.local', 36),
  ('50000000-0000-0000-0000-000000000029', 'Jasper Tan', 'jasper.tan@example.local', 25),
  ('50000000-0000-0000-0000-000000000030', 'Priya Nair', 'priya.nair@example.local', 14),
  ('50000000-0000-0000-0000-000000000031', 'Caleb Wilson', 'caleb.wilson@example.local', 5)
), auth_insert as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
  )
  select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
    crypt('NovaDemo!2026', gen_salt('bf')), now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', full_name), false,
    now() - make_interval(days => created_days_ago), now()
  from people returning id, email
)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from auth_insert;

update public.profiles set role_id = '10000000-0000-0000-0000-000000000002' where id = '50000000-0000-0000-0000-000000000001';

insert into public.addresses(user_id, first_name, last_name, address_line_1, city, province, postal_code, country_code, is_default)
select p.id, split_part(p.full_name, ' ', 1), split_part(p.full_name, ' ', 2),
  (100 + row_number() over(order by p.id)) || ' Meridian Street',
  case row_number() over(order by p.id) % 5 when 0 then 'Austin' when 1 then 'Brooklyn' when 2 then 'Portland' when 3 then 'Seattle' else 'San Diego' end,
  case row_number() over(order by p.id) % 5 when 0 then 'TX' when 1 then 'NY' when 2 then 'OR' when 3 then 'WA' else 'CA' end,
  lpad((90000 + row_number() over(order by p.id))::text, 5, '0'), 'US', true
from public.profiles p join public.roles r on r.id = p.role_id where r.name = 'customer';

insert into public.discounts(id, code, type, value, minimum_purchase, usage_limit, usage_count, starts_at, ends_at, active, created_by) values
  ('60000000-0000-0000-0000-000000000001', 'WELCOME10', 'percentage', 10, 75, 500, 84, now() - interval '180 days', now() + interval '180 days', true, '50000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'STUDIO20', 'fixed_amount', 20, 150, 200, 37, now() - interval '60 days', now() + interval '90 days', true, '50000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000003', 'SHIPFREE', 'free_shipping', 0, 100, null, 63, now() - interval '90 days', null, true, '50000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000004', 'FIELD15', 'percentage', 15, 120, 100, 100, now() - interval '120 days', now() - interval '10 days', false, '50000000-0000-0000-0000-000000000001');

with customers as (
  select p.*, row_number() over(order by p.created_at) as rn from public.profiles p join public.roles r on r.id = p.role_id where r.name = 'customer'
), variants as (
  select pv.*, p.name as product_name, row_number() over(order by pv.id) as rn from public.product_variants pv join public.products p on p.id = pv.product_id
), order_seed as (
  select g as n,
    c.id as user_id, c.full_name, c.email, a.id as address_id,
    v.id as variant_id, v.product_id, v.name as variant_name, v.sku, v.price, v.image_url, v.product_name,
    1 + (g % 3) as quantity,
    now() - make_interval(days => (41 - g) * 2, hours => g % 11) as order_date
  from generate_series(1,40) g
  join customers c on c.rn = 1 + ((g - 1) % 30)
  join public.addresses a on a.user_id = c.id and a.is_default
  join variants v on v.rn = 1 + ((g * 7 - 1) % 25)
), inserted_orders as (
  insert into public.orders(id, order_number, user_id, customer_email, customer_name, status, payment_status, fulfillment_status, subtotal, discount_total, shipping_total, tax_total, total, shipping_address, shipping_method, created_at, updated_at)
  select ('70000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
    'NV-' || (1012 + n), user_id, email, full_name,
    (case when n > 36 then 'processing' when n > 32 then 'shipped' when n % 13 = 0 then 'cancelled' else 'delivered' end)::public.order_status,
    (case when n % 13 = 0 then 'refunded' else 'paid' end)::public.payment_status,
    (case when n > 36 then 'unfulfilled' when n > 32 then 'fulfilled' when n % 13 = 0 then 'returned' else 'fulfilled' end)::public.fulfillment_status,
    price * quantity, case when n % 5 = 0 then round(price * quantity * .1, 2) else 0 end,
    case when price * quantity >= 100 then 0 else 8 end,
    round((price * quantity - case when n % 5 = 0 then price * quantity * .1 else 0 end) * .08, 2),
    round(price * quantity - case when n % 5 = 0 then price * quantity * .1 else 0 end + case when price * quantity >= 100 then 0 else 8 end + (price * quantity - case when n % 5 = 0 then price * quantity * .1 else 0 end) * .08, 2),
    jsonb_build_object('firstName', split_part(full_name, ' ', 1), 'lastName', split_part(full_name, ' ', 2), 'address1', (100+n) || ' Meridian Street', 'city', 'Portland', 'province', 'OR', 'postalCode', '97205', 'country', 'US'),
    case when n % 6 = 0 then 'express' else 'standard' end, order_date, order_date
  from order_seed returning id, order_number
)
insert into public.order_items(order_id, product_id, variant_id, product_name, variant_name, sku, image_url, quantity, unit_price, created_at)
select ('70000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid, product_id, variant_id, product_name, variant_name, sku, image_url, quantity, price, order_date
from order_seed;

insert into public.reviews(product_id, user_id, rating, title, body, verified_purchase, approved, created_at)
select oi.product_id, o.user_id,
  4 + (row_number() over(order by o.id) % 2),
  (array['Quietly excellent','Better than expected','A thoughtful everyday upgrade','Beautifully considered','Earned a permanent place'])[1 + (row_number() over(order by o.id) % 5)],
  (array[
    'The materials feel considered and the small details make it genuinely pleasant to use every day.',
    'It arrived beautifully packed, works exactly as described, and already feels like something I will keep for years.',
    'A clean design with none of the usual unnecessary fuss. The fit and finish are especially impressive.',
    'I have used this nearly every day since it arrived. Thoughtful proportions and genuinely useful organization.',
    'The quality is immediately apparent without feeling precious. It simply makes my routine work better.'
  ])[1 + (row_number() over(order by o.id) % 5)],
  true, true, o.created_at + interval '12 days'
from public.orders o join public.order_items oi on oi.order_id = o.id
where o.status = 'delivered'
on conflict(product_id, user_id) do nothing;

insert into public.analytics_events(user_id, session_id, event_name, properties, occurred_at)
select case when g % 3 = 0 then ('50000000-0000-0000-0000-' || lpad((2 + g % 30)::text, 12, '0'))::uuid else null end,
  gen_random_uuid(),
  (array['page_view','product_view','add_to_cart','search','checkout_started','purchase'])[1 + (g % 6)],
  jsonb_build_object('source', (array['direct','organic','social','email'])[1 + (g % 4)], 'device', (array['mobile','desktop','tablet'])[1 + (g % 3)]),
  now() - make_interval(hours => g * 4)
from generate_series(1,240) g;

insert into public.admin_activity(actor_id, action, entity_type, entity_id, metadata, created_at) values
  ('50000000-0000-0000-0000-000000000001', 'Order NV-1052 was created', 'order', '70000000-0000-0000-0000-000000000040', '{}', now() - interval '12 minutes'),
  ('50000000-0000-0000-0000-000000000001', 'Inventory for Aero Wireless Headphones decreased', 'inventory', '40000000-0000-0000-0000-000000000002', '{"delta":-1}', now() - interval '38 minutes'),
  (null, 'Customer Olivia Chen registered', 'customer', '50000000-0000-0000-0000-000000000002', '{}', now() - interval '2 hours'),
  ('50000000-0000-0000-0000-000000000001', 'Order NV-1043 was shipped', 'order', '70000000-0000-0000-0000-000000000031', '{}', now() - interval '4 hours'),
  ('50000000-0000-0000-0000-000000000001', 'Product Nova Carry Backpack was updated', 'product', '30000000-0000-0000-0000-000000000001', '{}', now() - interval '1 day'),
  ('50000000-0000-0000-0000-000000000001', 'Discount STUDIO20 was created', 'discount', '60000000-0000-0000-0000-000000000002', '{}', now() - interval '3 days');

insert into public.inventory_adjustments(variant_id, created_by, reason, quantity_delta, quantity_before, quantity_after, note, created_at)
select variant_id, '50000000-0000-0000-0000-000000000001', 'received', 24, greatest(available - 24, 0), available, 'Autumn collection replenishment', now() - make_interval(days => row_number() over(order by variant_id)::integer)
from public.inventory where incoming > 0;
