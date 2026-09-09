import { ArrowRight, MoveRight, RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories, products } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';
import { useQuery } from '@tanstack/react-query';
import { commerceProvider } from '@/repositories/commerce';

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } };

export function HomePage() {
  const { data: liveProducts } = useQuery({ queryKey: ['products', 'home'], queryFn: () => commerceProvider.listProducts({ sort: 'featured' }) });
  const catalogProducts = liveProducts?.length ? liveProducts : products;
  const heroProduct = catalogProducts[0] ?? products[0];
  const editorialProduct = catalogProducts[1] ?? products[1] ?? heroProduct;
  const heroImage = heroProduct?.images[0]?.url ?? '';
  const editorialImage = editorialProduct?.images[1]?.url ?? editorialProduct?.images[0]?.url ?? heroImage;
  const featured = catalogProducts.filter((product) => product.featured).slice(0, 4);
  const arrivals = catalogProducts.filter((product) => product.isNew).slice(0, 4);

  return (
    <main>
      <section className="hero">
        <div className="hero__media"><img src={heroImage} alt="Nova Carry Backpack prepared for a day in motion" /></div>
        <div className="hero__shade" />
        <div className="hero__content page-shell">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <p className="hero__kicker">Collection 02 · On the move</p>
            <h1>Objects for<br />everyday motion.</h1>
            <p className="hero__copy">Quietly capable essentials, made to move through work, weekends, and the spaces between.</p>
            <Link to="/shop" className="text-link text-link--light">Shop the collection <ArrowRight size={18} /></Link>
          </motion.div>
          <div className="hero__feature"><span>01</span><div><p>Nova Carry</p><p>Our everyday system, refined.</p></div><Link to="/products/nova-carry-backpack" aria-label="View Nova Carry Backpack"><ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="intro-section page-shell">
        <motion.div {...reveal} className="intro-section__heading"><p className="section-index">01 — Our point of view</p><h2>Less, but better.<br />Made to be lived with.</h2></motion.div>
        <motion.div {...reveal} className="intro-section__copy"><p>We design useful objects with a quiet confidence—considered in proportion, honest in material, and built to earn their place in your day.</p><Link to="/about" className="text-link">Inside Nova Supply <ArrowRight size={17} /></Link></motion.div>
      </section>

      <section className="collection-section page-shell">
        <div className="section-heading"><div><p className="section-index">02 — Shop by ritual</p><h2>Find your everyday.</h2></div><Link to="/shop" className="text-link hide-mobile">View all categories <ArrowRight size={17} /></Link></div>
        <div className="category-grid">
          {categories.slice(0, 3).map((item, index) => (
            <motion.article {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }} key={item.id} className={`category-tile category-tile--${index + 1}`}>
              <Link to={`/shop?category=${item.slug}`}>
                <img src={item.imageUrl} alt="" />
                <div className="category-tile__overlay" />
                <div className="category-tile__content"><span>0{index + 1}</span><div><h3>{item.name}</h3><p>{item.description}</p></div><ArrowRight size={19} /></div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="product-section page-shell">
        <div className="section-heading"><div><p className="section-index">03 — Current favorites</p><h2>Well-chosen essentials.</h2></div><Link to="/shop?sort=best-selling" className="text-link hide-mobile">Shop best sellers <ArrowRight size={17} /></Link></div>
        <div className="product-grid">{featured.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}</div>
      </section>

      <section className="editorial page-shell">
        <motion.div {...reveal} className="editorial__image"><img src={editorialImage} alt="Aero Wireless Headphones in a quiet listening space" /><span className="editorial__label">Edition N° 04</span></motion.div>
        <motion.div {...reveal} className="editorial__content"><p className="section-index">A quieter kind of focus</p><h2>Make space<br />to hear more.</h2><p>Aero creates the rarest luxury: room to think. Adaptive silence, precise sound, and a form made comfortable for the long listen.</p><Link to="/products/aero-wireless-headphones" className="button-link button-link--dark">Discover Aero <MoveRight size={18} /></Link><div className="editorial__note"><span>32 hr</span><p>Continuous listening<br />with fast charge</p></div></motion.div>
      </section>

      <section className="product-section product-section--arrivals page-shell">
        <div className="section-heading"><div><p className="section-index">04 — Just landed</p><h2>New, thoughtfully.</h2></div><Link to="/shop?sort=newest" className="text-link hide-mobile">View new arrivals <ArrowRight size={17} /></Link></div>
        <div className="product-grid">{arrivals.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="manifesto">
        <div className="manifesto__inner page-shell">
          <motion.blockquote {...reveal}>“The best objects don’t ask for attention.<br />They simply make the day work better.”</motion.blockquote>
          <p>— The Nova design studio</p>
        </div>
      </section>

      <section className="benefits page-shell">
        <article><Truck size={21} /><h3>Delivered thoughtfully</h3><p>Complimentary carbon-neutral delivery over $100.</p></article>
        <article><RotateCcw size={21} /><h3>30 days to decide</h3><p>Easy, considered returns from your account.</p></article>
        <article><ShieldCheck size={21} /><h3>Built to stay</h3><p>Two-year care and repair support on every object.</p></article>
        <article><Sparkles size={21} /><h3>Human support</h3><p>Real people, ready to help Monday through Friday.</p></article>
      </section>

      <section className="newsletter page-shell">
        <div><p className="section-index">Notes from the studio</p><h2>Good things,<br />occasionally.</h2></div>
        <form onSubmit={(event) => event.preventDefault()}><label htmlFor="newsletter-email">Product stories, field notes, and first looks.</label><div><input id="newsletter-email" type="email" required placeholder="Email address" /><button type="submit" aria-label="Subscribe"><ArrowRight size={19} /></button></div><p>By subscribing, you agree to our privacy policy.</p></form>
      </section>
    </main>
  );
}
