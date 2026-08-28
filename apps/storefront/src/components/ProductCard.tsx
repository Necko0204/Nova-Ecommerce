import { formatCurrency } from '@nova/shared-utils';
import { Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '@nova/shared-types';
import { calculateDiscountPercentage } from '@nova/shared-utils';
import { useCommerceStore } from '@/stores/commerce-store';
import { toast } from 'sonner';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const { addItem, toggleWishlist, wishlistIds } = useCommerceStore();
  const wished = wishlistIds.includes(product.id);
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card__image-wrap" aria-label={`View ${product.name}`}>
        <img className="product-card__image" src={product.images[0].url} alt={product.images[0].alt} loading={priority ? 'eager' : 'lazy'} />
        <img className="product-card__image product-card__image--alternate" src={product.images[1].url} alt="" loading="lazy" />
        <div className="product-card__badges">
          {product.isNew && <span className="badge badge--light">New</span>}
          {discount > 0 && <span className="badge badge--dark">Save {discount}%</span>}
        </div>
      </Link>
      <button className={`product-card__wish ${wished ? 'product-card__wish--active' : ''}`} aria-label={`${wished ? 'Remove' : 'Add'} ${product.name} ${wished ? 'from' : 'to'} wishlist`} onClick={() => { toggleWishlist(product.id); toast.success(wished ? 'Removed from saved items' : 'Saved for later'); }}><Heart size={17} fill={wished ? 'currentColor' : 'none'} /></button>
      <div className="product-card__details">
        <div>
          <p className="eyebrow">{product.category.name}</p>
          <Link to={`/products/${product.slug}`} className="product-card__title">{product.name}</Link>
          <div className="product-card__rating" aria-label={`${product.rating} out of 5 stars`}>★ {product.rating} <span>({product.reviewCount})</span></div>
        </div>
        <div className="product-card__purchase">
          <p className="product-card__price">
            {formatCurrency(product.price)}
            {product.compareAtPrice && <s>{formatCurrency(product.compareAtPrice)}</s>}
          </p>
          <button className="quick-add" aria-label={`Quick add ${product.name}`} onClick={() => { addItem(product, product.variants[0]); toast.success(`${product.name} added to your bag`); }}><Plus size={17} /></button>
        </div>
      </div>
    </article>
  );
}
