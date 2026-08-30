import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

import { NewsletterBand } from "@/components/NewsletterBand";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustStrip } from "@/components/TrustStrip";
import { categories, inr, productsByCategory, type CategorySlug } from "@/data/catalog";
import { track } from "@/lib/analytics";

const PRICE_BANDS = [
  { id: "all", label: "All prices", test: () => true },
  { id: "u2000", label: "Under ₹2,000", test: (n: number) => n < 2000 },
  { id: "2-6k", label: "₹2,000 – ₹6,000", test: (n: number) => n >= 2000 && n <= 6000 },
  { id: "6-12k", label: "₹6,000 – ₹12,000", test: (n: number) => n > 6000 && n <= 12000 },
  { id: "o12k", label: "Above ₹12,000", test: (n: number) => n > 12000 },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "discount", label: "Biggest Discount" },
];

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category, items: productsByCategory(params.slug as CategorySlug) };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.category;
    if (!c) {
      return {
        meta: [
          { title: "Category unavailable — Terracotta" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${c.label} — Handcrafted Leather | Terracotta`;
    return {
      meta: [
        { title },
        { name: "description", content: c.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: c.blurb },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/category/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              {
                "@type": "ListItem",
                position: 2,
                name: c.label,
                item: `/category/${params.slug}`,
              },
            ],
          }),
        },
      ],
    };
  },
  component: CategoryPage,
});

import { useStore } from "@/lib/store";

function CategoryPage() {
  const loaderData = Route.useLoaderData();
  const { products, categories: storeCategories } = useStore();

  const category =
    storeCategories.find((c) => c.slug === loaderData.category.slug) ?? loaderData.category;
  const defaultCategoryImg = categories.find((c) => c.slug === category.slug)?.img;
  const bannerImg =
    category.img && !category.img.includes("hero-leather")
      ? category.img
      : (defaultCategoryImg || category.img);

  const items = useMemo(() => {
    const fromStore = products.filter((p) => p.category === category.slug);
    return fromStore.length > 0 ? fromStore : loaderData.items;
  }, [products, category.slug, loaderData.items]);

  const [band, setBand] = useState("all");
  const [sort, setSort] = useState("featured");
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const allColors = useMemo(() => Array.from(new Set(items.flatMap((p) => p.colors))), [items]);

  useEffect(() => {
    setBand("all");
    setSort("featured");
    setColorFilter([]);
    setMinRating(0);
  }, [category.slug]);

  const filtered = useMemo(() => {
    const test = PRICE_BANDS.find((b) => b.id === band)!.test;
    const list = items.filter(
      (p) =>
        test(p.price) &&
        p.rating >= minRating &&
        (colorFilter.length === 0 || p.colors.some((c) => colorFilter.includes(c))),
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "discount")
      sorted.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
    return sorted;
  }, [items, band, sort, colorFilter, minRating]);

  useEffect(() => {
    track("view_item_list", {
      item_list_name: `category_${category.slug}`,
      item_count: filtered.length,
      filters: { band, sort, colors: colorFilter, minRating },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.slug, band, sort, colorFilter, minRating]);

  const toggleColor = (c: string) =>
    setColorFilter((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <nav className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">{category.label}</span>
      </nav>

      <section className="bg-card border-b border-border/40">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-ink lg:text-5xl">
              {category.label}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {category.blurb}
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {items.length} products · free shipping above ₹2,999
            </p>
          </div>
          <div className="hidden justify-end lg:flex">
            <img
              src={bannerImg}
              alt={category.label}
              width={640}
              height={640}
              className="h-48 w-68 rounded-3xl object-cover shadow-product xl:h-52 xl:w-72"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-7">
            <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Category
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className={`hover:text-primary ${
                        c.slug === category.slug
                          ? "font-bold text-primary"
                          : "text-secondary-foreground"
                      }`}
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Price
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {PRICE_BANDS.map((b) => (
                  <li key={b.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-secondary-foreground">
                      <input
                        type="radio"
                        name="price"
                        checked={band === b.id}
                        onChange={() => setBand(b.id)}
                        className="accent-[oklch(0.47_0.09_55)]"
                      />
                      {b.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Colour
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {allColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleColor(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      colorFilter.includes(c)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-secondary-foreground hover:border-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Rating
              </h2>
              <div className="mt-3 flex gap-2">
                {[0, 4.5, 4.7].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      minRating === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-secondary-foreground hover:border-primary"
                    }`}
                  >
                    {r === 0 ? "Any" : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setBand("all");
                setColorFilter([]);
                setMinRating(0);
              }}
              className="text-xs font-bold text-primary hover:text-primary-dark"
            >
              Clear all filters
            </button>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-ink">{filtered.length}</span> of{" "}
                {items.length} products
              </p>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold outline-none focus:border-primary"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="font-semibold text-ink">No products match these filters.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try widening the price range or clearing colours.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.slug} product={p} listName={`category_${category.slug}`} />
                ))}
              </div>
            )}

            <p className="mt-8 text-xs text-muted-foreground">
              Prices from {inr(Math.min(...items.map((p) => p.price)))} to{" "}
              {inr(Math.max(...items.map((p) => p.price)))}. All items are covered by our lifetime
              stitch warranty.
            </p>
          </div>
        </div>
      </section>

      <TrustStrip />
      <NewsletterBand source={`category_${category.slug}`} />
      <SiteFooter />
    </div>
  );
}
