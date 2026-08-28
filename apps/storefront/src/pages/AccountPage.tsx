import { formatCurrency, formatDate } from '@nova/shared-utils';
import { ArrowRight, Heart, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { commerceProvider } from '@/repositories/commerce';
import { products } from '@/data/catalog';
import { useCommerceStore } from '@/stores/commerce-store';
import { ProductCard } from '@/components/ProductCard';

export function ProtectedRoute() { const auth = useAuth(); if (auth.loading) return <div className="state-box state-box--page">Loading your account…</div>; return auth.user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />; }

export function AccountLayout() {
  const { user, signOut } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there';
  return <main className="account-page page-shell"><header><p className="section-index">Your Nova account</p><h1>Good to see you, {firstName}.</h1></header><div className="account-layout"><aside><nav><NavLink end to="/account"><UserRound size={16} />Overview</NavLink><NavLink to="/account/orders"><Package size={16} />Orders</NavLink><NavLink to="/account/wishlist"><Heart size={16} />Saved items</NavLink><NavLink to="/account/addresses"><MapPin size={16} />Addresses</NavLink><NavLink to="/account/profile"><UserRound size={16} />Profile</NavLink></nav><button onClick={() => signOut()}><LogOut size={16} /> Sign out</button></aside><section className="account-content"><Outlet /></section></div></main>;
}

export function AccountOverview() {
  const { user } = useAuth(); const { wishlistIds } = useCommerceStore();
  return <div className="account-overview"><div className="account-card account-card--wide"><p className="eyebrow">Welcome home</p><h2>{user?.user_metadata?.full_name ?? 'Nova Customer'}</h2><p>{user?.email}</p><Link to="/account/profile">Edit profile <ArrowRight size={14} /></Link></div><Link to="/account/orders" className="account-card"><Package size={20} /><span>Orders</span><strong>View history</strong><ArrowRight size={15} /></Link><Link to="/account/wishlist" className="account-card"><Heart size={20} /><span>Saved items</span><strong>{wishlistIds.length} objects</strong><ArrowRight size={15} /></Link><Link to="/account/addresses" className="account-card"><MapPin size={20} /><span>Delivery</span><strong>Manage addresses</strong><ArrowRight size={15} /></Link></div>;
}

export function OrdersPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: () => commerceProvider.listMyOrders() });
  if (isLoading) return <div className="state-box">Loading orders…</div>;
  if (!data.length) return <div className="account-empty"><Package size={25} /><h2>No orders yet.</h2><p>Your order history will appear here after checkout.</p><Link to="/shop">Explore the collection</Link></div>;
  return <div><div className="account-section-heading"><div><p className="eyebrow">Order history</p><h2>Your orders</h2></div><span>{data.length} orders</span></div><div className="order-list">{data.map((order) => <Link to={`/account/orders/${order.id}`} key={order.id}><div><strong>{order.orderNumber}</strong><span>{formatDate(order.createdAt)}</span></div><div><span className={`status status--${order.status}`}>{order.status}</span><strong>{formatCurrency(order.total)}</strong><ArrowRight size={16} /></div></Link>)}</div></div>;
}

export function OrderDetailPage() { const { id } = useParams(); return <div className="account-empty"><Package size={25} /><p className="eyebrow">Order detail</p><h2>{id}</h2><p>Live orders show item, fulfillment, address, and payment details here.</p><Link to="/account/orders">Back to orders</Link></div>; }

export function WishlistPage() {
  const { wishlistIds } = useCommerceStore();
  const { data: catalog = products } = useQuery({ queryKey: ['products', 'wishlist'], queryFn: () => commerceProvider.listProducts() });
  const saved = catalog.filter((product) => wishlistIds.includes(product.id));
  return <div><div className="account-section-heading"><div><p className="eyebrow">Saved for later</p><h2>Your wishlist</h2></div><span>{saved.length} objects</span></div>{saved.length ? <div className="product-grid product-grid--account">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="account-empty"><Heart size={25} /><h2>Nothing saved yet.</h2><p>Use the heart on any object to keep it close.</p><Link to="/shop">Find something to save</Link></div>}</div>;
}

export function AddressesPage() { return <div><div className="account-section-heading"><div><p className="eyebrow">Delivery details</p><h2>Addresses</h2></div><button>Add address</button></div><div className="address-card"><span>Default</span><strong>Nova Customer</strong><p>125 Meridian Street<br />Portland, OR 97205<br />United States</p><div><button>Edit</button><button>Remove</button></div></div></div>; }
export function ProfilePage() { const { user } = useAuth(); return <div><div className="account-section-heading"><div><p className="eyebrow">Personal information</p><h2>Your profile</h2></div></div><form className="profile-form" onSubmit={(event) => event.preventDefault()}><label>Full name<input defaultValue={user?.user_metadata?.full_name ?? 'Nova Customer'} /></label><label>Email address<input type="email" defaultValue={user?.email ?? ''} /></label><label>Phone<input type="tel" placeholder="Add a phone number" /></label><label className="profile-check"><input type="checkbox" /> Send me occasional product notes</label><button type="submit">Save changes</button></form></div>; }
