import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Heart,
  Loader2,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewsletterBand } from "@/components/NewsletterBand";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustStrip } from "@/components/TrustStrip";
import { categoryLabel, discountPct, getProduct, inr, productsByCategory } from "@/data/catalog";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api";
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
        meta: [
          { title: "Product unavailable — Terracotta" },
          { name: "robots", content: "noindex" },
        ],
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
  const loaderData = Route.useLoaderData();
  const { user, openAuthModal, addToCart, isWished, toggleWish, getProductBySlug, products } = useStore();

  const product = getProductBySlug(loaderData.product.slug) ?? loaderData.product;

  const [color, setColor] = useState(product.colors[0]!);
  const [size, setSize] = useState(product.sizes[0]!);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(product.gallery[0] ?? product.img);

  const [serverReviews, setServerReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.products
      .getBySlug(product.slug)
      .then((res) => {
        if (!cancelled && res.product?.reviews) {
          setServerReviews(res.product.reviews);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  useEffect(() => {
    setColor(product.colors[0]!);
    setSize(product.sizes[0]!);
    setQty(1);
    setActiveImg(product.gallery[0] ?? product.img);
    track("view_item", {
      item_id: product.slug,
      item_name: product.name,
      item_category: product.category,
      value: product.price,
      currency: "INR",
    });
  }, [product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please enter your review feedback.");
      return;
    }
    setSubmittingReview(true);
    try {
      let prodId = product.id;
      if (!prodId) {
        const res = await api.products.getBySlug(product.slug);
        prodId = res.product?.id;
      }
      if (!prodId) throw new Error("Product ID not found");

      const res = await api.reviews.create({
        productId: prodId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success(res.message || "Thank you! Your review has been submitted for moderation.");
      setIsReviewModalOpen(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (err: any) {
      toast.error(err.message || "You can only review products from a delivered order.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const related = useMemo(() => {
    return products
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 4);
  }, [products, product.category, product.slug]);

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
          <div className="mt-4 flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {product.gallery.map((g, i) => (
              <button
                key={g + i}
                onClick={() => setActiveImg(g)}
                aria-label={`View image ${i + 1}`}
                className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 cursor-pointer transition-colors ${
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
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Star className="h-3.5 w-3.5 fill-current" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">{product.reviews} verified reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-primary">{inr(product.price)}</span>
            <span className="text-base text-muted-foreground line-through">{inr(product.mrp)}</span>
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

          <div className="mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex h-11 sm:h-12 items-center rounded-full border border-border bg-card shrink-0">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-full w-9 sm:w-11 text-lg font-bold text-primary cursor-pointer hover:bg-muted/50 rounded-l-full"
              >
                −
              </button>
              <span className="w-7 sm:w-8 text-center text-sm font-bold">{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="h-full w-9 sm:w-11 text-lg font-bold text-primary cursor-pointer hover:bg-muted/50 rounded-r-full"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                addToCart(product.slug, { qty, color, size });
                toast.success("Added to cart", {
                  description: `${product.name} · ${color} · ${size}`,
                });
              }}
              className="h-11 sm:h-12 flex-1 min-w-[130px] rounded-full bg-primary px-5 sm:px-8 text-xs sm:text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark cursor-pointer shadow-xs"
            >
              Add to Cart
            </button>

            <button
              onClick={() => toggleWish(product.slug)}
              className="flex h-11 sm:h-12 items-center justify-center rounded-full border-2 border-primary px-4 sm:px-6 text-xs sm:text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer shrink-0"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${isWished(product.slug) ? "fill-current" : ""}`} />
              <span className="hidden sm:inline ml-1.5">{isWished(product.slug) ? "Saved" : "Wishlist"}</span>
            </button>
          </div>

          <ul className="mt-8 space-y-2 rounded-2xl border border-border/60 bg-[#F0E8DE] sm:bg-card p-5">
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

      {/* Customer Reviews & Ratings Section */}
      <section className="mx-auto max-w-7xl px-4 py-14 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Customer Reviews</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Authentic feedback and experiences from verified leather craft connoisseurs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal("login");
                toast.info("Please sign in to write a product review.");
              } else {
                setIsReviewModalOpen(true);
              }
            }}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Overview Card */}
        <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 md:grid-cols-3 mb-8 shadow-xs">
          <div className="flex flex-col items-center justify-center border-border md:border-r pr-0 md:pr-6 text-center">
            <span className="text-5xl font-black text-ink">
              {(product.rating || 4.8).toFixed(1)}
            </span>
            <div className="mt-2 flex items-center gap-1 text-accent">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i <= Math.round(product.rating || 5)
                      ? "fill-current text-accent"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Based on {serverReviews.length > 0 ? serverReviews.length : product.reviews} verified reviews
            </p>
          </div>

          <div className="md:col-span-2 flex flex-col justify-center space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = serverReviews.filter((r) => r.rating === stars).length;
              const pct =
                serverReviews.length > 0
                  ? Math.round((count / serverReviews.length) * 100)
                  : stars === 5
                    ? 85
                    : stars === 4
                      ? 15
                      : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-14 font-semibold text-muted-foreground">{stars} Stars</span>
                  <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium text-muted-foreground">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        {serverReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-bold text-ink">No customer reviews yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Purchased this handcrafted piece? Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {serverReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                      {rev.user?.name ? rev.user.name[0].toUpperCase() : "C"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{rev.user?.name || "Verified Customer"}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" /> Verified Buyer
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= rev.rating ? "fill-current text-accent" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-secondary-foreground leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Write a Review Modal Dialog */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-xl font-bold text-ink">Write a Customer Review</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share your honest feedback about <span className="font-semibold text-ink">{product.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-accent transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating ?? reviewRating)
                          ? "fill-current text-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-ink">
                  {(hoverRating ?? reviewRating)} out of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Review Comments *
              </label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How does the leather feel? How is the craftsmanship and durability?..."
                required
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <DialogFooter className="border-t border-border/60 pt-3 flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer disabled:opacity-50 transition-colors"
              >
                {submittingReview && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit Review</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <h2 className="mb-6 text-2xl font-extrabold text-ink">You May Also Like</h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
