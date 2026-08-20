import { createFileRoute } from "@tanstack/react-router";
import {
  Backpack,
  Briefcase,
  ChevronDown,
  Facebook,
  Footprints,
  Headphones,
  Heart,
  Instagram,
  Luggage,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Shirt,
  Sparkles,
  Star,
  User,
  Wallet,
  Watch,
  Youtube,
} from "lucide-react";

import heroImg from "@/assets/hero-leather.jpg";
import toteImg from "@/assets/p-tote.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import beltImg from "@/assets/p-belt.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import cardholderImg from "@/assets/p-cardholder.jpg";
import crossbodyImg from "@/assets/p-crossbody.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terracotta — Handcrafted Full-Grain Leather Goods" },
      {
        name: "description",
        content:
          "Shop handcrafted full-grain leather bags, wallets, belts, footwear and travel goods. Free shipping above ₹2,999 and a lifetime warranty.",
      },
      { property: "og:title", content: "Terracotta — Handcrafted Full-Grain Leather Goods" },
      {
        property: "og:description",
        content:
          "Premium leather bags, wallets, belts and travel essentials, hand-stitched since 1998.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const navLinks = [
  "Home",
  "Categories",
  "New Arrivals",
  "Combo Sets",
  "Brands",
  "Care Guide",
  "Contact Us",
];

const categories = [
  { label: "Bags & Totes", icon: ShoppingBag },
  { label: "Wallets & Cardholders", icon: Wallet },
  { label: "Belts", icon: Watch },
  { label: "Jackets & Outerwear", icon: Shirt },
  { label: "Footwear", icon: Footprints },
  { label: "Travel & Duffels", icon: Luggage },
  { label: "Accessories", icon: Briefcase },
];

const offers = [
  { badge: "UP TO 30% OFF", title: "Wallets & Cardholders", img: walletImg },
  { badge: "FREE SHIPPING", title: "On Orders Above ₹2,999", img: cardholderImg },
  { badge: "UP TO 25% OFF", title: "Travel Bags & Duffels", img: duffelImg },
  { badge: "₹500 OFF", title: "On Your First Order", img: beltImg },
];

const products = [
  { name: "Marlow Full-Grain Tote", mrp: "₹9,499", price: "₹6,799", img: toteImg, rating: "4.8" },
  { name: "Ashcroft Bifold Wallet", mrp: "₹3,299", price: "₹2,199", img: walletImg, rating: "4.9" },
  { name: "Hand-Braided Tan Belt", mrp: "₹2,899", price: "₹1,949", img: beltImg, rating: "4.7" },
  { name: "Voyager Weekender Duffel", mrp: "₹14,999", price: "₹11,499", img: duffelImg, rating: "4.9" },
  { name: "Slimline Card Holder", mrp: "₹1,899", price: "₹1,299", img: cardholderImg, rating: "4.6" },
  { name: "Hawthorn Crossbody Bag", mrp: "₹8,499", price: "₹5,999", img: crossbodyImg, rating: "4.8" },
];

const trust = [
  { label: "100% Genuine Leather", icon: ShieldCheck },
  { label: "Secure Payments", icon: Wallet },
  { label: "Easy 7-Day Returns", icon: RotateCcw },
  { label: "24/7 Support", icon: Headphones },
];

