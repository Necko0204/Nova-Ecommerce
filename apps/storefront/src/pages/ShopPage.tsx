import { SlidersHorizontal, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { categories } from '@/data/catalog';
import { commerceProvider, type ProductFilters } from '@/repositories/commerce';

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(12);
  const filters = useMemo<ProductFilters>(() => ({
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    minPrice: params.get('min') ? Number(params.get('min')) : undefined,
    maxPrice: params.get('max') ? Number(params.get('max')) : undefined,
    minRating: params.get('rating') ? Number(params.get('rating')) : undefined,
    inStock: params.get('availability') === 'in-stock',
    sort: (params.get('sort') as ProductFilters['sort']) || 'featured',
  }), [params]);
  const { data = [], isLoading, error } = useQuery({ queryKey: ['products', filters], queryFn: () => commerceProvider.listProducts(filters) });
  useEffect(() => setVisible(12), [params]);
  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };
  const chips = [...(filters.category ? [{ key: 'category', label: categories.find((item) => item.slug === filters.category)?.name ?? filters.category }] : []), ...(filters.minRating ? [{ key: 'rating', label: `${filters.minRating}+ stars` }] : []), ...(filters.inStock ? [{ key: 'availability', label: 'In stock' }] : []), ...(filters.maxPrice ? [{ key: 'max', label: `Under $${filters.maxPrice}` }] : [])];

  return (
    <main className="shop-page page-shell">
      <div className="shop-hero"><p className="section-index">The Nova collection</p><h1>Useful, by design.</h1><p>Considered objects for the rituals that shape a day.</p></div>
      <div className="shop-toolbar"><div><button onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={15} /> Filters</button><span>{data.length} objects</span></div><label>Sort by<select value={filters.sort} onChange={(event) => update('sort', event.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></label></div>
      <div className={`filters-panel ${filtersOpen ? 'filters-panel--open' : ''}`}>
        <fieldset><legend>Category</legend>{categories.map((category) => <label key={category.id}><input type="radio" name="category" checked={filters.category === category.slug} onChange={() => update('category', category.slug)} />{category.name}<span>{category.productCount}</span></label>)}</fieldset>
        <fieldset><legend>Price</legend>{[['75','Under $75'],['150','Under $150'],['250','Under $250']].map(([value,label]) => <label key={value}><input type="radio" name="price" checked={filters.maxPrice === Number(value)} onChange={() => update('max', value)} />{label}</label>)}</fieldset>
        <fieldset><legend>Rating</legend>{[4.5,4,3].map((value) => <label key={value}><input type="radio" name="rating" checked={filters.minRating === value} onChange={() => update('rating', String(value))} />{value}+ stars</label>)}</fieldset>
        <fieldset><legend>Availability</legend><label><input type="checkbox" checked={filters.inStock} onChange={(event) => update('availability', event.target.checked ? 'in-stock' : undefined)} />In stock now</label></fieldset>
        <button className="filters-clear" onClick={() => setParams({})}>Clear all</button>
      </div>
      {chips.length > 0 && <div className="filter-chips">{chips.map((chip) => <button key={chip.key} onClick={() => update(chip.key)}>{chip.label}<X size={12} /></button>)}</div>}
      {error ? <div className="state-box"><h2>We couldn’t load the collection.</h2><p>Check your local Supabase connection and try again.</p></div> : isLoading ? <div className="product-grid">{Array.from({ length: 8 }, (_, index) => <div className="product-skeleton" key={index} />)}</div> : data.length === 0 ? <div className="state-box"><h2>No objects found.</h2><p>Try removing a filter or choosing another category.</p><button onClick={() => setParams({})}>Reset filters</button></div> : <><div className="product-grid">{data.slice(0, visible).map((product) => <ProductCard key={product.id} product={product} />)}</div>{visible < data.length && <button className="load-more" onClick={() => setVisible((count) => count + 8)}>Load more <span>{data.length - visible} remaining</span></button>}</>}
    </main>
  );
}
