# Tanner & Co. — Leather Goods Backend (NestJS)

The same backend architecture as the AH Perfumes build, reworked for a
leather goods catalog: colors + sizes instead of fragrance concentration
and notes, a color×size variant model instead of ml sizes, and the exact
14-product catalog from the frontend's `products.ts` data file, ready to
seed straight in.

## What changed from the perfume version

| Area | Before (perfume) | Now (leather goods) |
|---|---|---|
| Product fields | `gender`, `concentration`, `fragranceNotes` (top/middle/base) | `colors: string[]`, `sizes: string[]`, `details: string[]` (bullet features) |
| Variants | `sizeMl` (30/50/100) + required `price` | `color` + `size` (free-form strings — "UK 9", "32", "42L", "One Size") + optional `priceOverride`/`mrpOverride`, falling back to the product's base price |
| Rating fields | `avgRating` / `reviewCount` | same fields, renamed in spirit to match `rating` / `reviews` from the source data |
| "Featured" flag | `isFeatured` | `isBestSeller` (matches the `bestSeller` flag in the source catalog) |
| Category | had `gender` enum baked into products | categories now carry their own `blurb` + `imageUrl`, matching the source `categories` array (bags, wallets, belts, footwear, travel) |
| Seed data | one demo perfume | the full 14-product catalog, transcribed from the provided `products.ts`, including every color/size combination as real variant rows |

Everything else — auth (JWT + Google OAuth), cart (guest + signed-in),
checkout (transactional, stock-decrementing), orders, wishlist, coupons,
reviews, addresses, B2 uploads, the admin panel, and wretch as the
outbound HTTP client for Resend/Razorpay — is unchanged from the AH
Perfumes backend.

## Stack

- **NestJS 10**
- **Neon** — serverless PostgreSQL
- **Drizzle ORM** — `src/database/schema.ts`
- **Passport + JWT** — credentials + optional Google OAuth
- **wretch** — the HTTP client for outbound calls (`MailService` →
  Resend, `PaymentsService` → Razorpay), wrapped in
  `src/common/http/http-client.service.ts`
- **Backblaze B2** — S3-compatible storage, presigned uploads
- **class-validator / class-transformer** — DTO validation, enforced
  globally in `main.ts`

## Setup

```bash
npm install
cp .env.example .env         # fill in DATABASE_URL, JWT_SECRET, B2_*, etc.
npm run db:push               # pushes src/database/schema.ts to Neon
npm run db:seed               # loads categories + all 14 products + variants
npm run start:dev             # http://localhost:4000/api
```

### About the seeded image URLs

`npm run db:seed` inserts image rows pointing at
`${B2_PUBLIC_URL_BASE}/products/<filename>`, reusing the same asset
filenames from the original frontend catalog (`hero-leather.jpg`,
`p-tote.jpg`, `p-wallet.jpg`, `p-belt.jpg`, `p-duffel.jpg`,
`p-cardholder.jpg`, `p-crossbody.jpg`, `p-boots.jpg`). Upload those same
files to your B2 bucket under a `products/` prefix and the URLs resolve
immediately — no seed data to touch.

### Colors, sizes, and stock

Each product stores `colors: string[]` and `sizes: string[]` for quick
display/filtering (`GET /products?color=Cognac&size=UK+9`). Actual
purchasable stock lives in `product_variants`, one row per color×size
combination — the seed script creates every combination for you (e.g.
the belt with 3 colors × 6 sizes = 18 variants). Checkout decrements
`product_variants.stockQty` for the exact variant purchased, inside a
single DB transaction, same as before.

## API Routes

All prefixed with `/api`.

| Controller | Base path | Notes |
|---|---|---|
| `AuthController` | `/auth` | register, login, google, forgot/reset password, `me` |
| `ProfileController` | `/account/profile` | get/update own profile |
| `AddressesController` | `/account/addresses` | CRUD own addresses |
| `CategoriesController` | `/categories` | GET public, POST/PATCH admin-only |
| `ProductsController` | `/products` | public list (filter by `category`, `color`, `size`, `bestSeller`, `isNew`, price range, search) + detail by slug |
| `AdminProductsController` | `/admin/products` | CRUD, images, variants — admin only |
| `CartController` | `/cart` | works for guests (`x-cart-session` header) and users |
| `WishlistController` | `/wishlist` | signed-in users |
| `CouponsController` | `/coupons/validate` | preview a discount |
| `AdminCouponsController` | `/admin/coupons` | CRUD — admin only |
| `CheckoutController` | `/checkout` | places an order (transactional) |
| `OrdersController` | `/orders` | own order history/detail |
| `AdminOrdersController` | `/admin/orders` | all orders, status updates |
| `ReviewsController` | `/reviews` | create (delivered-purchase only) |
| `AdminReviewsController` | `/admin/reviews` | moderation queue |
| `UploadController` | `/upload/presign` | B2 presigned URLs |
| `AdminCustomersController` | `/admin/customers` | list/detail/block |
| `AdminDashboardController` | `/admin/dashboard` | stat cards, recent orders, low-stock variants |

Guest cart requests must send an `x-cart-session` header (a
client-generated UUID persisted in a cookie/localStorage). After sign-in,
re-post the guest's items with the now-authenticated request to merge
carts.

## Guards

- `JwtAuthGuard` — requires a valid Bearer token
- `OptionalJwtAuthGuard` — used only on `/cart`, since it must behave
  differently for guests vs signed-in users, never throws
- `RolesGuard` + `@Roles('admin')` — layered on top of `JwtAuthGuard` for
  every `/admin/*` controller

## Production notes

- **Payments**: `CheckoutService` creates the Razorpay order via wretch
  but does not mark the order "paid" — add a webhook route once you wire
  in your Razorpay account, and only trust that webhook (not the client)
  to flip `paymentStatus`.
- **Rate limiting**: add `@nestjs/throttler` in front of `/auth/*` before
  going live.
- **Path aliases**: `@/*` imports are rewritten to relative paths at
  build time by `tsc-alias` (see the `build` script) and resolved by
  `tsconfig-paths` in dev mode — both are already wired up.
