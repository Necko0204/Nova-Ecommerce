import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { CartDrawer } from '@/components/CartDrawer';
import { SearchOverlay } from '@/components/SearchOverlay';

const ShopPage = lazy(() => import('@/pages/ShopPage').then((module) => ({ default: module.ShopPage })));
const ProductPage = lazy(() => import('@/pages/ProductPage').then((module) => ({ default: module.ProductPage })));
const CartPage = lazy(() => import('@/pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const LoginPage = lazy(() => import('@/pages/AuthPages').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/AuthPages').then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/AuthPages').then((module) => ({ default: module.ForgotPasswordPage })));
const AccountModule = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.ProtectedRoute })));
const AccountLayout = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.AccountLayout })));
const AccountOverview = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.AccountOverview })));
const OrdersPage = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.OrdersPage })));
const OrderDetailPage = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.OrderDetailPage })));
const WishlistPage = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.WishlistPage })));
const AddressesPage = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.AddressesPage })));
const ProfilePage = lazy(() => import('@/pages/AccountPage').then((module) => ({ default: module.ProfilePage })));
const InfoPage = lazy(() => import('@/pages/InfoPage').then((module) => ({ default: module.InfoPage })));
const NotFoundPage = lazy(() => import('@/pages/InfoPage').then((module) => ({ default: module.NotFoundPage })));

export default function App() {
  const { pathname } = useLocation();
  const checkout = pathname === '/checkout';
  return (
    <>
      {!checkout && <Header />}
      <Suspense fallback={<div className="route-loader"><span /></div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<AccountModule />}>
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<AccountOverview />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          {['about','journal','shipping','contact','faq','care','materials','privacy','terms'].map((path) => <Route key={path} path={`/${path}`} element={<InfoPage />} />)}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {!checkout && <><Footer /><CartDrawer /><SearchOverlay /></>}
    </>
  );
}
