create or replace function public.submit_product_review(
  p_product_id uuid,
  p_rating integer,
  p_title text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_order_item uuid;
  review_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in to write a review'; end if;
  if p_rating not between 1 and 5 then raise exception 'Rating must be between 1 and 5'; end if;
  if char_length(trim(p_title)) not between 3 and 80 then raise exception 'Review title must be between 3 and 80 characters'; end if;
  if char_length(trim(p_body)) not between 20 and 1000 then raise exception 'Review must be between 20 and 1000 characters'; end if;
  if not exists (select 1 from public.products where id = p_product_id and status = 'active') then raise exception 'Product is unavailable'; end if;

  select oi.id into matched_order_item
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.user_id = auth.uid() and oi.product_id = p_product_id and o.status = 'delivered'
  order by o.created_at desc limit 1;

  insert into public.reviews(product_id, user_id, order_item_id, rating, title, body, verified_purchase, approved)
  values (p_product_id, auth.uid(), matched_order_item, p_rating, trim(p_title), trim(p_body), matched_order_item is not null, false)
  on conflict (product_id, user_id) do update
    set order_item_id = excluded.order_item_id, rating = excluded.rating, title = excluded.title,
        body = excluded.body, verified_purchase = excluded.verified_purchase, approved = false, updated_at = now()
  returning id into review_id;
  return review_id;
end;
$$;

revoke all on function public.submit_product_review(uuid, integer, text, text) from public;
grant execute on function public.submit_product_review(uuid, integer, text, text) to authenticated;
