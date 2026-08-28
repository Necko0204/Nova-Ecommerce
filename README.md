# Nova Commerce

![Nova Supply storefront preview](apps/storefront/public/og.png)

Nova Commerce is a portfolio-grade, Shopify-inspired e-commerce platform built as two intentionally independent frontends over one local Supabase backend. The customer experience is a refined React storefront; the merchant experience is a dense, responsive Angular administration application.

This is not a static concept. Authentication, catalog queries, carts, wishlists, checkout, order creation, inventory, reviews, discounts, customer data, analytics, and merchant operations all connect to the same PostgreSQL schema with Row Level Security.

## Architecture

```text
                    ┌─────────────────────┐
                    │      Supabase       │
                    │                     │
                    │ PostgreSQL          │
                    │ Authentication      │
                    │ Local API           │
                    │ RLS                 │
                    └─────────┬───────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
        ┌─────────▼──────────┐  ┌────────▼─────────┐
        │ React Storefront   │  │ Angular Admin    │
        │                    │  │                  │
        │ Customer Website   │  │ Merchant System  │
        │ Cart               │  │ Products         │
        │ Checkout           │  │ Orders           │
        │ Account            │  │ Inventory        │
        │ Wishlist           │  │ Analytics        │
        └────────────────────┘  └──────────────────┘
```

```text
nova-commerce/
├── apps/
│   ├── storefront/          React 19 + Vite customer application
│   └── admin/               Angular 22 merchant application
├── packages/
│   ├── shared-types/        Shared domain contracts
│   ├── shared-utils/        Currency, date, slug, and pricing helpers
│   └── validation/          Shared Zod schemas
├── scripts/                 Local environment generation
└── supabase/
    ├── migrations/          Relational schema, RLS, and transactional RPCs
    └── seed.sql             Believable portfolio data
```

## Why React + Angular?

React powers the consumer storefront because its component ecosystem, lightweight architecture, and flexibility are well suited for highly interactive customer experiences.

Angular powers the administration platform because its opinionated architecture, dependency injection, Reactive Forms, RxJS ecosystem, routing, and enterprise-focused structure are well suited to complex internal business applications.

Keeping the applications separate also demonstrates a practical multi-client architecture: neither framework is embedded inside the other, and both consume the same secured backend contracts.

## Product tour

### React storefront — `http://127.0.0.1:5173`

- Editorial homepage, responsive navigation, announcement bar, collections, product stories, benefits, newsletter, and complete footer
- URL-driven shop search, category/price/rating/availability filters, sorting, active chips, and progressive loading
- Product gallery, variants, stock state, compare pricing, wishlist, related and recently viewed products
- Search overlay with keyboard shortcut, product/category suggestions, thumbnails, and recent searches
- Local guest cart plus authenticated Supabase cart restoration, intelligent merge, and ongoing persistence
- Validated checkout with demo payment, server-validated discounts, confirmation, and an atomic PostgreSQL order/inventory transaction
- Supabase signup/login/recovery, protected account routes, orders, addresses, profile, and persisted wishlist
- Moderated customer reviews with secure verified-purchase detection

### Angular admin — `http://127.0.0.1:4200/admin`

- Role-protected admin authentication backed by Supabase—not a frontend role flag
- Responsive SaaS shell with desktop sidebar, mobile navigation, route-level lazy loading, and `Ctrl/Cmd + K` command palette
- Revenue, orders, AOV, customers, conversion, stock alerts, Chart.js reporting, top products, and activity feed
- Searchable/sortable/filterable/paginated products and nested Reactive Form/FormArray product editing
- Orders, detailed fulfillment workflow, customers and lifetime value, inventory adjustments and transaction history
- Percentage, fixed-value, and free-shipping discount management
- Analytics for revenue, funnel, products, categories, customer growth, and order status

## Backend and security