const footerCols = [
  { title: "Shop", links: ["All Bags", "Wallets", "Belts", "Footwear", "New Arrivals"] },
  {
    title: "Customer Service",
    links: ["Track Order", "Shipping & Returns", "Leather Care Guide", "FAQs", "Contact Us"],
  },
  {
    title: "My Account",
    links: ["Login / Sign Up", "Order History", "Wishlist", "Saved Addresses", "Gift Cards"],
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top utility bar */}
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:text-[13px]">
          <span>Free Shipping on Orders Above ₹2,999</span>
          <span className="hidden text-accent sm:block">
            Handcrafted Leather Goods Since 1998
          </span>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
          <a href="#" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Briefcase className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
              Terra<span className="text-ink">cotta</span>
            </span>
          </a>

          <button className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary lg:flex">
            Find a Store
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for bags, wallets, belts..."
              className="h-11 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="flex shrink-0 items-center gap-5 text-sm font-medium">
            <button className="flex items-center gap-2 hover:text-primary">
              <User className="h-5 w-5" strokeWidth={1.8} />
              <span className="hidden sm:inline">Login / Sign Up</span>
            </button>
            <button className="relative hover:text-primary">
              <Heart className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button className="relative flex items-center gap-2 hover:text-primary">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                2
              </span>
            </button>
          </div>
        </div>

        {/* Second row */}
        <div className="border-t border-border bg-cream">
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2.5">
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Shop by Category
              <ChevronDown className="h-4 w-4" />
            </button>
            <nav className="flex items-center gap-6 whitespace-nowrap text-sm font-medium text-secondary-foreground">
              {navLinks.map((l) => (
                <a key={l} href="#" className="hover:text-primary">
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-primary">
              FULL-GRAIN. HAND-STITCHED.
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] text-ink lg:text-6xl">
              Leather Crafted
              <br />
              to Last a Lifetime
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Everything from everyday carry to travel essentials — made from full-grain
              leather that only gets better with age.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark">
                Shop Now
              </button>
              <button className="rounded-full border-2 border-primary px-7 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                View Collection
              </button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Full-grain leather tote with wallet, card holder and braided belt"
              width={1200}
              height={1104}
              className="w-full rounded-3xl object-cover shadow-product"
            />
            <div className="absolute -right-2 -top-6 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-accent text-center text-accent-foreground shadow-card lg:h-32 lg:w-32">
              <Sparkles className="mb-1 h-5 w-5" />
              <span className="px-3 text-[11px] font-extrabold uppercase leading-tight tracking-wide">
                100% Genuine Leather
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category icon row */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:justify-between">
          {categories.map(({ label, icon: Icon }) => (
            <a key={label} href="#" className="group flex w-24 flex-col items-center gap-3 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-semibold leading-tight text-secondary-foreground">
                {label}
              </span>
            </a>
          ))}
          <a href="#" className="flex w-24 flex-col items-center gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary text-primary">
              <span className="text-lg font-bold">→</span>
            </span>
            <span className="text-xs font-semibold leading-tight text-primary">
              View All Categories
            </span>
          </a>
        </div>
      </section>

      {/* Top offers */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="mb-6 text-2xl font-extrabold text-ink">Top Offers For You</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((o) => (
            <div
              key={o.badge + o.title}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold uppercase text-accent-foreground">
                {o.badge}
              </span>
              <img
                src={o.img}
                alt={o.title}
                loading="lazy"
                width={640}
                height={640}
                className="mx-auto h-40 w-40 rounded-xl object-cover"
              />
              <p className="mt-4 text-sm font-semibold text-ink">{o.title}</p>
              <button className="mt-3 text-sm font-bold text-primary hover:text-primary-dark">
                Shop Now →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Best selling products */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-ink">Best Selling Products</h2>
          <a href="#" className="text-sm font-bold text-primary hover:text-primary-dark">
            View All Products →
          </a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {products.map((p) => (
            <div
              key={p.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                width={640}
                height={640}
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-1 text-xs font-semibold text-accent-foreground">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {p.rating}
                </div>
                <p className="mt-1 flex-1 text-sm font-semibold leading-snug text-ink">
                  {p.name}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-primary">{p.price}</span>
                  <span className="text-xs text-muted-foreground line-through">{p.mrp}</span>
                </div>
                <button className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-dark">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center justify-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <span className="text-sm font-semibold text-ink">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 lg:flex-row">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-extrabold text-primary-foreground">
              Stay Updated with Best Offers
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/75">
              New drops, care tips and members-only pricing — straight to your inbox.
            </p>
          </div>
          <form
            className="flex w-full max-w-md gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="h-12 flex-1 rounded-full bg-card px-5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="h-12 rounded-full bg-accent px-7 text-sm font-bold text-accent-foreground">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-4">
            <div>
              <span className="font-display text-2xl font-extrabold text-accent">
                Terracotta
              </span>
              <p className="mt-3 max-w-xs text-sm text-ink-foreground/70">
                Hand-stitched full-grain leather goods, made in small batches since 1998.
              </p>
              <div className="mt-5 flex gap-3">
                <a href="#" className="flex h-9 items-center gap-2 rounded-lg border border-ink-foreground/25 px-3 text-xs">
                  <Play className="h-3.5 w-3.5" /> Google Play
                </a>
                <a href="#" className="flex h-9 items-center gap-2 rounded-lg border border-ink-foreground/25 px-3 text-xs">
                  <Backpack className="h-3.5 w-3.5" /> App Store
                </a>
              </div>
            </div>
            {footerCols.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-accent">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-accent">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-foreground/15 pt-6 sm:flex-row">
            <p className="text-xs text-ink-foreground/60">
              © 2026 Terracotta Leather Co. All rights reserved.
            </p>
            <div className="flex gap-4 text-ink-foreground/70">
              <a href="#" aria-label="Instagram" className="hover:text-accent">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-accent">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-accent">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
