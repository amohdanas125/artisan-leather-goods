import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { inr } from "@/data/catalog";
import { track } from "@/lib/analytics";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Terracotta Leather" },
      { name: "description", content: "Complete your Terracotta leather goods order securely." },
      { property: "og:title", content: "Secure Checkout — Terracotta Leather" },
      { property: "og:description", content: "Complete your order securely." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const field =
  "h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary";

function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, hydrated, subtotal, shipping, tax, total, clearCart } = useStore();
  const [payment, setPayment] = useState("card");
  const [placing, setPlacing] = useState(false);

  if (hydrated && lines.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-ink">Nothing to check out</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
          <Link
            to="/category/$slug"
            params={{ slug: "bags" }}
            className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
          >
            Start Shopping
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-extrabold text-ink">Checkout</h1>

        <form
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (placing) return;
            setPlacing(true);
            const data = new FormData(e.currentTarget);
            const orderId = `TC-${Math.floor(100000 + Math.random() * 900000)}`;
            track("purchase", {
              transaction_id: orderId,
              value: total,
              tax,
              shipping,
              currency: "INR",
              payment_type: payment,
              items: lines.map((l) => ({
                item_id: l.slug,
                item_name: l.product.name,
                price: l.product.price,
                quantity: l.qty,
              })),
            });
            const summary = {
              orderId,
              email: String(data.get("email") ?? ""),
              name: `${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}`.trim(),
              address: [data.get("address"), data.get("city"), data.get("pincode")]
                .filter(Boolean)
                .join(", "),
              payment,
              subtotal,
              shipping,
              tax,
              total,
              items: lines.map((l) => ({
                name: l.product.name,
                qty: l.qty,
                color: l.color,
                size: l.size,
                lineTotal: l.lineTotal,
              })),
            };
            window.sessionStorage.setItem("terracotta.lastOrder", JSON.stringify(summary));
            clearCart();
            navigate({ to: "/order-confirmed" });
          }}
        >
          <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-ink">Contact</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input name="email" type="email" required placeholder="Email address" className={`${field} sm:col-span-2`} />
                <input name="phone" type="tel" required placeholder="Phone number" className={`${field} sm:col-span-2`} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-ink">Shipping Address</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input name="firstName" required placeholder="First name" className={field} />
                <input name="lastName" required placeholder="Last name" className={field} />
                <input name="address" required placeholder="Street address" className={`${field} sm:col-span-2`} />
                <input name="city" required placeholder="City" className={field} />
                <input name="state" required placeholder="State" className={field} />
                <input name="pincode" required placeholder="PIN code" pattern="[0-9]{6}" className={field} />
                <input name="country" defaultValue="India" className={field} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-ink">Payment</h2>
              <div className="mt-4 space-y-3">
                {[
                  { id: "card", label: "Credit / Debit Card" },
                  { id: "upi", label: "UPI" },
                  { id: "cod", label: "Cash on Delivery (+₹49)" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${
                      payment === m.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                      className="accent-[oklch(0.47_0.09_55)]"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
              {payment === "card" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input required placeholder="Card number" inputMode="numeric" className={`${field} sm:col-span-2`} />
                  <input required placeholder="MM / YY" className={field} />
                  <input required placeholder="CVV" inputMode="numeric" className={field} />
                </div>
              )}
              {payment === "upi" && (
                <input required placeholder="yourname@upi" className={`${field} mt-4`} />
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-cream p-6 shadow-card lg:sticky lg:top-32">
            <h2 className="text-lg font-extrabold text-ink">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={`${l.slug}-${l.color}-${l.size}`} className="flex gap-3">
                  <img
                    src={l.product.img}
                    alt=""
                    width={80}
                    height={80}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-ink">{l.product.name}</p>
                    <p className="text-muted-foreground">
                      {l.color} · {l.size} · Qty {l.qty}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">{inr(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
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
            <button
              type="submit"
              disabled={placing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark disabled:opacity-70"
            >
              <Lock className="h-4 w-4" />
              {placing ? "Placing order…" : `Place Order · ${inr(total)}`}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Secure 256-bit encrypted payment · 7-day returns
            </p>
          </aside>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
