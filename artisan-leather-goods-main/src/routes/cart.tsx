import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Trash2 } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { inr } from "@/data/catalog";
import { track } from "@/lib/analytics";
import { SHIPPING_THRESHOLD, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Terracotta Leather" },
      { name: "description", content: "Review your handcrafted leather goods before checkout." },
      { property: "og:title", content: "Your Cart — Terracotta Leather" },
      { property: "og:description", content: "Review your cart at Terracotta Leather." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cart" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, hydrated, setQty, removeFromCart, subtotal, shipping, tax, total } = useStore();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-extrabold text-ink">Shopping Cart</h1>

        {hydrated && lines.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-14 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-semibold text-ink">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a wallet, belt or tote and it'll show up here.
            </p>
            <Link
              to="/category/$slug"
              params={{ slug: "bags" }}
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {lines.map((l) => (
                <div
                  key={`${l.slug}-${l.color}-${l.size}`}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <Link to="/product/$slug" params={{ slug: l.slug }} className="shrink-0">
                    <img
                      src={l.product.img}
                      alt={l.product.name}
                      width={160}
                      height={160}
                      className="h-28 w-28 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to="/product/$slug"
                          params={{ slug: l.slug }}
                          className="text-sm font-bold text-ink hover:text-primary"
                        >
                          {l.product.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {l.color} · {l.size}
                        </p>
                      </div>
                      <button
                        aria-label="Remove item"
                        onClick={() => removeFromCart(l.slug, l.color, l.size)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex h-10 items-center rounded-full border border-border">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(l.slug, l.color, l.size, l.qty - 1)}
                          className="h-full w-10 text-lg font-bold text-primary"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{l.qty}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(l.slug, l.color, l.size, l.qty + 1)}
                          className="h-full w-10 text-lg font-bold text-primary"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold text-primary">{inr(l.lineTotal)}</p>
                        <p className="text-xs text-muted-foreground line-through">
                          {inr(l.product.mrp * l.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-32">
              <h2 className="text-lg font-extrabold text-ink">Order Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold text-ink">{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-semibold text-ink">
                    {shipping === 0 ? "Free" : inr(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GST (12%)</dt>
                  <dd className="font-semibold text-ink">{inr(tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-extrabold text-ink">Total</dt>
                  <dd className="font-extrabold text-primary">{inr(total)}</dd>
                </div>
              </dl>

              {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
                <p className="mt-4 rounded-xl bg-primary/10 p-3 text-xs font-semibold text-primary">
                  Add {inr(SHIPPING_THRESHOLD - subtotal)} more for free shipping.
                </p>
              )}

              <Link
                to="/checkout"
                onClick={() =>
                  track("begin_checkout", {
                    value: total,
                    currency: "INR",
                    items: lines.map((l) => l.slug),
                  })
                }
                className="mt-6 block rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground hover:bg-primary-dark"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="mt-3 block text-center text-xs font-bold text-primary hover:text-primary-dark"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
