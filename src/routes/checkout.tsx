import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Tag, Check, X, Loader2, Plus, Building2, Home, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { inr } from "@/data/catalog";
import { track } from "@/lib/analytics";
import { api, loadRazorpaySdk, type SavedAddress } from "@/lib/api";
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
  const { lines, hydrated, subtotal, shipping, tax, total, clearCart, user, addOrder, openAuthModal } = useStore();
  const [payment, setPayment] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: string;
  } | null>(null);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingAddresses(true);
      api.account.addresses
        .getAll()
        .then((res) => {
          if (res?.addresses && res.addresses.length > 0) {
            setSavedAddresses(res.addresses);
            const def = res.addresses.find((a) => a.isDefault);
            setSelectedAddressId(def ? def.id : res.addresses[0]!.id);
          } else {
            setSelectedAddressId("new");
          }
        })
        .catch(() => setSelectedAddressId("new"))
        .finally(() => setLoadingAddresses(false));
    } else {
      setSelectedAddressId("new");
    }
  }, [user]);

  const discount = appliedCoupon?.discountAmount ?? 0;
  const grandTotal = Math.max(0, total - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await api.coupons.validate(couponCode.trim(), subtotal);
      if (res && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountAmount: res.discount,
          discountType: res.coupon.discountType,
          discountValue: res.coupon.discountValue,
        });
        toast.success(
          `Coupon "${res.coupon.code}" applied! You saved ${inr(res.discount)}`,
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to validate coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

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
          onSubmit={async (e) => {
            e.preventDefault();
            if (placing) return;

            if (!user) {
              openAuthModal("login");
              toast.info("Please sign in or register to complete your order.");
              return;
            }

            setPlacing(true);
            const data = new FormData(e.currentTarget);
            const generatedFallback = `TC-${Math.floor(100000 + Math.random() * 900000)}`;

            try {
              const chosenAddress =
                selectedAddressId !== "new"
                  ? savedAddresses.find((a) => a.id === selectedAddressId)
                  : null;

              const res = await api.checkout.placeOrder(
                chosenAddress
                  ? {
                      addressId: chosenAddress.id,
                      paymentMethod: payment === "cod" ? "cod" : "online",
                      ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
                    }
                  : {
                      newAddress: {
                        fullName:
                          `${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}`.trim() ||
                          user.name,
                        phone: String(data.get("phone") ?? user.phone ?? "+919876543210"),
                        line1: String(data.get("address") ?? ""),
                        city: String(data.get("city") ?? ""),
                        state: String(data.get("state") ?? ""),
                        pincode: String(data.get("pincode") ?? ""),
                        country: String(data.get("country") ?? "India"),
                      },
                      paymentMethod: payment === "cod" ? "cod" : "online",
                      ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
                    },
              );

              const orderNumber = res?.order?.orderNumber || generatedFallback;
              const orderDatabaseId = res?.order?.id || orderNumber;
              const finalAddressStr = chosenAddress
                ? `${chosenAddress.line1}, ${chosenAddress.city}, ${chosenAddress.pincode}`
                : [data.get("address"), data.get("city"), data.get("pincode")]
                    .filter(Boolean)
                    .join(", ");

              const finalizeSuccess = (isPaid: boolean) => {
                track("purchase", {
                  transaction_id: orderNumber,
                  value: grandTotal,
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
                  orderId: orderNumber,
                  email: String(data.get("email") ?? user.email ?? ""),
                  name:
                    chosenAddress?.fullName ||
                    `${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}`.trim() ||
                    user.name,
                  address: finalAddressStr,
                  payment:
                    payment === "cod"
                      ? "Cash on Delivery"
                      : payment === "upi"
                        ? "UPI Instant"
                        : "Razorpay (Online)",
                  subtotal,
                  shipping,
                  tax,
                  discount,
                  total: grandTotal,
                  items: lines.map((l) => ({
                    name: l.product.name,
                    qty: l.qty,
                    color: l.color,
                    size: l.size,
                    lineTotal: l.lineTotal,
                  })),
                };

                addOrder({
                  orderId: orderNumber,
                  email: summary.email,
                  name: summary.name,
                  phone: String(data.get("phone") ?? user.phone ?? ""),
                  address: summary.address,
                  payment: summary.payment,
                  subtotal,
                  shipping,
                  tax,
                  total: grandTotal,
                  items: summary.items,
                  status: "confirmed",
                });

                window.sessionStorage.setItem("terracotta.lastOrder", JSON.stringify(summary));
                clearCart();
                toast.success(
                  isPaid ? "Payment successful! Order confirmed." : "Order placed successfully!",
                );
                navigate({ to: "/order-confirmed" });
              };

              // Handle Online Razorpay Payment
              if (payment !== "cod" && typeof window !== "undefined") {
                const isSdkLoaded = await loadRazorpaySdk();
                const paymentConfig = await api.payments.getConfig().catch(() => ({
                  keyId: "rzp_test_terracotta_demo",
                  isLive: false,
                }));

                if (isSdkLoaded && (window as any).Razorpay) {
                  const options = {
                    key: paymentConfig.keyId,
                    amount: Math.round(grandTotal * 100),
                    currency: "INR",
                    name: "Terracotta Leather Co.",
                    description: `Artisan Leather Goods · Order #${orderNumber}`,
                    order_id: res?.paymentOrder?.id,
                    prefill: {
                      name:
                        chosenAddress?.fullName ||
                        `${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}`.trim() ||
                        user.name,
                      email: user.email,
                      contact:
                        chosenAddress?.phone ||
                        String(data.get("phone") ?? user.phone ?? ""),
                    },
                    theme: {
                      color: "#8C4A32",
                    },
                    handler: async function (response: any) {
                      try {
                        await api.payments.verify({
                          orderId: orderDatabaseId,
                          razorpayOrderId: response.razorpay_order_id,
                          razorpayPaymentId: response.razorpay_payment_id,
                          razorpaySignature: response.razorpay_signature,
                        });
                      } catch (err) {
                        console.warn("Payment verification note:", err);
                      }
                      finalizeSuccess(true);
                    },
                    modal: {
                      ondismiss: function () {
                        toast.info(
                          "Payment sheet closed. Your order is recorded and can be tracked in My Orders.",
                        );
                        finalizeSuccess(false);
                      },
                    },
                  };

                  const rzp = new (window as any).Razorpay(options);
                  rzp.open();
                  return;
                }
              }

              // Fallback for Cash on Delivery
              finalizeSuccess(false);
            } catch (err: any) {
              toast.error(err.message || "Failed to place order. Please try again.");
            } finally {
              setPlacing(false);
            }
          }}
        >
          <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-ink">Contact</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  name="email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                  required
                  placeholder="Email address"
                  className={`${field} sm:col-span-2`}
                />
                <input
                  name="phone"
                  type="tel"
                  defaultValue={user?.phone ?? ""}
                  required
                  placeholder="Phone number"
                  className={`${field} sm:col-span-2`}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-ink">Shipping Address</h2>
                {user && savedAddresses.length > 0 && (
                  <Link
                    to="/account"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Manage Addresses
                  </Link>
                )}
              </div>

              {user && savedAddresses.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select a Delivery Destination
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                              {addr.label === "Office" || addr.label === "Work" ? (
                                <Building2 className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Home className="h-3.5 w-3.5 text-primary" />
                              )}
                              {addr.label || "Address"}
                            </span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-ink">{addr.fullName}</p>
                          <p className="text-[11px] text-muted-foreground">{addr.phone}</p>
                          <p className="mt-1 text-xs text-secondary-foreground line-clamp-2">
                            {addr.line1}, {addr.city}, {addr.pincode}
                          </p>
                        </div>
                      );
                    })}

                    <div
                      onClick={() => setSelectedAddressId("new")}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col items-center justify-center text-center ${
                        selectedAddressId === "new"
                          ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary"
                          : "border-border border-dashed bg-background hover:border-primary/50"
                      }`}
                    >
                      <Plus className="h-4 w-4 text-primary mb-1" />
                      <span className="text-xs font-bold text-ink">Use a New Address</span>
                      <span className="text-[11px] text-muted-foreground">
                        Enter different delivery destination
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(selectedAddressId === "new" || !user) && (
                <div
                  className={`${
                    user && savedAddresses.length > 0
                      ? "mt-5 border-t border-border pt-5"
                      : "mt-4"
                  } grid gap-3 sm:grid-cols-2`}
                >
                  <input
                    name="firstName"
                    defaultValue={user ? user.name.split(" ")[0] : ""}
                    required={selectedAddressId === "new"}
                    placeholder="First name"
                    className={field}
                  />
                  <input
                    name="lastName"
                    defaultValue={
                      user && user.name.split(" ").length > 1
                        ? user.name.split(" ").slice(1).join(" ")
                        : ""
                    }
                    required={selectedAddressId === "new"}
                    placeholder="Last name"
                    className={field}
                  />
                  <input
                    name="address"
                    required={selectedAddressId === "new"}
                    placeholder="Street address"
                    className={`${field} sm:col-span-2`}
                  />
                  <input
                    name="city"
                    required={selectedAddressId === "new"}
                    placeholder="City"
                    className={field}
                  />
                  <input
                    name="state"
                    required={selectedAddressId === "new"}
                    placeholder="State"
                    className={field}
                  />
                  <input
                    name="pincode"
                    required={selectedAddressId === "new"}
                    placeholder="PIN code"
                    pattern="[0-9]{6}"
                    className={field}
                  />
                  <input name="country" defaultValue="India" className={field} />
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-ink">Payment Method</h2>
              <div className="mt-4 space-y-3">
                {[
                  {
                    id: "card",
                    label: "Credit / Debit Card (Razorpay)",
                    desc: "Visa, MasterCard, RuPay, Amex & International Cards",
                  },
                  {
                    id: "upi",
                    label: "UPI Instant (Razorpay)",
                    desc: "Google Pay, PhonePe, Paytm, BHIM & Any UPI App",
                  },
                  {
                    id: "cod",
                    label: "Cash on Delivery",
                    desc: "Pay in cash at your doorstep upon arrival (+₹49)",
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-all ${
                      payment === m.id
                        ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                      className="mt-0.5 accent-[oklch(0.47_0.09_55)]"
                    />
                    <div>
                      <span className="font-bold text-ink block">{m.label}</span>
                      <span className="text-xs text-muted-foreground mt-0.5 block">{m.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {payment !== "cod" && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-600/20 bg-emerald-50/50 p-3.5 text-xs text-emerald-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>
                    Secured by <strong>Razorpay 256-bit SSL Encryption</strong>. Complete your transaction seamlessly in the popup after clicking Place Order.
                  </span>
                </div>
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
            {/* Coupon Code Section */}
            <div className="mt-5 border-t border-border pt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-700">
                        {appliedCoupon.discountType === "percent"
                          ? `${appliedCoupon.discountValue}% off applied`
                          : `₹${appliedCoupon.discountValue} flat off applied`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-200/60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. WELCOME500)"
                      className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs uppercase outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    className="flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-xs font-bold text-background hover:bg-ink/80 disabled:opacity-50"
                  >
                    {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
            </div>

            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-ink">{inr(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt className="font-medium">Coupon Discount ({appliedCoupon?.code})</dt>
                  <dd className="font-bold">−{inr(discount)}</dd>
                </div>
              )}
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
                <dd className="font-extrabold text-primary">{inr(grandTotal)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={placing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark disabled:opacity-70"
            >
              {placing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Placing order…</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Place Order · {inr(grandTotal)}</span>
                </>
              )}
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
