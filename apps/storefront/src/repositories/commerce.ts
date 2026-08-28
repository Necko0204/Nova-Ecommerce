import type { Address, CartItem, Order, Product, Review } from '@nova/shared-types';
import { products as demoProducts } from '@/data/catalog';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface CheckoutInput {
  customerEmail: string;
  customerName: string;
  shippingAddress: Omit<Address, 'id'>;
  shippingMethod: 'standard' | 'express';
  shippingTotal: number;
  discountCode?: string;
  items: { variantId: string; quantity: number }[];
}

export interface CommerceProvider {
  listProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  createOrder(input: CheckoutInput): Promise<Pick<Order, 'id' | 'orderNumber' | 'total'>>;
  listMyOrders(): Promise<Order[]>;
  getWishlist(): Promise<string[]>;
  replaceWishlist(productIds: string[]): Promise<void>;
  mergeGuestCart(items: CartItem[]): Promise<void>;
  getCart(): Promise<{ variantId: string; quantity: number }[]>;
  syncCart(items: CartItem[]): Promise<void>;
  listReviews(productId: string): Promise<Review[]>;
  submitReview(input: { productId: string; rating: number; title: string; body: string }): Promise<void>;
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  specifications: Record<string, string>;
  status: Product['status'];
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string; slug: string; description: string; image_url: string } | null;
  product_images: { id: string; url: string; alt_text: string; position: number }[];
  product_variants: { id: string; name: string; sku: string; price: number; compare_at_price: number | null; color: string | null; color_hex: string | null; size: string | null; image_url: string | null; inventory: { available: number; reserved: number; incoming: number } | { available: number; reserved: number; incoming: number }[] | null }[];
  reviews: { rating: number }[];
};

