import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCommerceStore } from '@/stores/commerce-store';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { label: 'New', to: '/shop?sort=newest' },
  { label: 'Shop', to: '/shop' },
  { label: 'Carry', to: '/shop?category=carry' },
  { label: 'Desk', to: '/shop?category=desk' },
  { label: 'Travel', to: '/shop?category=travel' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartItems, setCartOpen, setSearchOpen } = useCommerceStore();
  const { user } = useAuth();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="announcement">
        <span>Complimentary delivery on orders over $100</span>
        <Link to="/shop">Explore the collection <span aria-hidden>↗</span></Link>
      </div>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="site-header__inner">
          <button className="icon-button site-header__menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <Link to="/" className="wordmark" aria-label="Nova Supply home">NOVA<span>SUPPLY</span></Link>
          <nav className="site-nav" aria-label="Main navigation">
            {nav.map((item) => <NavLink key={item.label} to={item.to}>{item.label}</NavLink>)}
          </nav>
          <div className="site-header__actions">
            <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={20} /></button>
            <Link to={user ? '/account' : '/login'} className="icon-button hide-mobile" aria-label={user ? 'Account' : 'Sign in'}><UserRound size={20} /></Link>
            <button className="icon-button bag-button" aria-label={`Shopping bag with ${cartCount} items`} onClick={() => setCartOpen(true)}><ShoppingBag size={20} /><span>{cartCount}</span></button>
          </div>
        </div>
      </header>
      <div className={`mobile-nav ${mobileOpen ? 'mobile-nav--open' : ''}`} aria-hidden={!mobileOpen}>
        <button className="icon-button mobile-nav__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={22} /></button>
        <p className="wordmark">NOVA<span>SUPPLY</span></p>
        <nav>
          {nav.map((item, index) => <NavLink key={item.label} to={item.to} onClick={() => setMobileOpen(false)}><span>0{index + 1}</span>{item.label}</NavLink>)}
          <NavLink to="/account" onClick={() => setMobileOpen(false)}><span>06</span>Account</NavLink>
        </nav>
        <p className="mobile-nav__footer">Quietly capable objects for everyday motion.</p>
      </div>
    </>
  );
}