The migration creates 20 RLS-enabled public tables with UUID keys, foreign keys, indexes, timestamps, checks, and deliberate delete behavior. Public access is limited to active catalog data and approved reviews. Customers can access only their own profile, cart, wishlist, addresses, orders, and review records. Merchant mutations require an administrator role resolved in PostgreSQL through a `SECURITY DEFINER` authorization function.

Sensitive workflows remain in the database:

- `create_checkout_order` validates the cart and discount, locks inventory, creates the order and line items, records stock transactions, increments redemptions, and converts the cart atomically.
- `adjust_inventory` requires a database-confirmed administrator and writes an immutable adjustment plus activity event.
- `submit_product_review` validates content, derives verified-purchase status from delivered orders, and queues the review for moderation.

Frontend clients receive only the local anonymous key. A service-role key is never required by either application.

## Local setup

Prerequisites: Node.js 22 LTS, pnpm 11 (or Corepack), Docker Desktop, and the Supabase CLI. Everything runs locally; no hosted Supabase or payment provider is used.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm supabase:start
pnpm supabase:reset
```

Copy the local API URL and anonymous key from `supabase status` into `.env.local` for both the `VITE_` and `NG_APP_` variables. This repository uses ports `55321–55323` so it can coexist with a default Supabase project.

Start both applications:

```bash
pnpm dev
```

Or start them independently:

```bash
pnpm storefront
pnpm admin
```

The same root scripts can be invoked as `npm run dev`, `npm run storefront`, and `npm run admin` after installing the workspace with pnpm.

### Demo identities

| Experience | Email | Password |
|---|---|---|
| Merchant admin | `admin@novasupply.local` | `NovaDemo!2026` |
| Customer | `olivia.chen@example.local` | `NovaDemo!2026` |

All 30 seeded customer accounts use the same local-only password. Never reuse these credentials outside this disposable development database.

## Seed data

`supabase db reset` recreates a deterministic portfolio dataset:

- 5 categories and 25 named, photographed products
- Product images, variants, costs, SKUs, live inventory, reserved stock, incoming stock, and adjustment history
- 30 customer identities plus one administrator
- 40 orders with line items and realistic fulfillment/payment states
- 30 reviews, 4 discounts, 240 analytics events, saved addresses, and an activity feed

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Run React and Angular concurrently |
| `pnpm storefront` | Run the React storefront |
| `pnpm admin` | Run the Angular admin |
| `pnpm build` | Build all buildable workspaces |
| `pnpm lint` | Run workspace lint/type validation |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm supabase:start` | Start the local backend |
| `pnpm supabase:reset` | Recreate, migrate, and seed PostgreSQL |

## Commerce-provider boundary

Storefront UI imports the `CommerceProvider` contract rather than issuing catalog and checkout calls in components. The active `SupabaseCommerceProvider` can later be complemented by a `ShopifyCommerceProvider` without rewriting routes, product cards, cart UI, or account views. The Angular app follows a parallel service/data-access boundary for merchant operations.

No Shopify API is connected yet. A future adapter would map Shopify products, variants, inventory, customers, and orders into the shared domain interfaces while deciding which system owns checkout and fulfillment.

## Engineering highlights

- Multi-framework monorepo with shared strict TypeScript contracts
- React route splitting, TanStack Query server state, Zustand commerce state, React Hook Form, and Zod validation
- Angular standalone components, Signals/computed state, RxJS, Reactive Forms/FormArrays, CDK focus trapping, and lazy routes
- Relational PostgreSQL model, Supabase Auth, role authorization, RLS, transactional functions, and audit records
- Real cart/wishlist persistence, checkout/order lifecycle, discount validation, inventory transactions, and review moderation
- Responsive customer and merchant layouts, accessible forms/drawers/modals, focus states, reduced-motion support, skeletons, errors, empty states, and toasts
- Repository/service abstractions designed for a later Shopify integration

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm build
supabase db lint --local --level warning
```

The database can be revalidated from zero at any time with `pnpm supabase:reset`. This is intentionally a local portfolio project and contains no deployment configuration.
