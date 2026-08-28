import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, emailSchema } from '@nova/validation';
import { formatCurrency } from '@nova/shared-utils';
import { ArrowLeft, Check, CreditCard, LockKeyhole, PackageCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { commerceProvider } from '@/repositories/commerce';
import { getCartSubtotal, useCommerceStore } from '@/stores/commerce-store';
import { useAuth } from '@/context/AuthContext';

const checkoutSchema = addressSchema.extend({
  email: emailSchema,
  shippingMethod: z.enum(['standard', 'express']),
  discountCode: z.string().trim().max(32).optional(),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { cartItems, clearCart } = useCommerceStore();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState('');
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; total: number } | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: user?.email ?? '', country: 'United States', shippingMethod: 'standard' },
  });
  const subtotal = getCartSubtotal(cartItems);
  const shippingMethod = watch('shippingMethod');
  const shipping = shippingMethod === 'express' ? 18 : subtotal >= 100 ? 0 : 8;
  const tax = subtotal * .08;
  if (!cartItems.length && !confirmation) return <Navigate to="/cart" replace />;

  const submit = async (values: CheckoutForm) => {
    setPlacing(true); setServerError('');
    try {
      const result = await commerceProvider.createOrder({
        customerEmail: values.email,
        customerName: `${values.firstName} ${values.lastName}`,
        shippingAddress: { firstName: values.firstName, lastName: values.lastName, company: values.company, address1: values.address1, address2: values.address2, city: values.city, province: values.province, postalCode: values.postalCode, country: values.country, phone: values.phone },
        shippingMethod: values.shippingMethod,
        shippingTotal: shipping,
        discountCode: values.discountCode,
        items: cartItems.map((item) => ({ variantId: item.variant.id, quantity: item.quantity })),
      });
      setConfirmation({ orderNumber: result.orderNumber, total: result.total });
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) { setServerError(error instanceof Error ? error.message : 'Checkout could not be completed.'); }
    finally { setPlacing(false); }
  };

  if (confirmation) return <main className="confirmation page-shell"><div className="confirmation__mark"><Check size={32} /></div><p className="section-index">Order confirmed</p><h1>Thank you.<br />It’s in motion.</h1><p>Order <strong>{confirmation.orderNumber}</strong> has been created for <strong>{formatCurrency(confirmation.total)}</strong>. A confirmation would be sent by email in production.</p><div className="confirmation__actions"><Link to="/account/orders">View your order</Link><Link to="/shop">Continue shopping</Link></div><div className="demo-notice"><ShieldCheck size={18} /><span><strong>Development checkout</strong>No real payment was processed.</span></div></main>;

  return (
    <main className="checkout-page"><header className="checkout-header page-shell"><Link to="/" className="wordmark">NOVA<span>SUPPLY</span></Link><Link to="/cart"><ArrowLeft size={15} /> Return to bag</Link><span><LockKeyhole size={14} /> Secure demo checkout</span></header><form onSubmit={handleSubmit(submit)} className="checkout-layout page-shell"><section className="checkout-form"><div className="checkout-step"><div className="checkout-step__title"><span>01</span><div><h2>Contact</h2><p>Where should we send your order update?</p></div></div><div className="form-field form-field--full"><label htmlFor="email">Email address</label><input id="email" type="email" {...register('email')} aria-invalid={Boolean(errors.email)} />{errors.email && <small>{errors.email.message}</small>}</div></div>
      <div className="checkout-step"><div className="checkout-step__title"><span>02</span><div><h2>Delivery address</h2><p>We’ll use this for your demo order.</p></div></div><div className="form-grid"><Field label="First name" name="firstName" register={register} error={errors.firstName?.message} /><Field label="Last name" name="lastName" register={register} error={errors.lastName?.message} /><Field label="Company (optional)" name="company" register={register} /><Field label="Phone (optional)" name="phone" register={register} /><Field full label="Address" name="address1" register={register} error={errors.address1?.message} /><Field full label="Apartment, suite, etc. (optional)" name="address2" register={register} /><Field label="City" name="city" register={register} error={errors.city?.message} /><Field label="State / province" name="province" register={register} error={errors.province?.message} /><Field label="Postal code" name="postalCode" register={register} error={errors.postalCode?.message} /><Field label="Country" name="country" register={register} error={errors.country?.message} /></div></div>
      <div className="checkout-step"><div className="checkout-step__title"><span>03</span><div><h2>Delivery method</h2><p>Choose the pace that works for you.</p></div></div><div className="shipping-options"><label><input type="radio" value="standard" {...register('shippingMethod')} /><span><PackageCheck size={18} /><strong>Standard delivery<small>3–5 business days</small></strong></span><b>{subtotal >= 100 ? 'Complimentary' : '$8'}</b></label><label><input type="radio" value="express" {...register('shippingMethod')} /><span><PackageCheck size={18} /><strong>Express delivery<small>1–2 business days</small></strong></span><b>$18</b></label></div></div>
      <div className="checkout-step"><div className="checkout-step__title"><span>04</span><div><h2>Payment</h2><p>This portfolio build never charges a real card.</p></div></div><div className="demo-payment"><CreditCard size={20} /><div><strong>Development payment</strong><span>Approved automatically in local mode</span></div><Check size={17} /></div><div className="form-field form-field--full"><label htmlFor="discount">Discount code (optional)</label><input id="discount" placeholder="WELCOME10" {...register('discountCode')} /></div></div>
      {serverError && <div className="checkout-error" role="alert">{serverError}</div>}<button className="place-order" disabled={placing}>{placing ? 'Creating your order…' : `Place demo order · ${formatCurrency(subtotal + shipping + tax)}`}<LockKeyhole size={15} /></button></section>
      <aside className="checkout-summary"><p className="eyebrow">Your order</p><div className="checkout-summary__items">{cartItems.map((item) => <article key={item.id}><div><img src={item.variant.imageUrl ?? item.product.images[0].url} alt="" /><span>{item.quantity}</span></div><p><strong>{item.product.name}</strong><span>{item.variant.name}</span></p><b>{formatCurrency(item.variant.price * item.quantity)}</b></article>)}</div><div className="checkout-totals"><div><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></div><div><span>Delivery</span><b>{shipping === 0 ? 'Complimentary' : formatCurrency(shipping)}</b></div><div><span>Estimated tax</span><b>{formatCurrency(tax)}</b></div><div><span>Total</span><b>{formatCurrency(subtotal + shipping + tax)} <small>USD</small></b></div></div><div className="checkout-assurance"><ShieldCheck size={17} /><p>Inventory and discount codes are validated in the database transaction before an order is created.</p></div></aside></form></main>
  );
}

function Field({ label, name, register, error, full = false }: { label: string; name: keyof CheckoutForm; register: ReturnType<typeof useForm<CheckoutForm>>['register']; error?: string; full?: boolean }) {
  return <div className={`form-field ${full ? 'form-field--full' : ''}`}><label htmlFor={name}>{label}</label><input id={name} {...register(name)} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</div>;
}
