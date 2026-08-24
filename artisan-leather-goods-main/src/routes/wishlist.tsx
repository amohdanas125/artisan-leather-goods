import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProduct, inr } from "@/data/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Terracotta Leather" },
      { name: "description", content: "Saved leather goods you can move to your cart anytime." },
      { property: "og:title", content: "My Wishlist — Terracotta Leather" },
      { property: "og:description", content: "Your saved Terracotta leather goods." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/wishlist" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, getProductBySlug, hydrated, toggleWish, moveToCart } = useStore();
  const items = wishlist.flatMap((slug) => {
    const p = getProductBySlug(slug) ?? getProduct(slug);
    return p ? [p] : [];
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-extrabold text-ink">My Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hydrated ? `${items.length} saved item${items.length === 1 ? "" : "s"}` : "Loading…"}
        </p>

        {hydrated && items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-14 text-center">
            <Heart className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-semibold text-ink">Nothing saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart on any product to keep it here.
            </p>
            <Link
              to="/category/$slug"
              params={{ slug: "bags" }}
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
            >
              Browse Bags
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <div
                key={p.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <Link to="/product/$slug" params={{ slug: p.slug }}>
                  <img
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                    width={640}
                    height={640}
                    className="aspect-square w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="flex-1 text-sm font-semibold text-ink hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-primary">{inr(p.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
                  </div>
                  <button
                    onClick={() => {
                      moveToCart(p.slug);
                      toast.success("Moved to cart", { description: p.name });
                    }}
                    className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-dark"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => toggleWish(p.slug)}
                    className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
