import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Briefcase,
  Footprints,
  Luggage,
  MoveRight,
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

import { useStore } from "@/lib/store";

function Index() {
  const { products } = useStore();

  const homeBestSellers = useMemo(() => {
    const sellers = products.filter((p) => p.bestSeller);
    return sellers.length > 0 ? sellers.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  useEffect(() => {
    track("view_home", { page: "home" });
    track("view_item_list", {
      item_list_name: "home_best_sellers",
      item_count: homeBestSellers.length,
    });
  }, [homeBestSellers.length]);

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
              Everything from everyday carry to travel essentials — made from full-grain leather
              that only gets better with age.
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
            <div className="absolute right-2 -top-4 sm:-right-2 sm:-top-6 flex h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 flex-col items-center justify-center rounded-full bg-accent text-center text-accent-foreground shadow-card">
              <Sparkles className="mb-1 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="px-2 text-[10px] sm:text-[11px] font-extrabold uppercase leading-tight tracking-wide">
                100% Genuine Leather
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category icon row */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12 overflow-hidden">
        {/* Mobile-only visual scroll sign */}
        <div className="mb-3 flex items-center justify-between text-xs sm:hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Categories
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
            <span>Swipe to explore</span>
            <MoveRight className="h-3.5 w-3.5 animate-pulse" />
          </span>
        </div>

        <div className="relative">
          <div className="flex items-start gap-4 overflow-x-auto pb-4 pt-1 sm:gap-6 sm:overflow-visible sm:pb-0 sm:pt-0 sm:justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            {categoryTiles.map(({ label, slug, icon: Icon }) => (
              <Link
                key={label}
                to="/category/$slug"
                params={{ slug }}
                className="group flex w-20 shrink-0 flex-col items-center gap-2.5 text-center sm:w-24 sm:gap-3"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-20 sm:w-20">
                  <Icon
                    className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground sm:h-8 sm:w-8"
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
              className="group flex w-20 shrink-0 flex-col items-center gap-2.5 text-center sm:w-24 sm:gap-3"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-20 sm:w-20">
                <span className="text-lg font-bold">→</span>
              </span>
              <span className="text-xs font-semibold leading-tight text-primary">
                View All Categories
              </span>
            </Link>
          </div>

          {/* Right-edge fade cue on small devices */}
          <div className="pointer-events-none absolute -right-4 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />
        </div>
      </section>

      {/* Top offers */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="mb-6 text-2xl font-extrabold text-ink">Top Offers For You</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((o) => (
            <Link
              key={o.badge + o.title}
              to="/category/$slug"
              params={{ slug: o.slug }}
              onClick={() => track("promo_click", { promo: o.badge, title: o.title })}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
                <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold uppercase text-accent-foreground shadow-xs">
                  {o.badge}
                </span>
                <img
                  src={o.img}
                  alt={o.title}
                  loading="lazy"
                  width={640}
                  height={480}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <p className="text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                  {o.title}
                </p>
                <span className="mt-3 inline-block text-sm font-bold text-primary transition-colors group-hover:text-primary-dark">
                  Shop Now →
                </span>
              </div>
            </Link>
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
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {homeBestSellers.map((p) => (
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
