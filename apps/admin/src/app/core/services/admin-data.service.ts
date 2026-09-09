import { computed, inject, Injectable, signal } from '@angular/core';
import type { DiscountType, OrderStatus, PaymentStatus, ProductStatus } from '@nova/shared-types';
import { AuthService } from './auth.service';

export interface AdminProduct { id: string; name: string; slug: string; description: string; category: string; categoryId: string; imageUrl: string; price: number; comparePrice?: number; cost: number; sku: string; inventory: number; reserved: number; incoming: number; status: ProductStatus; updatedAt: string; variants: AdminVariant[]; seoTitle: string; seoDescription: string; }
export interface AdminVariant { id: string; name: string; sku: string; price: number; inventory: number; color?: string; size?: string; }
export interface AdminOrder { id: string; number: string; customerId: string; customer: string; email: string; date: string; status: OrderStatus; payment: PaymentStatus; fulfillment: string; items: number; total: number; imageUrls: string[]; address: string; }
export interface AdminCustomer { id: string; name: string; email: string; orders: number; totalSpent: number; averageOrder: number; lastOrder: string; joined: string; city: string; notes: string; }
export interface AdminDiscount { id: string; code: string; type: DiscountType; value: number; minimum: number; usage: number; limit?: number; startsAt: string; endsAt?: string; active: boolean; }
export interface ActivityItem { id: string; text: string; kind: 'order' | 'inventory' | 'customer' | 'product' | 'discount'; date: string; }

