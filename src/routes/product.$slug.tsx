import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronRight, Heart, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";

import { NewsletterBand } from "@/components/NewsletterBand";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustStrip } from "@/components/TrustStrip";
import {
  categoryLabel,
  discountPct,
  getProduct,
  inr,
  productsByCategory,
} from "@/data/catalog";
import { track } from "@/lib/analytics";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.product;
    if (!p) {
      return {
        meta: [{ title: "Product unavailable — Terracotta" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${p.name} — ${inr(p.price)} | Terracotta Leather`;
    return {
      meta: [
        { title },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: p.description.slice(0, 155) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            brand: { "@type": "Brand", name: "Terracotta" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.reviews,
            },
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, isWished, toggleWish } = useStore();

  const [color, setColor] = useState(product.colors[0]!);
  const [size, setSize] = useState(product.sizes[0]!);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(product.gallery[0]!);

  useEffect(() => {
    setColor(product.colors[0]!);
    setSize(product.sizes[0]!);
    setQty(1);
    setActiveImg(product.gallery[0]!);
    track("view_item", {
      item_id: product.slug,
      item_name: product.name,
      item_category: product.category,
      value: product.price,
      currency: "INR",
    });
  }, [product]);

  const related = productsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <nav className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          to="/category/$slug"
          params={{ slug: product.category }}
          className="hover:text-primary"
        >
          {categoryLabel(product.category)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 lg:grid-cols-2">
        <div>
          <img
            src={activeImg}
            alt={product.name}
            width={1200}
            height={1200}
            className="aspect-square w-full rounded-3xl object-cover shadow-product"
          />
          <div className="mt-4 flex gap-3">
            {product.gallery.map((g, i) => (
              <button
                key={g + i}
                onClick={() => setActiveImg(g)}
                aria-label={`View image ${i + 1}`}
                className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                  activeImg === g ? "border-primary" : "border-border"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {categoryLabel(product.category)}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-ink lg:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
              <Star className="h-3.5 w-3.5 fill-current" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">{product.reviews} verified reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-primary">{inr(product.price)}</span>
            <span className="text-base text-muted-foreground line-through">
              {inr(product.mrp)}
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {discountPct(product)}% OFF
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-7">
            <p className="text-sm font-bold text-ink">
              Colour: <span className="font-medium text-muted-foreground">{color}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    color === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-secondary-foreground hover:border-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-bold text-ink">
              Size: <span className="font-medium text-muted-foreground">{size}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-14 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-secondary-foreground hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-full border border-border bg-card">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-full w-11 text-lg font-bold text-primary"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="h-full w-11 text-lg font-bold text-primary"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                addToCart(product.slug, { qty, color, size });
                toast.success("Added to cart", { description: `${product.name} · ${color} · ${size}` });
              }}
              className="h-12 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Add to Cart
            </button>

            <button
              onClick={() => toggleWish(product.slug)}
              className="flex h-12 items-center gap-2 rounded-full border-2 border-primary px-6 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Heart className={`h-4 w-4 ${isWished(product.slug) ? "fill-current" : ""}`} />
              {isWished(product.slug) ? "Saved" : "Wishlist"}
            </button>
          </div>

          <ul className="mt-8 space-y-2 rounded-2xl border border-border bg-cream p-5">
            {product.details.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-secondary-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {d}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Free shipping over ₹2,999" },
              { icon: RotateCcw, label: "7-day easy returns" },
              { icon: ShieldCheck, label: "Lifetime stitch warranty" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs font-semibold text-secondary-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <h2 className="mb-6 text-2xl font-extrabold text-ink">You May Also Like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} listName="related_products" />
            ))}
          </div>
        </section>
      )}

      <TrustStrip />
      <NewsletterBand source="product_detail" />
      <SiteFooter />
    </div>
  );
}
