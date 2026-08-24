# 👜 Terracotta Leather Co. — Artisan Leather Goods E-Commerce Platform

A production-grade, full-stack artisan leather goods e-commerce platform built with **React 19**, **TanStack Start (SSR / Vite / Nitro)**, **Tailwind CSS v4**, **NestJS**, **Drizzle ORM**, and **Neon PostgreSQL**.

---

## 📖 Table of Contents
- [Overview & Architecture](#-overview--architecture)
- [How the System Works](#-how-the-system-works)
- [All Pages & Routes Sitemap](#-all-pages--routes-sitemap)
- [Key Features & Capabilities](#-key-features--capabilities)
- [Repository Structure](#-repository-structure)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Variables](#-environment-variables)
- [Deployment Guide](#-deployment-guide)

---

## 🏛 Overview & Architecture

Terracotta Leather Co. is structured as a monorepo consisting of two interconnected services:

1. **Frontend Storefront & Admin Portal (`artisan-leather-goods-main`)**:
   - Built with **React 19** and **TanStack Start** for server-side rendering (SSR), file-based routing, and sub-100ms page delivery via Nitro.
   - Styled with **Tailwind CSS v4** in a warm, artisanal leather palette (terracotta cognac `#8C4A32`, rich tan, warm cream `#FDFBF7`, and dark ink).
   - Fully interactive components powered by Radix UI and Lucide icons.

2. **Backend REST API (`tanner-co-leather-backend`)**:
   - Built with **NestJS**, **TypeScript**, and **Drizzle ORM** connected to a serverless **Neon PostgreSQL** database.
   - Comprehensive modules for Catalog, Authentication, Cart, Wishlist, Saved Addresses, Orders, Reviews, Image Uploads, and Payments.
   - Integrated with **Razorpay** for online card, UPI, and net banking payments, and **Backblaze B2 / AWS S3** for image hosting.

---

## ⚙ How the System Works

```
┌─────────────────────────────────────────────────────────────┐
│                    STOREFRONT & ADMIN UI                    │
│      (React 19 + TanStack Start SSR + Tailwind CSS v4)      │
└───────────────▲─────────────────────────────▲───────────────┘
                │                             │
       REST API │ (Bearer JWT)       Razorpay │ Payment Modal
                ▼                             ▼
┌───────────────────────────────┐     ┌───────────────────────┐
│     NESTJS REST BACKEND       │     │   RAZORPAY GATEWAY    │
│  (Auth, Orders, Admin, Image) │◄────┤  (Cards, UPI, NetB)   │
└───────────────┬───────────────┘     └───────────────────────┘
                │
                ├─────────────────────────────┐
                ▼                             ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│        NEON POSTGRESQL        │   │    BACKBLAZE B2 / S3    │
│   (Users, Orders, Catalog)    │   │  (Presigned CDN Upload) │
└───────────────────────────────┘   └─────────────────────────┘
```

1. **Browsing & Cart**: Patrons browse collections with instant client-side and server-rendered catalogs. Guest users receive a unique session cart ID, which automatically merges upon login.
2. **Checkout Flow**: Customers select or add shipping addresses (`/account`), apply discount coupon codes, and choose between **Cash on Delivery (COD)** or **Razorpay Online Payment**.
3. **Razorpay Online Payments**: Razorpay checkout initializes dynamically with signature validation (`HMAC SHA-256`) on the backend before order confirmation.
4. **Order Fulfillment & Lifecycle**: Once placed, orders enter the tracking pipeline (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`) where admins assign carrier tracking IDs.
5. **Customer Reviews**: Patrons submit star ratings and reviews which are held in a moderation queue for administrator approval.
6. **Administrator Control**: Admins manage products, categories, stock, orders, reviews, and customer accounts directly from `/admin`.

---

## 🗺 All Pages & Routes Sitemap

The frontend application includes **10 core routes**:

| Route / Page | URL Path | Description & Capabilities |
| :--- | :--- | :--- |
| **Homepage** | `/` | Hero section, category row, promo banner cards, featured best-sellers, brand craftsmanship story, trust badges, and newsletter signup. |
| **Category Catalog** | `/category/$slug` | Dynamic category collections (`bags`, `wallets`, `belts`, `footwear`, `travel`) with sorting (price, rating, name) and price range filters. |
| **Product Detail** | `/product/$slug` | Product imagery carousel, live stock counter, color & size variant selector, craftsmanship specs, customer review breakdown, and "Write Review" modal. |
| **Cart** | `/cart` | Full cart review page with quantity adjusters, variant switchers, order subtotal, and checkout CTA. |
| **Checkout** | `/checkout` | 1-Click saved address selector, new address creator, coupon code input, and Razorpay / COD payment gateway. |
| **Order Confirmed** | `/order-confirmed` | Post-checkout success screen showing order ID, items breakdown, shipping address, and tracking link. |
| **Order Tracker** | `/orders` | Real-time order progress timeline with milestone statuses, carrier tracking links, and chronological order history. |
| **Wishlist** | `/wishlist` | Saved patron favorites with instant 1-click "Move to Cart" actions. |
| **Customer Account** | `/account` | Patron profile details (name, email, phone) and multi-address shipping book with default address toggles. |
| **Admin Portal** | `/admin` | Complete store manager featuring Dashboard KPIs, Products CRUD, Categories CRUD, Order fulfillment, Review moderation, and Customer directory. |

---

## ✨ Key Features & Capabilities

### 🛍️ E-Commerce Storefront
- **Dynamic Variant Engine**: Live price and stock updates when switching product colors (Cognac Tan, Espresso, Matte Black) and sizes.
- **Customer Ratings & Reviews**: 5-star distribution graphs, verified buyer badges, user reviews feed, and modal review submission.
- **Slideout Cart Drawer & Page**: Slideout cart drawer accessible from anywhere on the site with real-time total updates.
- **Server-Synced Wishlist**: Saved items persist across devices when logged into patron accounts.

### 💳 Checkout & Payments
- **Razorpay Online Payment Gateway**: Supports Indian & international Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), and NetBanking.
- **1-Click Address Selector**: Automatically pulls saved patron addresses for instant checkout.
- **Coupon Code Engine**: Percentage and fixed discount codes (e.g. `WELCOME10`, `FESTIVE500`).

### 🚚 Order Tracking & Notifications
- **Visual Progress Bar**: Visual milestone indicator from pending to delivered.
- **Carrier Tracking**: Displays courier partner name and tracking number with 1-click clipboard copy.

### 🛡️ Admin Portal (`/admin`)
- **Dashboard Metrics**: Real-time sales revenue, today's order count, VIP customer tally, and low-stock variant warnings.
- **Product Management**: Create, edit, and delete products, manage inventory variants, and upload images.
- **Category Management**: Create and reorganize store categories with custom slugs, banners, and icons.
- **Order Fulfillment**: Update order states, add tracking numbers, and view customer invoice breakdowns.
- **Review Moderation**: Approve pending customer reviews before publishing live to the storefront.
- **Customer Directory**: View patron profiles, total orders count, lifetime spend, restrict/unblock access, or promote to administrator.

---

## 📁 Repository Structure

```
artisan-leather-goods/
├── artisan-leather-goods-main/          # Frontend Application (TanStack Start + React 19)
│   ├── src/
│   │   ├── assets/                      # High-res local product photography assets
│   │   ├── components/
│   │   │   ├── admin/                   # Admin CRUD modals & customer dossier dialogs
│   │   │   ├── layout/                  # SiteHeader, Footer, Navigation
│   │   │   ├── review/                  # ReviewModal, ReviewList, StarRating
│   │   │   └── ui/                      # Radix UI components (Dialog, Dropdown, Button, etc.)
│   │   ├── data/                        # Static fallback catalog & INR currency formatters
│   │   ├── lib/
│   │   │   ├── api.ts                   # Type-safe API client for backend communication
│   │   │   ├── store.ts                 # Client state store (Zustand/Context)
│   │   │   └── utils.ts                 # Utility functions (cn, clsx)
│   │   ├── routes/                      # TanStack file-based routes
│   │   │   ├── index.tsx                # Homepage
│   │   │   ├── category.$slug.tsx       # Category catalog
│   │   │   ├── product.$slug.tsx        # Product detail page
│   │   │   ├── cart.tsx                 # Shopping cart
│   │   │   ├── checkout.tsx             # Checkout & Razorpay
│   │   │   ├── order-confirmed.tsx      # Order confirmation
│   │   │   ├── orders.tsx               # Order tracking timeline
│   │   │   ├── wishlist.tsx             # Saved wishlist
│   │   │   ├── account.tsx              # Customer profile & addresses
│   │   │   └── admin.tsx                # Admin control center
│   │   ├── main.tsx                     # React root mount
│   │   └── routeTree.gen.ts             # Auto-generated TanStack route tree
│   ├── package.json
│   └── vite.config.ts
│
├── tanner-co-leather-backend/           # Backend API Service (NestJS + Drizzle)
│   └── leather-goods-nest/
│       ├── src/
│       │   ├── admin/                   # Admin dashboard & customer management
│       │   ├── auth/                    # JWT auth, bcrypt hashing, Google OAuth
│       │   ├── cart/                    # Cart & guest session persistence
│       │   ├── categories/              # Category CRUD
│       │   ├── checkout/                # Checkout & address resolution
│       │   ├── coupons/                 # Coupon discount validation
│       │   ├── database/                # Drizzle schema definitions & seed scripts
│       │   ├── mail/                    # Transactional email service (Resend)
│       │   ├── orders/                  # Order placement & fulfillment
│       │   ├── payments/                # Razorpay order generation & verification
│       │   ├── products/                # Product catalog & variant queries
│       │   ├── reviews/                 # Customer reviews & moderation
│       │   ├── upload/                  # S3/B2 presigned image uploads
│       │   ├── users/                   # Profile & saved address management
│       │   ├── wishlist/                # Saved patron wishlist
│       │   └── main.ts                  # NestJS bootstrap entrypoint
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore                           # Repository-wide ignore rules
└── README.md                            # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **PostgreSQL Database**: Neon serverless Postgres or local PostgreSQL instance.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/amohdanas125/artisan-leather-goods.git
cd artisan-leather-goods
```

---

### Step 2: Set Up & Start Backend
1. Navigate to the backend directory:
   ```bash
   cd tanner-co-leather-backend/leather-goods-nest
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Configure your `DATABASE_URL` and `JWT_SECRET` in `.env`.
5. Start the backend server:
   ```bash
   npm run start:dev
   ```
   *The backend will be available at `http://localhost:4000/api`.*

---

### Step 3: Set Up & Start Frontend
1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd artisan-leather-goods-main
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The storefront will be live at `http://localhost:8080` (or `http://localhost:3000`).*

---

### 🔑 Default Administrator Credentials
- **Admin Email**: `admin@tannerandco.com`
- **Admin Password**: `Admin@12345`
- **Admin Portal**: Open `http://localhost:8080/admin` in your browser.

---

## 🔐 Environment Variables

### Backend (`tanner-co-leather-backend/leather-goods-nest/.env`)
```ini
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# Neon PostgreSQL Database
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# JWT Secret
JWT_SECRET="your-strong-random-secret-key"
JWT_EXPIRES_IN="7d"

# Backblaze B2 / AWS S3 (Image Uploads)
B2_APPLICATION_KEY_ID=""
B2_APPLICATION_KEY=""
B2_BUCKET_NAME="LeatherGoods"
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
B2_REGION="us-east-005"
B2_PUBLIC_URL_BASE=""

# Payments (Razorpay)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# Transactional Email (Resend)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Terracotta Leather Co. <no-reply@tannerandco.com>"
```

### Frontend (`artisan-leather-goods-main/.env`)
```ini
# Backend API Base URL
VITE_API_URL="http://localhost:4000/api"
```

---

## 🌐 Deployment Guide

### Deploying the Backend (Render / Railway / AWS / Docker)
* **Build Command**: `npm run build`
* **Start Command**: `node dist/main.js`
* Set all production environment variables listed above.

### Deploying the Frontend (Cloudflare Pages / Vercel / Netlify)
* **Build Command**: `npm run build`
* **Output Directory**: `.output/public` (or `.output` for Cloudflare Workers)
* **Environment Variable**: `VITE_API_URL=https://your-production-backend-api.com/api`

---

## 📄 License
This project is licensed under the MIT License. Handcrafted with passion for artisan leather goods.