const mapProduct = (row: ProductRow): Product => {
  const category = row.categories ?? { id: 'uncategorized', name: 'Objects', slug: 'objects', description: '', image_url: '' };
  const ratings = row.reviews ?? [];
  const rating = ratings.length ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length : 0;
  const variants = (row.product_variants ?? []).map((variant) => {
    const stock = Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory;
    return {
      id: variant.id,
      productId: row.id,
      name: variant.name,
      sku: variant.sku,
      price: Number(variant.price),
      compareAtPrice: variant.compare_at_price ? Number(variant.compare_at_price) : undefined,
      color: variant.color ?? undefined,
      colorHex: variant.color_hex ?? undefined,
      size: variant.size ?? undefined,
      imageUrl: variant.image_url ?? undefined,
      inventoryQuantity: stock?.available ?? 0,
      reservedQuantity: stock?.reserved ?? 0,
      incomingQuantity: stock?.incoming ?? 0,
    };
  });
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    details: row.details,
    specifications: row.specifications,
    category: { id: category.id, name: category.name, slug: category.slug, description: category.description, imageUrl: category.image_url },
    price: Math.min(...variants.map((variant) => variant.price)),
    compareAtPrice: variants.find((variant) => variant.compareAtPrice)?.compareAtPrice,
    rating: Number(rating.toFixed(1)),
    reviewCount: ratings.length,
    status: row.status,
    featured: row.featured,
    bestseller: row.bestseller,
    isNew: row.is_new,
    images: row.product_images.sort((a, b) => a.position - b.position).map((item) => ({ id: item.id, url: item.url, alt: item.alt_text, position: item.position })),
    variants,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

class SupabaseCommerceProvider implements CommerceProvider {
  private readonly productSelect = `
    id, slug, name, description, details, specifications, status, featured, bestseller, is_new, created_at, updated_at,
    categories(id,name,slug,description,image_url),
    product_images(id,url,alt_text,position),
    product_variants(id,name,sku,price,compare_at_price,color,color_hex,size,image_url,inventory(available,reserved,incoming)),
    reviews(rating)
  `;

  async listProducts(filters: ProductFilters = {}) {
    let query = supabase.from('products').select(this.productSelect).eq('status', 'active');
    if (filters.search) query = query.textSearch('name', filters.search, { type: 'websearch' });
    if (filters.category) query = query.eq('categories.slug', filters.category);
    if (filters.sort === 'newest') query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    let result = (data as unknown as ProductRow[]).map(mapProduct);
    result = applyClientFilters(result, filters);
    return result;
  }

  async getProduct(slug: string) {
    const { data, error } = await supabase.from('products').select(this.productSelect).eq('slug', slug).eq('status', 'active').maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data as unknown as ProductRow) : null;
  }

  async createOrder(input: CheckoutInput) {
    const { data, error } = await supabase.rpc('create_checkout_order', {
      p_customer_email: input.customerEmail,
      p_customer_name: input.customerName,
      p_shipping_address: input.shippingAddress,
      p_shipping_method: input.shippingMethod,
      p_shipping_total: input.shippingTotal,
      p_discount_code: input.discountCode ?? '',
      p_items: input.items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
    });
    if (error) throw error;
    const row = data?.[0];
    if (!row) throw new Error('The order could not be created.');
    return { id: row.order_id, orderNumber: row.order_number, total: Number(row.total) };
  }

  async listMyOrders() {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      userId: row.user_id ?? undefined,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      status: row.status,
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      items: row.order_items.map((item: Record<string, unknown>) => ({
        id: item.id as string,
        productId: item.product_id as string,
        variantId: item.variant_id as string,
        productName: item.product_name as string,
        variantName: item.variant_name as string,
        sku: item.sku as string,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        totalPrice: Number(item.total_price),
        imageUrl: item.image_url as string | undefined,
      })),
      shippingAddress: row.shipping_address,
      subtotal: Number(row.subtotal),
      discountTotal: Number(row.discount_total),
      shippingTotal: Number(row.shipping_total),
      taxTotal: Number(row.tax_total),
      total: Number(row.total),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) as Order[];
  }

  async getWishlist() {
    const { data, error } = await supabase.from('wishlists').select('id,wishlist_items(product_id)').eq('name','Saved items').maybeSingle();
    if (error) throw error;
    return (data?.wishlist_items ?? []).map((item) => item.product_id);
  }

  async replaceWishlist(productIds: string[]) {
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) return;
    const { data: savedWishlist, error } = await supabase.from('wishlists').select('id').eq('name','Saved items').maybeSingle();
    if (error) throw error;
    let wishlist = savedWishlist;
    if (!wishlist) {
      const result = await supabase.from('wishlists').insert({ user_id: session.user.id, name: 'Saved items' }).select('id').single();
      if (result.error) throw result.error; wishlist = result.data;
    }
    const deletion = await supabase.from('wishlist_items').delete().eq('wishlist_id', wishlist.id);
    if (deletion.error) throw deletion.error;
    if (productIds.length) {
      const insertion = await supabase.from('wishlist_items').insert([...new Set(productIds)].map((productId) => ({ wishlist_id: wishlist!.id, product_id: productId })));
      if (insertion.error) throw insertion.error;
    }
  }

  async mergeGuestCart(items: CartItem[]) {
    if (!items.length) return;
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) return;
    const { data: savedCart, error } = await supabase.from('carts').select('id').eq('status','active').maybeSingle();
    if (error) throw error;
    let cart = savedCart;
    if (!cart) {
      const result = await supabase.from('carts').insert({ user_id: session.user.id, status: 'active' }).select('id').single();
      if (result.error) throw result.error; cart = result.data;
    }
    const { data: existing, error: itemError } = await supabase.from('cart_items').select('variant_id,quantity').eq('cart_id',cart.id);
    if (itemError) throw itemError;
    const quantities = new Map(existing.map((item) => [item.variant_id,item.quantity]));
    const rows = items.map((item) => ({ cart_id: cart!.id, variant_id: item.variant.id, quantity: Math.max(item.quantity, quantities.get(item.variant.id) ?? 0) }));
    const result = await supabase.from('cart_items').upsert(rows,{onConflict:'cart_id,variant_id'});
    if (result.error) throw result.error;
  }

  async syncCart(items: CartItem[]) {
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) return;
    const { data: savedCart, error } = await supabase.from('carts').select('id').eq('status','active').maybeSingle();
    if (error) throw error;
    let cart = savedCart;
    if (!cart && !items.length) return;
    if (!cart) {
      const result = await supabase.from('carts').insert({ user_id: session.user.id, status: 'active' }).select('id').single();
      if (result.error) throw result.error;
      cart = result.data;
    }
    const deletion = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (deletion.error) throw deletion.error;
    if (items.length) {
      const insertion = await supabase.from('cart_items').insert(items.map((item) => ({ cart_id: cart!.id, variant_id: item.variant.id, quantity: item.quantity })));
      if (insertion.error) throw insertion.error;
    }
  }

  async getCart() {
    const { data: cart, error } = await supabase.from('carts').select('id,cart_items(variant_id,quantity)').eq('status','active').maybeSingle();
    if (error) throw error;
    return (cart?.cart_items ?? []).map((item) => ({ variantId: item.variant_id, quantity: item.quantity }));
  }

  async listReviews(productId: string) {
    const { data, error } = await supabase.from('reviews').select('id,product_id,user_id,rating,title,body,verified_purchase,approved,created_at').eq('product_id',productId).eq('approved',true).order('created_at',{ascending:false});
    if (error) throw error;
    return data.map((row) => ({ id:row.id,productId:row.product_id,userId:row.user_id,customerName:'Nova customer',rating:row.rating,title:row.title,body:row.body,verifiedPurchase:row.verified_purchase,approved:row.approved,createdAt:row.created_at }));
  }

  async submitReview(input: { productId: string; rating: number; title: string; body: string }) {
    const { error } = await supabase.rpc('submit_product_review', {
      p_product_id: input.productId,
      p_rating: input.rating,
      p_title: input.title,
      p_body: input.body,
    });
    if (error) throw error;
  }
}