interface ProductDbRow { id:string;name:string;slug:string;description:string;status:ProductStatus;seo_title:string|null;seo_description:string|null;updated_at:string;categories:{id:string;name:string}|null;product_images:{url:string;position:number}[];product_variants:{id:string;name:string;sku:string;price:number;compare_at_price:number|null;cost:number|null;color:string|null;size:string|null;inventory:{available:number;reserved:number;incoming:number}|{available:number;reserved:number;incoming:number}[]|null}[]; }
interface OrderDbRow { id:string;order_number:string;user_id:string;customer_name:string;customer_email:string;created_at:string;status:OrderStatus;payment_status:PaymentStatus;fulfillment_status:string;total:number;shipping_address:Record<string,string>;order_items:{image_url:string|null;quantity:number}[]; }
interface ProfileDbRow { id:string;full_name:string;email:string;created_at:string; }
interface DiscountDbRow { id:string;code:string;type:DiscountType;value:number;minimum_purchase:number|null;usage_count:number;usage_limit:number|null;starts_at:string;ends_at:string|null;active:boolean; }
interface ActivityDbRow { id:string;action:string;entity_type:string;created_at:string; }

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly auth = inject(AuthService);

  // A new installation starts empty. Content is loaded only from Supabase.
  readonly products = signal<AdminProduct[]>([]);
  readonly orders = signal<AdminOrder[]>([]);
  readonly customers = signal<AdminCustomer[]>([]);
  readonly discounts = signal<AdminDiscount[]>([]);
  readonly activity = signal<ActivityItem[]>([]);
  readonly activeProducts = computed(() => this.products().filter((product) => product.status === 'active').length);
  readonly lowStock = computed(() => this.products().filter((product) => product.inventory - product.reserved <= 8).length);
  readonly revenue = computed(() => this.orders().filter((order) => order.payment === 'paid').reduce((sum, order) => sum + order.total, 0));
  readonly loading = signal(this.auth.isConfigured);

  constructor() {
    if (this.auth.isConfigured) void this.loadFromSupabase();
  }

  private async loadFromSupabase() {
    try {
      const [productsResult, ordersResult, profilesResult, discountsResult, activityResult] = await Promise.all([
        this.auth.client.from('products').select('id,name,slug,description,status,seo_title,seo_description,updated_at,categories(id,name),product_images(url,position),product_variants(id,name,sku,price,compare_at_price,cost,color,size,inventory(available,reserved,incoming))').order('updated_at', { ascending: false }),
        this.auth.client.from('orders').select('id,order_number,user_id,customer_name,customer_email,created_at,status,payment_status,fulfillment_status,total,shipping_address,order_items(image_url,quantity)').order('created_at', { ascending: false }),
        this.auth.client.from('profiles').select('id,full_name,email,created_at').order('created_at', { ascending: false }),
        this.auth.client.from('discounts').select('id,code,type,value,minimum_purchase,usage_count,usage_limit,starts_at,ends_at,active').order('created_at', { ascending: false }),
        this.auth.client.from('admin_activity').select('id,action,entity_type,created_at').order('created_at', { ascending: false }).limit(20),
      ]);

      if (productsResult.error) throw productsResult.error;
      this.products.set((productsResult.data as unknown as ProductDbRow[]).map((row) => this.mapProduct(row)));

      if (!ordersResult.error) {
        this.orders.set((ordersResult.data as unknown as OrderDbRow[]).map((row) => ({
          id: row.id, number: row.order_number, customerId: row.user_id, customer: row.customer_name, email: row.customer_email,
          date: row.created_at, status: row.status, payment: row.payment_status, fulfillment: row.fulfillment_status.replace('_', ' '),
          items: row.order_items.reduce((sum, item) => sum + item.quantity, 0), total: Number(row.total),
          imageUrls: row.order_items.map((item) => item.image_url).filter((url): url is string => Boolean(url)),
          address: Object.values(row.shipping_address).filter(Boolean).join(', '),
        })));
      }

      if (!profilesResult.error) {
        const orders = this.orders();
        this.customers.set((profilesResult.data as unknown as ProfileDbRow[])
          .filter((profile) => profile.id !== this.auth.user()?.id)
          .map((profile) => {
            const ownedOrders = orders.filter((order) => order.customerId === profile.id);
            const totalSpent = ownedOrders.reduce((sum, order) => sum + order.total, 0);
            return {
              id: profile.id, name: profile.full_name, email: profile.email, orders: ownedOrders.length, totalSpent,
              averageOrder: ownedOrders.length ? totalSpent / ownedOrders.length : 0, lastOrder: ownedOrders[0]?.date ?? profile.created_at,
              joined: profile.created_at, city: ownedOrders[0]?.address.split(',').slice(-3, -1).join(',').trim() || '—', notes: '',
            };
          }));
      }

      if (!discountsResult.error) {
        this.discounts.set((discountsResult.data as unknown as DiscountDbRow[]).map((row) => ({
          id: row.id, code: row.code, type: row.type, value: Number(row.value), minimum: Number(row.minimum_purchase ?? 0),
          usage: row.usage_count, limit: row.usage_limit ?? undefined, startsAt: row.starts_at, endsAt: row.ends_at ?? undefined, active: row.active,
        })));
      }

      if (!activityResult.error) {
        this.activity.set((activityResult.data as unknown as ActivityDbRow[]).map((row) => ({
          id: row.id, text: row.action,
          kind: (['order', 'inventory', 'customer', 'product', 'discount'].includes(row.entity_type) ? row.entity_type : 'product') as ActivityItem['kind'],
          date: row.created_at,
        })));
      }
    } finally {
      this.loading.set(false);
    }
  }

  private mapProduct(row: ProductDbRow): AdminProduct {
    const variant = row.product_variants[0];
    const stock = Array.isArray(variant?.inventory) ? variant.inventory[0] : variant?.inventory;
    return {
      id: row.id, name: row.name, slug: row.slug, description: row.description, category: row.categories?.name ?? 'Uncategorized',
      categoryId: row.categories?.id ?? '', imageUrl: [...row.product_images].sort((a, b) => a.position - b.position)[0]?.url ?? '',
      price: Number(variant?.price ?? 0), comparePrice: variant?.compare_at_price ? Number(variant.compare_at_price) : undefined,
      cost: Number(variant?.cost ?? 0), sku: variant?.sku ?? '', inventory: stock?.available ?? 0, reserved: stock?.reserved ?? 0,
      incoming: stock?.incoming ?? 0, status: row.status, updatedAt: row.updated_at,
      variants: row.product_variants.map((item) => {
        const itemStock = Array.isArray(item.inventory) ? item.inventory[0] : item.inventory;
        return { id: item.id, name: item.name, sku: item.sku, price: Number(item.price), inventory: itemStock?.available ?? 0, color: item.color ?? undefined, size: item.size ?? undefined };
      }),
      seoTitle: row.seo_title ?? '', seoDescription: row.seo_description ?? '',
    };
  }

  product(id: string) { return this.products().find((item) => item.id === id); }
  order(id: string) { return this.orders().find((item) => item.id === id); }
  customer(id: string) { return this.customers().find((item) => item.id === id); }

  async saveProduct(value: AdminProduct) {
    if (this.auth.isConfigured) {
      const payload = { id: value.id || undefined, name: value.name, slug: value.slug, description: value.description, category_id: value.categoryId || null, status: value.status, seo_title: value.seoTitle, seo_description: value.seoDescription };
      const { data, error } = await this.auth.client.from('products').upsert(payload).select('id').single();
      if (error) throw error;
      const variant = value.variants[0];
      const { data: variantData, error: variantError } = await this.auth.client.from('product_variants').upsert({ id: variant?.id || undefined, product_id: data.id, name: variant?.name ?? 'Default', sku: value.sku, price: value.price, compare_at_price: value.comparePrice, cost: value.cost }).select('id').single();
      if (variantError) throw variantError;
      const { error: inventoryError } = await this.auth.client.from('inventory').upsert({ variant_id: variantData.id, available: value.inventory, reserved: value.reserved, incoming: value.incoming });
      if (inventoryError) throw inventoryError;
      if (value.imageUrl) {
        const { error: imageError } = await this.auth.client.from('product_images').upsert({ product_id: data.id, url: value.imageUrl, alt_text: value.name, position: 0 }, { onConflict: 'product_id,position' });
        if (imageError) throw imageError;
      }
      value = { ...value, id: data.id, variants: value.variants.map((item, index) => index === 0 ? { ...item, id: variantData.id } : item) };
    }
    const next = { ...value, id: value.id || crypto.randomUUID(), updatedAt: new Date().toISOString() };
    this.products.update((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [next, ...items]);
    this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Product “${next.name}” was ${value.id ? 'updated' : 'created'}`, kind: 'product', date: new Date().toISOString() }, ...items]);
    return next;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    if (this.auth.isConfigured) {
      const { error } = await this.auth.client.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    }
    this.orders.update((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    const order = this.order(id);
    if (order) this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Order ${order.number} was marked ${status}`, kind: 'order', date: new Date().toISOString() }, ...items]);
  }

  async adjustInventory(productId: string, delta: number, reason: string, note: string) {
    const product = this.product(productId);
    if (!product) throw new Error('Product not found');
    if (product.inventory + delta < 0) throw new Error('Inventory cannot be negative.');
    if (this.auth.isConfigured) {
      const { error } = await this.auth.client.rpc('adjust_inventory', { p_variant_id: product.variants[0].id, p_quantity_delta: delta, p_reason: reason, p_note: note });
      if (error) throw error;
    }
    this.products.update((items) => items.map((item) => item.id === productId ? { ...item, inventory: item.inventory + delta, updatedAt: new Date().toISOString() } : item));
    this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Inventory for ${product.name} ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`, kind: 'inventory', date: new Date().toISOString() }, ...items]);
  }

  async saveDiscount(value: AdminDiscount) {
    if (this.auth.isConfigured) {
      const { error } = await this.auth.client.from('discounts').upsert({ id: value.id || undefined, code: value.code, type: value.type, value: value.value, minimum_purchase: value.minimum, usage_limit: value.limit, starts_at: value.startsAt, ends_at: value.endsAt, active: value.active });
      if (error) throw error;
    }
    const next = { ...value, id: value.id || crypto.randomUUID() };
    this.discounts.update((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [next, ...items]);
    this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Discount ${next.code} was saved`, kind: 'discount', date: new Date().toISOString() }, ...items]);
  }
}
