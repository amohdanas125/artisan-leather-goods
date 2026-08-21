import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Package, Truck } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { inr } from "@/data/catalog";

type OrderSummary = {
  orderId: string;
  email: string;
  name: string;
  address: string;
  payment: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: { name: string; qty: number; color: string; size: string; lineTotal: number }[];
};

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Terracotta Leather" },
      { name: "description", content: "Your Terracotta leather goods order is confirmed." },
      { property: "og:title", content: "Order Confirmed — Terracotta Leather" },
      { property: "og:description", content: "Thank you for your order." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/order-confirmed" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/order-confirmed" }],
  }),
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("terracotta.lastOrder");
      if (raw) setOrder(JSON.parse(raw) as OrderSummary);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const eta = new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-4 text-3xl font-extrabold text-ink">Thank you for your order</h1>
          {loaded && !order ? (
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't find a recent order in this session.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Order <span className="font-bold text-ink">{order?.orderId ?? "…"}</span>
              {order?.email ? <> · confirmation sent to {order.email}</> : null}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-cream p-4 text-left text-xs font-semibold text-ink">
              <Package className="h-5 w-5 shrink-0 text-primary" />
              Hand-finished and dispatched within 48 hours
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-cream p-4 text-left text-xs font-semibold text-ink">
              <Truck className="h-5 w-5 shrink-0 text-primary" />
              Estimated delivery by {eta}
            </div>
          </div>
        </div>

        {order && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-lg font-extrabold text-ink">Order details</h2>
            <ul className="mt-4 divide-y divide-border">
              {order.items.map((i) => (
                <li key={`${i.name}-${i.color}-${i.size}`} className="flex justify-between py-3 text-sm">
                  <span className="text-secondary-foreground">
                    {i.name}
                    <span className="block text-xs text-muted-foreground">
                      {i.color} · {i.size} · Qty {i.qty}
                    </span>
                  </span>
                  <span className="font-bold text-ink">{inr(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-ink">{inr(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold text-ink">
                  {order.shipping === 0 ? "Free" : inr(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST (12%)</dt>
                <dd className="font-semibold text-ink">{inr(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt className="font-extrabold text-ink">Total paid</dt>
                <dd className="font-extrabold text-primary">{inr(order.total)}</dd>
              </div>
            </dl>
            {order.address && (
              <p className="mt-5 text-xs text-muted-foreground">
                Shipping to <span className="font-semibold text-ink">{order.name}</span>,{" "}
                {order.address} · Paid via {order.payment.toUpperCase()}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
          >
            Back to Home
          </Link>
          <Link
            to="/category/$slug"
            params={{ slug: "wallets" }}
            className="rounded-full border-2 border-primary px-7 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Keep Shopping
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
