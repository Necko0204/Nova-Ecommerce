export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'returned';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  color?: string;
  colorHex?: string;
  size?: string;
  inventoryQuantity: number;
  reservedQuantity?: number;
  incomingQuantity?: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  eyebrow?: string;
  description: string;
  details?: string[];
  specifications?: Record<string, string>;
  category: Category;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  rating: number;
  reviewCount: number;
  status: ProductStatus;
  featured: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  discountCode?: string;
  subtotal: number;
  discountTotal: number;
  total: number;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
}

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minimumPurchase?: number;
  usageLimit?: number;
  usageCount: number;
  startsAt: string;
  endsAt?: string;
  active: boolean;
}

export interface Inventory {
  variantId: string;
  available: number;
  reserved: number;
  incoming: number;
  lowStockThreshold: number;
}

export interface DashboardMetrics {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customers: number;
  conversionRate: number;
  lowStockCount: number;
}
