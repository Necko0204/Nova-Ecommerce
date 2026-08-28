import { ArrowUpRight, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__intro">
        <p className="wordmark wordmark--light">NOVA<span>SUPPLY</span></p>
        <h2>Make room for<br />what moves you.</h2>
      </div>
      <div className="site-footer__grid">
        <div><p className="footer-heading">Shop</p><Link to="/shop">All products</Link><Link to="/shop?sort=newest">New arrivals</Link><Link to="/shop?sort=best-selling">Best sellers</Link><Link to="/account/wishlist">Wishlist</Link></div>
        <div><p className="footer-heading">Help</p><Link to="/shipping">Delivery & returns</Link><Link to="/contact">Contact</Link><Link to="/faq">Common questions</Link><Link to="/care">Product care</Link></div>
        <div><p className="footer-heading">About</p><Link to="/journal">Journal</Link><Link to="/about">Our approach</Link><Link to="/materials">Materials</Link><a href="http://127.0.0.1:4200/admin">Merchant admin <ArrowUpRight size={13} /></a></div>
        <div className="site-footer__social"><p className="footer-heading">Follow along</p><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a><p>Manila · Copenhagen · Everywhere</p></div>
      </div>
      <div className="site-footer__bottom"><span>© 2026 Nova Supply Company</span><div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><span>USD / EN</span></div></div>
    </footer>
  );
}