const applyClientFilters = (source: Product[], filters: ProductFilters) => {
  let result = [...source];
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter((product) => `${product.name} ${product.description} ${product.category.name}`.toLowerCase().includes(term));
  }
  if (filters.category) result = result.filter((product) => product.category.slug === filters.category);
  if (filters.minPrice !== undefined) result = result.filter((product) => product.price >= filters.minPrice!);
  if (filters.maxPrice !== undefined) result = result.filter((product) => product.price <= filters.maxPrice!);
  if (filters.minRating) result = result.filter((product) => product.rating >= filters.minRating!);
  if (filters.inStock) result = result.filter((product) => product.variants.some((variant) => variant.inventoryQuantity > 0));
  result.sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price;
    if (filters.sort === 'price-desc') return b.price - a.price;
    if (filters.sort === 'rating') return b.rating - a.rating;
    if (filters.sort === 'newest') return Number(b.isNew) - Number(a.isNew);
    return Number(b.featured) - Number(a.featured);
  });
  return result;
};

class DemoCommerceProvider implements CommerceProvider {
  async listProducts(filters: ProductFilters = {}) { return applyClientFilters(demoProducts, filters); }
  async getProduct(slug: string) { return demoProducts.find((product) => product.slug === slug) ?? null; }
  async createOrder(input: CheckoutInput) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const subtotal = input.items.reduce((sum, item) => {
      const variant = demoProducts.flatMap((product) => product.variants).find((candidate) => candidate.id === item.variantId);
      return sum + (variant?.price ?? 0) * item.quantity;
    }, 0);
    const order = { id: crypto.randomUUID(), orderNumber: `DEMO-${String(Date.now()).slice(-6)}`, total: subtotal + input.shippingTotal };
    const saved = JSON.parse(localStorage.getItem('nova-demo-orders') ?? '[]') as typeof order[];
    localStorage.setItem('nova-demo-orders', JSON.stringify([{ ...order, ...input, createdAt: new Date().toISOString() }, ...saved]));
    return order;
  }
  async listMyOrders() { return []; }
  async getWishlist() { return []; }
  async replaceWishlist() { return; }
  async mergeGuestCart() { return; }
  async getCart() { return []; }
  async syncCart() { return; }
  async listReviews() { return []; }
  async submitReview() { await new Promise((resolve) => setTimeout(resolve, 350)); }
}

export const commerceProvider: CommerceProvider = isSupabaseConfigured ? new SupabaseCommerceProvider() : new DemoCommerceProvider();
