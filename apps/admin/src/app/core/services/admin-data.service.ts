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

const names = ['Nova Carry Backpack','Aero Wireless Headphones','Form Mechanical Keyboard','Orbit Desk Lamp','Arc Crossbody','Mono Travel Bottle','Frame Sunglasses','Halo Portable Speaker','Studio Notebook','Core Everyday Tee','Motion Technical Jacket','Terra Weekender','Signal Earbuds','Line Cable Organizer','Field Cap','Fold Laptop Stand','Drift Travel Pouch','Tempo Analog Watch','Beam Monitor Light','Pocket Card Wallet','Route Sling','Quiet Desktop Speakers','Passage Packing Cubes','Studio Tote','Axis Tech Case'];
const categories = ['Carry','Audio','Desk','Desk','Carry','Travel','Wear','Audio','Desk','Wear','Wear','Travel','Audio','Desk','Wear','Desk','Travel','Wear','Desk','Carry','Carry','Audio','Travel','Carry','Carry'];
const prices = [148,219,164,129,78,42,112,139,28,48,238,188,149,34,44,84,56,196,96,52,88,184,64,96,68];
const images = ['photo-1553062407-98eeb64c6a62','photo-1505740420928-5e560c06d30e','photo-1587829741301-dc798b83add3','photo-1507473885765-e6ed057f782c','photo-1566150905458-1bf1fc113f0d','photo-1602143407151-7111542de6e8','photo-1511499767150-a48a237f0083','photo-1608043152269-423dbba4e7e1','photo-1531346878377-a5be20888e57','photo-1521572163474-6864f9cf17ab','photo-1551028719-00167b16eac5','photo-1553062407-98eeb64c6a62','photo-1606220945770-b5b6c2c55bf1','photo-1615525137689-198778541af6','photo-1588850561407-ed78c282e89b','photo-1527443224154-c4a3942d3acf','photo-1553531384-cc64ac80f931','photo-1524805444758-089113d48a6d','photo-1547394765-185e1e68f34e','photo-1627123424574-724758594e93','photo-1622560480605-d83c853bc5c3','photo-1545454675-3531b543be5d','photo-1436491865332-7a61a109cc05','photo-1590874103328-eac38a683ce7','photo-1553531384-cc64ac80f931'];
const slugs = names.map((name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
const customerNames = ['Olivia Chen','Mateo Santos','Sofia Kim','Liam Patel','Amara Okafor','Noah Williams','Isla Thompson','Ethan Lim','Ava Martinez','Lucas Meyer','Mia Andersson','Theo Johnson','Yuna Park','Elijah Brooks','Freya Nielsen','Kai Mendoza','Nora Haddad','Arthur Davies','Lena Fischer','Gabriel Silva','Zoe Robinson','Hugo Laurent','Maeve Murphy','Adrian Cruz','Leila Rahman','Owen Clarke','Camille Dubois','Jasper Tan','Priya Nair','Caleb Wilson'];

const demoProducts: AdminProduct[] = names.map((name, index) => ({ id: `product-${index + 1}`, name, slug: slugs[index], description: `A considered ${categories[index].toLowerCase()} essential designed for useful, beautiful everyday rituals.`, category: categories[index], categoryId: `category-${categories[index].toLowerCase()}`, imageUrl: `https://images.unsplash.com/${images[index]}?auto=format&fit=crop&w=500&q=82`, price: prices[index], comparePrice: index % 6 === 1 ? prices[index] + 30 : undefined, cost: Math.round(prices[index] * .42), sku: `NV-${String(index + 1).padStart(3, '0')}-${categories[index].slice(0,3).toUpperCase()}`, inventory: 4 + (index * 7) % 68, reserved: index % 4, incoming: index % 5 === 0 ? 24 : 0, status: index === 23 ? 'draft' : index === 24 ? 'archived' : 'active', updatedAt: new Date(Date.now() - index * 7_200_000).toISOString(), variants: [{ id: `variant-${index + 1}`, name: ['Graphite','Sand','Bone','Chalk','Olive'][index % 5], sku: `NV-${String(index + 1).padStart(3, '0')}-STD`, price: prices[index], inventory: 4 + (index * 7) % 68 }], seoTitle: `${name} | Nova Supply`, seoDescription: `Discover ${name}, thoughtfully designed by Nova Supply.` }));
const demoCustomers: AdminCustomer[] = customerNames.map((name, index) => { const orders = 1 + (index * 3) % 9; const total = 84 + (index * 137) % 1480; return { id: `customer-${index + 1}`, name, email: `${name.toLowerCase().replace(' ', '.')}@example.local`, orders, totalSpent: total, averageOrder: Math.round(total / orders), lastOrder: new Date(Date.now() - index * 86_400_000 * 2).toISOString(), joined: new Date(Date.now() - (390 - index * 12) * 86_400_000).toISOString(), city: ['Brooklyn, NY','Portland, OR','Austin, TX','Seattle, WA','San Diego, CA'][index % 5], notes: index % 4 === 0 ? 'Prefers email updates. Strong repeat customer.' : '' }; });
const demoOrders: AdminOrder[] = Array.from({ length: 40 }, (_, index) => { const customer = demoCustomers[index % demoCustomers.length]; const state: OrderStatus = index < 4 ? 'processing' : index < 9 ? 'shipped' : index % 13 === 0 ? 'cancelled' : 'delivered'; return { id: `order-${40-index}`, number: `NV-${1052-index}`, customerId: customer.id, customer: customer.name, email: customer.email, date: new Date(Date.now() - index * 31_400_000).toISOString(), status: state, payment: state === 'cancelled' ? 'refunded' : 'paid', fulfillment: state === 'delivered' || state === 'shipped' ? 'Fulfilled' : 'Unfulfilled', items: 1 + index % 4, total: 92 + (index * 73) % 540, imageUrls: [demoProducts[index % 25].imageUrl, demoProducts[(index + 7) % 25].imageUrl], address: `${125 + index} Meridian Street, ${customer.city}` }; });

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly auth = inject(AuthService);
  readonly products = signal<AdminProduct[]>(this.restore('products', demoProducts));
  readonly orders = signal<AdminOrder[]>(demoOrders);
  readonly customers = signal<AdminCustomer[]>(demoCustomers);
  readonly discounts = signal<AdminDiscount[]>([
    { id: 'discount-1', code: 'WELCOME10', type: 'percentage', value: 10, minimum: 75, usage: 84, limit: 500, startsAt: '2026-02-01', endsAt: '2027-02-01', active: true },
    { id: 'discount-2', code: 'STUDIO20', type: 'fixed_amount', value: 20, minimum: 150, usage: 37, limit: 200, startsAt: '2026-06-01', endsAt: '2026-11-30', active: true },
    { id: 'discount-3', code: 'SHIPFREE', type: 'free_shipping', value: 0, minimum: 100, usage: 63, startsAt: '2026-04-15', active: true },
    { id: 'discount-4', code: 'FIELD15', type: 'percentage', value: 15, minimum: 120, usage: 100, limit: 100, startsAt: '2026-02-01', endsAt: '2026-07-31', active: false },
  ]);
  readonly activity = signal<ActivityItem[]>([
    { id: 'a1', text: 'Order NV-1052 was created', kind: 'order', date: new Date(Date.now()-720000).toISOString() },
    { id: 'a2', text: 'Inventory for Aero Wireless Headphones decreased', kind: 'inventory', date: new Date(Date.now()-2280000).toISOString() },
    { id: 'a3', text: 'Customer Olivia Chen registered', kind: 'customer', date: new Date(Date.now()-7200000).toISOString() },
    { id: 'a4', text: 'Order NV-1043 was shipped', kind: 'order', date: new Date(Date.now()-14400000).toISOString() },
    { id: 'a5', text: 'Product “Nova Carry” was updated', kind: 'product', date: new Date(Date.now()-86400000).toISOString() },
    { id: 'a6', text: 'Discount STUDIO20 was created', kind: 'discount', date: new Date(Date.now()-259200000).toISOString() },
  ]);
  readonly activeProducts = computed(() => this.products().filter((p) => p.status === 'active').length);
  readonly lowStock = computed(() => this.products().filter((p) => p.inventory - p.reserved <= 8).length);
  readonly revenue = computed(() => this.orders().filter((o) => o.payment === 'paid').reduce((sum, o) => sum + o.total, 0));
  readonly loading = signal(this.auth.isConfigured);

  constructor() { if (this.auth.isConfigured) void this.loadFromSupabase(); }

  private async loadFromSupabase() {
    try {
      const [productsResult, ordersResult, profilesResult, discountsResult, activityResult] = await Promise.all([
        this.auth.client.from('products').select('id,name,slug,description,status,seo_title,seo_description,updated_at,categories(id,name),product_images(url,position),product_variants(id,name,sku,price,compare_at_price,cost,color,size,inventory(available,reserved,incoming))').order('updated_at',{ascending:false}),
        this.auth.client.from('orders').select('id,order_number,user_id,customer_name,customer_email,created_at,status,payment_status,fulfillment_status,total,shipping_address,order_items(image_url,quantity)').order('created_at',{ascending:false}),
        this.auth.client.from('profiles').select('id,full_name,email,created_at').order('created_at',{ascending:false}),
        this.auth.client.from('discounts').select('id,code,type,value,minimum_purchase,usage_count,usage_limit,starts_at,ends_at,active').order('created_at',{ascending:false}),
        this.auth.client.from('admin_activity').select('id,action,entity_type,created_at').order('created_at',{ascending:false}).limit(20),
      ]);
      if (productsResult.error) throw productsResult.error;
      const mappedProducts=(productsResult.data as unknown as ProductDbRow[]).map((row):AdminProduct=>{
        const variant=row.product_variants[0];const stock=Array.isArray(variant?.inventory)?variant.inventory[0]:variant?.inventory;
        return{id:row.id,name:row.name,slug:row.slug,description:row.description,category:row.categories?.name??'Uncategorized',categoryId:row.categories?.id??'',imageUrl:[...row.product_images].sort((a,b)=>a.position-b.position)[0]?.url??'',price:Number(variant?.price??0),comparePrice:variant?.compare_at_price?Number(variant.compare_at_price):undefined,cost:Number(variant?.cost??0),sku:variant?.sku??'',inventory:stock?.available??0,reserved:stock?.reserved??0,incoming:stock?.incoming??0,status:row.status,updatedAt:row.updated_at,variants:row.product_variants.map((item)=>{const itemStock=Array.isArray(item.inventory)?item.inventory[0]:item.inventory;return{id:item.id,name:item.name,sku:item.sku,price:Number(item.price),inventory:itemStock?.available??0,color:item.color??undefined,size:item.size??undefined}}),seoTitle:row.seo_title??'',seoDescription:row.seo_description??''};
      });
      if(mappedProducts.length)this.products.set(mappedProducts);
      if(!ordersResult.error){const rows=ordersResult.data as unknown as OrderDbRow[];this.orders.set(rows.map((row)=>({id:row.id,number:row.order_number,customerId:row.user_id,customer:row.customer_name,email:row.customer_email,date:row.created_at,status:row.status,payment:row.payment_status,fulfillment:row.fulfillment_status.replace('_',' '),items:row.order_items.reduce((sum,item)=>sum+item.quantity,0),total:Number(row.total),imageUrls:row.order_items.map((item)=>item.image_url).filter((url):url is string=>Boolean(url)),address:Object.values(row.shipping_address).filter(Boolean).join(', ')})));}
      if(!profilesResult.error){const rows=profilesResult.data as unknown as ProfileDbRow[];const orderRows=this.orders();this.customers.set(rows.filter((row)=>row.id!==this.auth.user()?.id).map((row)=>{const owned=orderRows.filter((order)=>order.customerId===row.id);const total=owned.reduce((sum,order)=>sum+order.total,0);return{id:row.id,name:row.full_name,email:row.email,orders:owned.length,totalSpent:total,averageOrder:owned.length?total/owned.length:0,lastOrder:owned[0]?.date??row.created_at,joined:row.created_at,city:owned[0]?.address.split(',').slice(-3,-1).join(',').trim()||'—',notes:''}}));}
      if(!discountsResult.error){this.discounts.set((discountsResult.data as unknown as DiscountDbRow[]).map((row)=>({id:row.id,code:row.code,type:row.type,value:Number(row.value),minimum:Number(row.minimum_purchase??0),usage:row.usage_count,limit:row.usage_limit??undefined,startsAt:row.starts_at,endsAt:row.ends_at??undefined,active:row.active})));}
      if(!activityResult.error){this.activity.set((activityResult.data as unknown as ActivityDbRow[]).map((row)=>({id:row.id,text:row.action,kind:(['order','inventory','customer','product','discount'].includes(row.entity_type)?row.entity_type:'product') as ActivityItem['kind'],date:row.created_at})));}
    } finally { this.loading.set(false); }
  }

  private restore<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(`nova-admin-${key}`) ?? 'null') ?? fallback; } catch { return fallback; } }
  private persistProducts() { localStorage.setItem('nova-admin-products', JSON.stringify(this.products())); }
  product(id: string) { return this.products().find((item) => item.id === id); }
  order(id: string) { return this.orders().find((item) => item.id === id); }
  customer(id: string) { return this.customers().find((item) => item.id === id); }

  async saveProduct(value: AdminProduct) {
    if (this.auth.isConfigured) {
      const payload = { id: value.id.startsWith('product-') ? undefined : value.id, name: value.name, slug: value.slug, description: value.description, category_id: value.categoryId, status: value.status, seo_title: value.seoTitle, seo_description: value.seoDescription };
      const { data, error } = await this.auth.client.from('products').upsert(payload).select('id').single();
      if (error) throw error;
      const productId = data.id;
      const variant = value.variants[0];
      const { data:variantData,error: variantError } = await this.auth.client.from('product_variants').upsert({ id: variant?.id.startsWith('variant-') ? undefined : variant?.id, product_id: productId, name: variant?.name ?? 'Default', sku: value.sku, price: value.price, compare_at_price: value.comparePrice, cost: value.cost }).select('id').single();
      if (variantError) throw variantError;
      const {error:inventoryError}=await this.auth.client.from('inventory').upsert({variant_id:variantData.id,available:value.inventory,reserved:value.reserved,incoming:value.incoming});if(inventoryError)throw inventoryError;
      if(value.imageUrl){const {error:imageError}=await this.auth.client.from('product_images').upsert({product_id:productId,url:value.imageUrl,alt_text:value.name,position:0},{onConflict:'product_id,position'});if(imageError)throw imageError;}
      value={...value,id:productId,variants:value.variants.map((item,index)=>index===0?{...item,id:variantData.id}:item)};
    }
    const next = { ...value, id: value.id || crypto.randomUUID(), updatedAt: new Date().toISOString() };
    this.products.update((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [next, ...items]);
    this.persistProducts();
    this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Product “${next.name}” was ${value.id ? 'updated' : 'created'}`, kind: 'product', date: new Date().toISOString() }, ...items]);
    return next;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    if (this.auth.isConfigured) { const { error } = await this.auth.client.from('orders').update({ status }).eq('id', id); if (error) throw error; }
    this.orders.update((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    const order = this.order(id); if (order) this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Order ${order.number} was marked ${status}`, kind: 'order', date: new Date().toISOString() }, ...items]);
  }

  async adjustInventory(productId: string, delta: number, reason: string, note: string) {
    const product = this.product(productId); if (!product) throw new Error('Product not found');
    if (product.inventory + delta < 0) throw new Error('Inventory cannot be negative.');
    if (this.auth.isConfigured) { const { error } = await this.auth.client.rpc('adjust_inventory', { p_variant_id: product.variants[0].id, p_quantity_delta: delta, p_reason: reason, p_note: note }); if (error) throw error; }
    this.products.update((items) => items.map((item) => item.id === productId ? { ...item, inventory: item.inventory + delta, updatedAt: new Date().toISOString() } : item)); this.persistProducts();
    this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Inventory for ${product.name} ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`, kind: 'inventory', date: new Date().toISOString() }, ...items]);
  }

  async saveDiscount(value: AdminDiscount) {
    if (this.auth.isConfigured) { const { error } = await this.auth.client.from('discounts').upsert({ id: value.id.startsWith('discount-') ? undefined : value.id, code: value.code, type: value.type, value: value.value, minimum_purchase: value.minimum, usage_limit: value.limit, starts_at: value.startsAt, ends_at: value.endsAt, active: value.active }); if (error) throw error; }
    const next = { ...value, id: value.id || crypto.randomUUID() }; this.discounts.update((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [next, ...items]);
    this.activity.update((items) => [{ id: crypto.randomUUID(), text: `Discount ${next.code} was saved`, kind: 'discount', date: new Date().toISOString() }, ...items]);
  }
}
