import { ArrowRight, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@nova/shared-utils';
import { QuantityControl } from '@/components/QuantityControl';
import { getCartSubtotal, useCommerceStore } from '@/stores/commerce-store';

export function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCommerceStore();
  const subtotal = getCartSubtotal(cartItems);
  const freeShippingGap = Math.max(0, 100 - subtotal);
  if (!cartItems.length) return <main className="cart-page cart-page--empty page-shell"><PackageOpen size={34} strokeWidth={1.3} /><p className="section-index">Your shopping bag</p><h1>Nothing here—yet.</h1><p>Find something useful, beautiful, or both.</p><Link to="/shop" className="button-link button-link--dark">Explore the collection <ArrowRight size={17} /></Link></main>;
  return (
    <main className="cart-page page-shell"><div className="cart-page__heading"><p className="section-index">Your selection</p><h1>Shopping bag.</h1><span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span></div><div className="cart-page__layout"><section className="cart-table">{cartItems.map((item) => <article className="cart-page-line" key={item.id}><img src={item.variant.imageUrl ?? item.product.images[0].url} alt={item.product.name} /><div><Link to={`/products/${item.product.slug}`}>{item.product.name}</Link><p>{item.variant.name}<br />{item.variant.sku}</p><button onClick={() => removeItem(item.id)}>Remove</button></div><QuantityControl value={item.quantity} max={item.variant.inventoryQuantity} onChange={(value) => updateQuantity(item.id, value)} /><strong>{formatCurrency(item.variant.price * item.quantity)}</strong></article>)}</section><aside className="order-summary"><h2>Order summary</h2>{freeShippingGap > 0 ? <div className="shipping-progress"><p>Add <strong>{formatCurrency(freeShippingGap)}</strong> for complimentary delivery.</p><div><span style={{ width: `${Math.min(100, subtotal)}%` }} /></div></div> : <p className="shipping-earned">You’ve unlocked complimentary delivery.</p>}<dl><div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div><div><dt>Standard delivery</dt><dd>{subtotal >= 100 ? 'Complimentary' : formatCurrency(8)}</dd></div><div className="order-summary__total"><dt>Estimated total</dt><dd>{formatCurrency(subtotal + (subtotal >= 100 ? 0 : 8))}</dd></div></dl><Link to="/checkout" className="checkout-link">Checkout securely <ArrowRight size={18} /></Link><p>Taxes calculated at checkout. Demo payment only.</p></aside></div></main>
  );
}
