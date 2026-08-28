import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Heart, PackageCheck, RotateCcw, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { formatCurrency, calculateDiscountPercentage } from '@nova/shared-utils';
import { ProductCard } from '@/components/ProductCard';
import { QuantityControl } from '@/components/QuantityControl';
import { ReviewPanel } from '@/components/ReviewPanel';
import { commerceProvider } from '@/repositories/commerce';
import { products as fallbackProducts } from '@/data/catalog';
import { useCommerceStore } from '@/stores/commerce-store';

export function ProductPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery({ queryKey: ['product', slug], queryFn: () => commerceProvider.getProduct(slug) });
  const { data: catalog = fallbackProducts } = useQuery({ queryKey: ['products', 'related'], queryFn: () => commerceProvider.listProducts() });
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, toggleWishlist, wishlistIds, trackViewed, recentlyViewed } = useCommerceStore();
  useEffect(() => { if (slug) trackViewed(slug); }, [slug, trackViewed]);
  const related = useMemo(() => product ? catalog.filter((item) => item.category.slug === product.category.slug && item.id !== product.id).slice(0, 4) : [], [catalog, product]);
  const recent = useMemo(() => catalog.filter((item) => recentlyViewed.includes(item.slug) && item.slug !== slug).sort((a, b) => recentlyViewed.indexOf(a.slug) - recentlyViewed.indexOf(b.slug)).slice(0, 4), [catalog, recentlyViewed, slug]);
  if (isLoading) return <main className="product-page page-shell"><div className="product-page__loading" /></main>;
  if (!product) return <main className="state-box state-box--page"><h1>Object not found.</h1><p>The product may have moved or is no longer available.</p><Link to="/shop">Return to the collection</Link></main>;
  const variant = product.variants[selectedVariant];
  const wished = wishlistIds.includes(product.id);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const add = () => { addItem(product, variant, quantity); toast.success(`${product.name} added to your bag`); };
  return (
    <main className="product-page">
      <div className="product-breadcrumb page-shell"><Link to="/shop">Shop</Link><span>/</span><Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link><span>/</span><span>{product.name}</span></div>
      <section className="product-detail page-shell">
        <div className="product-gallery"><div className="product-gallery__main"><img src={product.images[selectedImage]?.url} alt={product.images[selectedImage]?.alt} />{discount > 0 && <span className="product-discount">Save {discount}%</span>}</div><div className="product-gallery__thumbs">{product.images.map((image, index) => <button key={image.id} className={selectedImage === index ? 'active' : ''} onClick={() => setSelectedImage(index)}><img src={image.url} alt={`View ${index + 1}`} /></button>)}</div></div>
        <div className="product-info"><p className="eyebrow">{product.category.name} · {product.isNew ? 'New arrival' : 'Nova essential'}</p><h1>{product.name}</h1><div className="product-info__rating"><span><Star size={13} fill="currentColor" /> {product.rating || 'New'}</span><a href="#reviews">{product.reviewCount} reviews</a></div><div className="product-info__price"><strong>{formatCurrency(variant.price)}</strong>{variant.compareAtPrice && <s>{formatCurrency(variant.compareAtPrice)}</s>}</div><p className="product-info__description">{product.description}</p>
          <div className="variant-block"><div><span>Finish</span><strong>{variant.name}</strong></div><div className="variant-options">{product.variants.map((item, index) => <button key={item.id} className={selectedVariant === index ? 'active' : ''} onClick={() => setSelectedVariant(index)} title={item.name}><span style={{ background: item.colorHex }} />{item.name}{selectedVariant === index && <Check size={12} />}</button>)}</div></div>
          <div className="stock-line"><span className={variant.inventoryQuantity < 10 ? 'stock-dot stock-dot--low' : 'stock-dot'} />{variant.inventoryQuantity < 10 ? `Only ${variant.inventoryQuantity} left` : 'In stock and ready to ship'}</div>
          <div className="product-actions"><QuantityControl value={quantity} max={variant.inventoryQuantity} onChange={setQuantity} /><button className="add-to-bag" onClick={add}>Add to bag · {formatCurrency(variant.price * quantity)}</button><button className={`product-wishlist ${wished ? 'active' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist"><Heart size={19} fill={wished ? 'currentColor' : 'none'} /></button></div>
          <button className="buy-now" onClick={() => { add(); navigate('/checkout'); }}>Buy now</button>
          <div className="product-assurances"><div><PackageCheck size={18} /><span><strong>Complimentary delivery</strong>On orders over $100</span></div><div><RotateCcw size={18} /><span><strong>30-day returns</strong>From your online account</span></div><div><ShieldCheck size={18} /><span><strong>Two-year warranty</strong>Care that continues</span></div></div>
          <div className="product-accordions"><details open><summary>Details <ChevronDown size={15} /></summary><ul>{product.details?.map((detail) => <li key={detail}>{detail}</li>)}</ul></details><details><summary>Specifications <ChevronDown size={15} /></summary><dl>{Object.entries(product.specifications ?? {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></details><details><summary>Delivery & returns <ChevronDown size={15} /></summary><p>Standard delivery takes 3–5 business days. Returns are accepted within 30 days in original condition.</p></details></div>
        </div>
      </section>
      <ReviewPanel product={product} />
      {related.length > 0 && <section className="product-section page-shell"><div className="section-heading"><div><p className="section-index">Keep exploring</p><h2>You may also like.</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
      {recent.length > 0 && <section className="product-section page-shell"><div className="section-heading"><div><p className="section-index">Your edit</p><h2>Recently viewed.</h2></div></div><div className="product-grid">{recent.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}
