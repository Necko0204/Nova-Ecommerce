import type { CartItem, Product, ProductVariant } from '@nova/shared-types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CommerceState {
  cartItems: CartItem[];
  wishlistIds: string[];
  recentlyViewed: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  toggleWishlist: (productId: string) => void;
  setWishlistIds: (productIds: string[]) => void;
  trackViewed: (slug: string) => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set) => ({
      cartItems: [],
      wishlistIds: [],
      recentlyViewed: [],
      cartOpen: false,
      searchOpen: false,
      addItem: (product, variant, quantity = 1) => set((state) => {
        const existing = state.cartItems.find((item) => item.variant.id === variant.id);
        const cartItems = existing
          ? state.cartItems.map((item) => item.id === existing.id ? { ...item, quantity: Math.min(item.quantity + quantity, variant.inventoryQuantity) } : item)
          : [...state.cartItems, { id: crypto.randomUUID(), product, variant, quantity: Math.min(quantity, variant.inventoryQuantity) }];
        return { cartItems, cartOpen: true };
      }),
      updateQuantity: (itemId, quantity) => set((state) => ({
        cartItems: state.cartItems.map((item) => item.id === itemId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.variant.inventoryQuantity)) } : item),
      })),
      removeItem: (itemId) => set((state) => ({ cartItems: state.cartItems.filter((item) => item.id !== itemId) })),
      clearCart: () => set({ cartItems: [] }),
      setCartItems: (cartItems) => set({ cartItems }),
      toggleWishlist: (productId) => set((state) => ({ wishlistIds: state.wishlistIds.includes(productId) ? state.wishlistIds.filter((id) => id !== productId) : [...state.wishlistIds, productId] })),
      setWishlistIds: (wishlistIds) => set({ wishlistIds: [...new Set(wishlistIds)] }),
      trackViewed: (slug) => set((state) => ({ recentlyViewed: [slug, ...state.recentlyViewed.filter((item) => item !== slug)].slice(0, 8) })),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
    }),
    { name: 'nova-commerce-v2', partialize: ({ cartItems, wishlistIds, recentlyViewed }) => ({ cartItems, wishlistIds, recentlyViewed }) },
  ),
);

export const getCartSubtotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
