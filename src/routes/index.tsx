import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Briefcase,
  Footprints,
  Luggage,
  ShoppingBag,
  Sparkles,
  Shirt,
  Wallet,
  Watch,
} from "lucide-react";

import { NewsletterBand } from "@/components/NewsletterBand";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustStrip } from "@/components/TrustStrip";
import { bestSellers } from "@/data/catalog";
import { track } from "@/lib/analytics";

import heroImg from "@/assets/hero-leather.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import beltImg from "@/assets/p-belt.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import cardholderImg from "@/assets/p-cardholder.jpg";

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
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Terracotta Leather Co.",
          description:
            "Handcrafted full-grain leather bags, wallets, belts, footwear and travel goods since 1998.",
          currenciesAccepted: "INR",
          url: "/",
        }),
      },
    ],
  }),
  component: Index,
});

const categoryTiles = [
  { label: "Bags & Totes", slug: "bags", icon: ShoppingBag },
  { label: "Wallets & Cardholders", slug: "wallets", icon: Wallet },
  { label: "Belts", slug: "belts", icon: Watch },
  { label: "Jackets & Outerwear", slug: "bags", icon: Shirt },
  { label: "Footwear", slug: "footwear", icon: Footprints },
  { label: "Travel & Duffels", slug: "travel", icon: Luggage },
  { label: "Accessories", slug: "wallets", icon: Briefcase },
] as const;

const offers = [
  { badge: "UP TO 30% OFF", title: "Wallets & Cardholders", img: walletImg, slug: "wallets" },
  { badge: "FREE SHIPPING", title: "On Orders Above ₹2,999", img: cardholderImg, slug: "wallets" },
  { badge: "UP TO 25% OFF", title: "Travel Bags & Duffels", img: duffelImg, slug: "travel" },
  { badge: "₹500 OFF", title: "On Your First Order", img: beltImg, slug: "belts" },
] as const;

function Index() {
  useEffect(() => {
    track("view_home", { page: "home" });
    track("view_item_list", {
      item_list_name: "home_best_sellers",
      item_count: bestSellers.length,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

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
              <Link
                to="/category/$slug"
                params={{ slug: "bags" }}
                onClick={() => track("cta_click", { cta: "hero_shop_now" })}
                className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Shop Now
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "travel" }}
                onClick={() => track("cta_click", { cta: "hero_view_collection" })}
                className="rounded-full border-2 border-primary px-7 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                View Collection
              </Link>
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
          {categoryTiles.map(({ label, slug, icon: Icon }) => (
            <Link
              key={label}
              to="/category/$slug"
              params={{ slug }}
              className="group flex w-24 flex-col items-center gap-3 text-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon
                  className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground"
                  strokeWidth={1.5}
                />
              </span>
              <span className="text-xs font-semibold leading-tight text-secondary-foreground">
                {label}
              </span>
            </Link>
          ))}
          <Link
            to="/category/$slug"
            params={{ slug: "bags" }}
            className="flex w-24 flex-col items-center gap-3 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary text-primary">
              <span className="text-lg font-bold">→</span>
            </span>
            <span className="text-xs font-semibold leading-tight text-primary">
              View All Categories
            </span>
          </Link>
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
              <Link
                to="/category/$slug"
                params={{ slug: o.slug }}
                onClick={() => track("promo_click", { promo: o.badge, title: o.title })}
                className="mt-3 inline-block text-sm font-bold text-primary hover:text-primary-dark"
              >
                Shop Now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Best selling products */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-ink">Best Selling Products</h2>
          <Link
            to="/category/$slug"
            params={{ slug: "bags" }}
            className="text-sm font-bold text-primary hover:text-primary-dark"
          >
            View All Products →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.slug} product={p} listName="home_best_sellers" />
          ))}
        </div>
      </section>

      <TrustStrip />
      <NewsletterBand source="homepage" />
      <SiteFooter />
    </div>
  );
}
