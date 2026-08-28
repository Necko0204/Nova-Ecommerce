import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const content: Record<string, { eyebrow: string; title: string; body: string }> = {
  '/about': { eyebrow: 'Our approach', title: 'Useful things,\nbeautifully resolved.', body: 'Nova Supply is a fictional design studio exploring how considered objects can make everyday rituals calmer, clearer, and more enjoyable.' },
  '/journal': { eyebrow: 'Field notes', title: 'Stories from\nthe everyday.', body: 'Conversations about design, making, movement, and the useful objects that earn a lasting place in our lives.' },
  '/shipping': { eyebrow: 'Delivery & returns', title: 'Easy, from\nstart to finish.', body: 'Standard delivery takes 3–5 business days. Orders over $100 ship complimentary, and returns are accepted within 30 days.' },
  '/contact': { eyebrow: 'Human support', title: 'How can\nwe help?', body: 'The Nova care team is available Monday through Friday, 9:00–17:00. For this local portfolio project, email care@novasupply.local.' },
  '/faq': { eyebrow: 'Common questions', title: 'A few useful\nanswers.', body: 'Nova Supply is a local portfolio demonstration. Payments are simulated, products are fictional, and the complete stack runs against local Supabase.' },
  '/care': { eyebrow: 'Product care', title: 'Made to stay\nin motion.', body: 'Wipe surfaces gently, avoid prolonged moisture, and store objects thoughtfully. Every Nova product includes a two-year local demo warranty.' },
  '/materials': { eyebrow: 'Materials', title: 'Chosen with\nintention.', body: 'We prioritize durable, repairable, and lower-impact materials, documenting care and origin wherever practical.' },
  '/privacy': { eyebrow: 'Privacy', title: 'Your data,\nhandled carefully.', body: 'This local demonstration stores customer data in your local Supabase instance and does not send it to production services.' },
  '/terms': { eyebrow: 'Terms', title: 'A portfolio\ndemonstration.', body: 'Nova Supply is fictional. No real commerce, fulfillment, warranty, or payment relationship is created by using this local application.' },
};

export function InfoPage() {
  const { pathname } = useLocation();
  const item = content[pathname] ?? content['/about'];
  return <main className="info-page page-shell"><p className="section-index">{item.eyebrow}</p><h1>{item.title.split('\n').map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}</h1><p>{item.body}</p><Link to="/shop" className="text-link">Explore the collection <ArrowRight size={17} /></Link></main>;
}

export function NotFoundPage() { return <main className="info-page page-shell"><p className="section-index">404 · Out of orbit</p><h1>This page<br />moved on.</h1><p>The address may be incomplete, or the page may no longer exist.</p><Link to="/" className="text-link">Return home <ArrowRight size={17} /></Link></main>; }
