import type { Category, Product } from '@nova/shared-types';

const image = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=88`;

export const categories: Category[] = [
  { id: 'cat-carry', name: 'Carry', slug: 'carry', description: 'Bags designed around the way you move.', imageUrl: image('photo-1553062407-98eeb64c6a62'), productCount: 6 },
  { id: 'cat-audio', name: 'Audio', slug: 'audio', description: 'Focused listening, wherever the day goes.', imageUrl: image('photo-1505740420928-5e560c06d30e'), productCount: 4 },
  { id: 'cat-desk', name: 'Desk', slug: 'desk', description: 'Tools for calmer, more intentional work.', imageUrl: image('photo-1497366811353-6870744d04b2'), productCount: 6 },
  { id: 'cat-wear', name: 'Wear', slug: 'wear', description: 'Everyday layers, refined to their essentials.', imageUrl: image('photo-1551488831-00ddcb6c6bd3'), productCount: 5 },
  { id: 'cat-travel', name: 'Travel', slug: 'travel', description: 'Considered companions for going further.', imageUrl: image('photo-1488646953014-85cb44e25828'), productCount: 4 },
];

const category = (slug: string) => categories.find((item) => item.slug === slug)!;
const now = '2026-08-18T10:00:00.000Z';

type ProductSeed = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  imageId: string;
  imageId2?: string;
  color: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  eyebrow?: string;
  description: string;
};

const seeds: ProductSeed[] = [
  { slug: 'nova-carry-backpack', name: 'Nova Carry Backpack', category: 'carry', price: 148, imageId: 'photo-1553062407-98eeb64c6a62', imageId2: 'photo-1622560480605-d83c853bc5c3', color: 'Graphite', rating: 4.9, reviews: 124, featured: true, bestseller: true, eyebrow: 'The everyday system', description: 'A structured 22L carry built for commutes, long weekends, and everything between.' },
  { slug: 'aero-wireless-headphones', name: 'Aero Wireless Headphones', category: 'audio', price: 219, compareAt: 249, imageId: 'photo-1505740420928-5e560c06d30e', imageId2: 'photo-1484704849700-f032a568e944', color: 'Sand', rating: 4.8, reviews: 89, featured: true, isNew: true, eyebrow: 'Room for quiet', description: 'Immersive sound, adaptive noise control, and an effortless all-day fit.' },
  { slug: 'form-mechanical-keyboard', name: 'Form Mechanical Keyboard', category: 'desk', price: 164, imageId: 'photo-1587829741301-dc798b83add3', imageId2: 'photo-1618384887929-16ec33fab9ef', color: 'Bone', rating: 4.9, reviews: 76, featured: true, bestseller: true, description: 'A compact aluminum keyboard with tactile switches and a softened acoustic profile.' },
  { slug: 'orbit-desk-lamp', name: 'Orbit Desk Lamp', category: 'desk', price: 129, imageId: 'photo-1507473885765-e6ed057f782c', imageId2: 'photo-1513506003901-1e6a229e2d15', color: 'Chalk', rating: 4.7, reviews: 42, featured: true, isNew: true, description: 'Flicker-free, warm-to-cool task light with a precise, counterbalanced arm.' },
  { slug: 'arc-crossbody', name: 'Arc Crossbody', category: 'carry', price: 78, imageId: 'photo-1566150905458-1bf1fc113f0d', imageId2: 'photo-1594223274512-ad4803739b7c', color: 'Olive', rating: 4.7, reviews: 58, bestseller: true, description: 'A low-profile everyday bag with surprising organization and a soft woven strap.' },
  { slug: 'mono-travel-bottle', name: 'Mono Travel Bottle', category: 'travel', price: 42, imageId: 'photo-1602143407151-7111542de6e8', color: 'Moss', rating: 4.8, reviews: 103, bestseller: true, description: 'Double-wall stainless steel with a ceramic-lined interior and quiet carry loop.' },
  { slug: 'frame-sunglasses', name: 'Frame Sunglasses', category: 'wear', price: 112, imageId: 'photo-1511499767150-a48a237f0083', color: 'Tortoise', rating: 4.6, reviews: 37, isNew: true, description: 'Polarized bio-acetate frames with a gently architectural silhouette.' },
  { slug: 'halo-portable-speaker', name: 'Halo Portable Speaker', category: 'audio', price: 139, imageId: 'photo-1608043152269-423dbba4e7e1', color: 'Ochre', rating: 4.8, reviews: 71, featured: true, description: 'Room-filling 360° sound in a water-resistant form built to travel.' },
  { slug: 'studio-notebook', name: 'Studio Notebook', category: 'desk', price: 28, imageId: 'photo-1531346878377-a5be20888e57', color: 'Clay', rating: 4.9, reviews: 146, bestseller: true, description: 'Lay-flat binding, fountain-pen friendly paper, and a satisfyingly cloth-bound cover.' },
  { slug: 'core-everyday-tee', name: 'Core Everyday Tee', category: 'wear', price: 48, imageId: 'photo-1521572163474-6864f9cf17ab', color: 'Ecru', rating: 4.7, reviews: 93, description: 'A substantial organic-cotton tee cut with a relaxed, considered drape.' },
  { slug: 'motion-technical-jacket', name: 'Motion Technical Jacket', category: 'wear', price: 238, imageId: 'photo-1551028719-00167b16eac5', color: 'Slate', rating: 4.8, reviews: 34, isNew: true, description: 'A weather-ready shell with clean lines, hidden ventilation, and quiet fabric.' },
  { slug: 'terra-weekender', name: 'Terra Weekender', category: 'travel', price: 188, imageId: 'photo-1553062407-98eeb64c6a62', color: 'Cedar', rating: 4.9, reviews: 64, featured: true, description: 'A 38L soft-sided weekender that opens flat and keeps every trip composed.' },
  { slug: 'signal-earbuds', name: 'Signal Earbuds', category: 'audio', price: 149, imageId: 'photo-1606220945770-b5b6c2c55bf1', color: 'Ink', rating: 4.6, reviews: 82, description: 'Pocket-sized listening with clear calls, spatial sound, and 30-hour battery life.' },
  { slug: 'line-cable-organizer', name: 'Line Cable Organizer', category: 'desk', price: 34, imageId: 'photo-1615525137689-198778541af6', color: 'Natural', rating: 4.5, reviews: 28, description: 'A weighted oak organizer that brings calm to the cables on your desk.' },
  { slug: 'field-cap', name: 'Field Cap', category: 'wear', price: 44, imageId: 'photo-1588850561407-ed78c282e89b', color: 'Fern', rating: 4.6, reviews: 51, description: 'A breathable, packable five-panel cap for bright trails and slow weekends.' },
  { slug: 'fold-laptop-stand', name: 'Fold Laptop Stand', category: 'desk', price: 84, imageId: 'photo-1527443224154-c4a3942d3acf', color: 'Silver', rating: 4.8, reviews: 67, bestseller: true, description: 'A stable, height-adjustable aluminum stand that folds completely flat.' },
  { slug: 'drift-travel-pouch', name: 'Drift Travel Pouch', category: 'travel', price: 56, imageId: 'photo-1553531384-cc64ac80f931', color: 'Marine', rating: 4.7, reviews: 39, description: 'A padded, water-resistant home for chargers, documents, and small essentials.' },
  { slug: 'tempo-analog-watch', name: 'Tempo Analog Watch', category: 'wear', price: 196, imageId: 'photo-1524805444758-089113d48a6d', color: 'Steel', rating: 4.7, reviews: 46, featured: true, description: 'A restrained 38mm field watch with sapphire crystal and a woven strap.' },
  { slug: 'beam-monitor-light', name: 'Beam Monitor Light', category: 'desk', price: 96, imageId: 'photo-1547394765-185e1e68f34e', color: 'Graphite', rating: 4.6, reviews: 31, description: 'Glare-free illumination that restores space and softness to your desk.' },
  { slug: 'pocket-card-wallet', name: 'Pocket Card Wallet', category: 'carry', price: 52, imageId: 'photo-1627123424574-724758594e93', color: 'Umber', rating: 4.8, reviews: 88, description: 'Vegetable-tanned leather, four card slots, and a silhouette that stays slim.' },
  { slug: 'route-sling', name: 'Route Sling', category: 'carry', price: 88, imageId: 'photo-1622560480605-d83c853bc5c3', color: 'Stone', rating: 4.7, reviews: 54, description: 'A reversible, body-hugging sling sized for daily essentials and a small camera.' },
  { slug: 'quiet-desktop-speakers', name: 'Quiet Desktop Speakers', category: 'audio', price: 184, imageId: 'photo-1545454675-3531b543be5d', color: 'Walnut', rating: 4.9, reviews: 43, isNew: true, description: 'Warm near-field audio with walnut cabinets and a minimal footprint.' },
  { slug: 'passage-packing-cubes', name: 'Passage Packing Cubes', category: 'travel', price: 64, imageId: 'photo-1436491865332-7a61a109cc05', color: 'Mist', rating: 4.7, reviews: 61, description: 'A set of three featherlight organizers with expandable compression.' },
  { slug: 'studio-tote', name: 'Studio Tote', category: 'carry', price: 96, imageId: 'photo-1590874103328-eac38a683ce7', color: 'Canvas', rating: 4.8, reviews: 72, isNew: true, description: 'A structured cotton-canvas tote with a zip top and protected laptop sleeve.' },
  { slug: 'axis-tech-case', name: 'Axis Tech Case', category: 'carry', price: 68, imageId: 'photo-1553531384-cc64ac80f931', color: 'Black', rating: 4.6, reviews: 44, description: 'Expandable storage for the chargers and tools that keep work moving.' },
];

export const products: Product[] = seeds.map((seed, index) => {
  const productId = `product-${String(index + 1).padStart(2, '0')}`;
  const productCategory = category(seed.category);
  const imageIds = [seed.imageId, seed.imageId2 ?? seed.imageId];
  return {
    id: productId,
    slug: seed.slug,
    name: seed.name,
    eyebrow: seed.eyebrow,
    description: seed.description,
    details: ['Designed for daily use', 'Responsibly selected materials', 'Two-year Nova Supply warranty'],
    specifications: { Material: 'Premium mixed materials', Care: 'Wipe clean', Warranty: '2 years', Origin: 'Responsibly made' },
    category: productCategory,
    price: seed.price,
    compareAtPrice: seed.compareAt,
    cost: Math.round(seed.price * 0.42),
    rating: seed.rating,
    reviewCount: seed.reviews,
    status: 'active',
    featured: Boolean(seed.featured),
    bestseller: Boolean(seed.bestseller),
    isNew: Boolean(seed.isNew),
    images: imageIds.map((imageId, position) => ({ id: `${productId}-image-${position + 1}`, url: image(imageId), alt: `${seed.name} in ${seed.color}`, position })),
    variants: [
      { id: `${productId}-variant-1`, productId, name: seed.color, sku: `NV-${String(index + 1).padStart(3, '0')}-${seed.color.slice(0, 3).toUpperCase()}`, price: seed.price, compareAtPrice: seed.compareAt, color: seed.color, colorHex: ['#292b2a', '#d8cbb8', '#727667'][index % 3], inventoryQuantity: 18 + (index * 7) % 63, reservedQuantity: index % 5, incomingQuantity: index % 3 === 0 ? 20 : 0, imageUrl: image(imageIds[0], 800) },
      { id: `${productId}-variant-2`, productId, name: 'Black', sku: `NV-${String(index + 1).padStart(3, '0')}-BLK`, price: seed.price, compareAtPrice: seed.compareAt, color: 'Black', colorHex: '#171918', inventoryQuantity: 9 + (index * 5) % 42, reservedQuantity: index % 4, incomingQuantity: 0, imageUrl: image(imageIds[1], 800) },
    ],
    createdAt: now,
    updatedAt: now,
  };
});

export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);
