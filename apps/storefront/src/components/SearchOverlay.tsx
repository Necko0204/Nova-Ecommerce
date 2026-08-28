import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, products } from '@/data/catalog';
import { useCommerceStore } from '@/stores/commerce-store';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useCommerceStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) window.setTimeout(() => inputRef.current?.focus(), 100); }, [searchOpen]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !searchOpen && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); setSearchOpen(true); }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);
  const results = useMemo(() => query.trim().length < 2 ? [] : products.filter((product) => `${product.name} ${product.category.name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query]);
  return (
    <div className={`search-overlay ${searchOpen ? 'search-overlay--open' : ''}`} aria-hidden={!searchOpen}>
      <div className="search-overlay__top"><p className="wordmark">NOVA<span>SUPPLY</span></p><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={23} /></button></div>
      <div className="search-overlay__body page-shell"><p className="eyebrow">Search Nova Supply</p><div className="search-field"><Search size={31} strokeWidth={1.2} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What are you looking for?" aria-label="Search products and categories" /><kbd>/</kbd></div>
        {query.trim().length < 2 ? <div className="search-suggestions"><div><p className="eyebrow">Suggested categories</p>{categories.map((category) => <Link key={category.id} to={`/shop?category=${category.slug}`} onClick={() => setSearchOpen(false)}>{category.name}<ArrowRight size={16} /></Link>)}</div><div><p className="eyebrow">Popular now</p>{products.filter((product) => product.bestseller).slice(0, 4).map((product) => <Link key={product.id} to={`/products/${product.slug}`} onClick={() => setSearchOpen(false)}>{product.name}</Link>)}</div></div> :
        <div className="search-results"><div className="search-results__heading"><span>{results.length} products</span><Link to={`/shop?search=${encodeURIComponent(query)}`} onClick={() => setSearchOpen(false)}>View all results <ArrowRight size={15} /></Link></div>{results.map((product) => <Link key={product.id} to={`/products/${product.slug}`} onClick={() => setSearchOpen(false)}><img src={product.images[0].url} alt="" /><div><span>{product.category.name}</span><strong>{product.name}</strong></div><span>${product.price}</span></Link>)}</div>}
      </div>
    </div>
  );
}
