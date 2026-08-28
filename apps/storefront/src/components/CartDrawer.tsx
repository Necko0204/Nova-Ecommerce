import { formatCurrency } from '@nova/shared-utils';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCartSubtotal, useCommerceStore } from '@/stores/commerce-store';
import { QuantityControl } from '@/components/QuantityControl';

export function CartDrawer() {
  const { cartItems, cartOpen, setCartOpen, updateQuantity, removeItem } = useCommerceStore();
  const subtotal = getCartSubtotal(cartItems);
  return (
    <>
      <button className={`drawer-backdrop ${cartOpen ? 'drawer-backdrop--open' : ''}`} aria-label="Close cart" onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? 'cart-drawer--open' : ''}`} aria-hidden={!cartOpen} aria-label="Shopping bag">
        <header><div><p className="eyebrow">Your selection</p><h2>Shopping bag <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={21} /></button></header>
        {cartItems.length === 0 ? (
          <div className="cart-empty"><ShoppingBag size={28} strokeWidth={1.4} /><h3>Your bag is waiting.</h3><p>Explore considered objects for work, weekends, and every day.</p><Link to="/shop" onClick={() => setCartOpen(false)} className="button-link button-link--dark">Start exploring <ArrowRight size={17} /></Link></div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cartItems.map((item) => <article className="cart-line" key={item.id}><img src={item.variant.imageUrl ?? item.product.images[0].url} alt={item.product.name} /><div className="cart-line__info"><div><Link to={`/products/${item.product.slug}`} onClick={() => setCartOpen(false)}>{item.product.name}</Link><p>{item.variant.name} · {item.variant.sku}</p></div><div className="cart-line__actions"><QuantityControl value={item.quantity} max={item.variant.inventoryQuantity} onChange={(value) => updateQuantity(item.id, value)} /><button onClick={() => removeItem(item.id)}>Remove</button></div></div><strong>{formatCurrency(item.variant.price * item.quantity)}</strong></article>)}
            </div>
            <div className="cart-drawer__summary"><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><p>Delivery and taxes are calculated at checkout.</p><Link className="checkout-link" to="/checkout" onClick={() => setCartOpen(false)}>Continue to checkout <ArrowRight size={18} /></Link><Link className="view-bag-link" to="/cart" onClick={() => setCartOpen(false)}>View shopping bag</Link></div>
          </>
        )}
      </aside>
    </>
  );
}
