import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { commerceProvider } from '@/repositories/commerce';
import { useCommerceStore } from '@/stores/commerce-store';

export function CommerceSync() {
  const { user } = useAuth();
  const { cartItems, wishlistIds, setCartItems, setWishlistIds } = useCommerceStore();
  const initializedUser = useRef<string | undefined>(undefined);
  const [readyUser, setReadyUser] = useState<string>();

  useEffect(() => {
    if (!user) {
      initializedUser.current = undefined;
      setReadyUser(undefined);
      return;
    }
    if (!isSupabaseConfigured || initializedUser.current === user.id) return;
    initializedUser.current = user.id;
    void commerceProvider.mergeGuestCart(cartItems)
      .then(() => Promise.all([commerceProvider.getWishlist(), commerceProvider.getCart(), commerceProvider.listProducts()]))
      .then(([remoteIds, remoteCart, catalog]) => {
        const restoredCart = remoteCart.flatMap((saved) => {
          const product = catalog.find((item) => item.variants.some((variant) => variant.id === saved.variantId));
          const variant = product?.variants.find((item) => item.id === saved.variantId);
          return product && variant ? [{ id: variant.id, product, variant, quantity: Math.min(saved.quantity, variant.inventoryQuantity) }] : [];
        });
        const merged = [...new Set([...remoteIds, ...wishlistIds])];
        setCartItems(restoredCart);
        setWishlistIds(merged);
        return commerceProvider.replaceWishlist(merged).then(() => setReadyUser(user.id));
      })
      .catch(() => undefined);
  }, [cartItems, setCartItems, setWishlistIds, user, wishlistIds]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user || readyUser !== user.id) return;
    const timeout = window.setTimeout(() => void commerceProvider.replaceWishlist(wishlistIds).catch(() => undefined), 350);
    return () => window.clearTimeout(timeout);
  }, [readyUser, user, wishlistIds]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user || readyUser !== user.id) return;
    const timeout = window.setTimeout(() => void commerceProvider.syncCart(cartItems).catch(() => undefined), 400);
    return () => window.clearTimeout(timeout);
  }, [cartItems, readyUser, user]);
  return null;
}
