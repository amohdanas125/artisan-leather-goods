import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  LucideIcon,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { inr } from "@/data/catalog";
import { api } from "@/lib/api";
import { useStore, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Terracotta Leather" },
      { name: "description", content: "View and track your handcrafted leather orders in real-time." },
    ],
    links: [{ rel: "canonical", href: "/orders" }],
  }),
  component: CustomerOrdersPage,
});

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: LucideIcon; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  processing: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-rose-100 text-rose-800 border-rose-300",
  },
  returned: {
    label: "Returned",
    icon: XCircle,
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

const STEP_ORDER: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

function CustomerOrdersPage() {
  const { user, hydrated, openAuthModal } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.orders.getMyOrders();
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err: any) {
      console.error("Failed to load customer orders:", err);
      toast.error(err.message || "Could not load order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hydrated) {
      fetchOrders();
    }
  }, [hydrated, user]);

  const copyToClipboard = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(trackingNum);
    toast.success("Tracking number copied to clipboard!");
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Track Your Orders</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Sign in with your account to view your past purchases, real-time shipment updates, and tracking numbers.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-dark cursor-pointer transition-colors"
          >
            Sign In to View Orders
          </button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">My Orders</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Hello <span className="font-semibold text-ink">{user.name}</span>, here is your handcrafted leather orders history.
            </p>
          </div>
          <Link
            to="/category/$slug"
            params={{ slug: "bags" }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-ink shadow-2xs hover:border-primary transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-14 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-base font-bold text-ink">No orders yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Once you place an order, you can track its delivery status and invoice here.
            </p>
            <Link
              to="/category/$slug"
              params={{ slug: "bags" }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const currentStepIndex = STEP_ORDER.indexOf(order.status as OrderStatus);

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-border/60 bg-[#F0E8DE] sm:bg-card shadow-xs transition-shadow hover:shadow-md"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Order
                        </span>
                        <span className="font-mono text-sm font-extrabold text-ink">
                          {order.orderNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Placed on{" "}
                        {new Date(order.placedAt || order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusCfg.color}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{statusCfg.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress Milestones (For Active Orders) */}
                  {order.status !== "cancelled" && order.status !== "returned" && (
                    <div className="border-b border-border/50 bg-background/50 px-6 py-4">
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {STEP_ORDER.map((step, idx) => {
                          const isDone = currentStepIndex >= idx;
                          const isCurrent = currentStepIndex === idx;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                    : isDone
                                      ? "bg-emerald-600 text-white"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span
                                className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  isCurrent
                                    ? "text-primary font-bold"
                                    : isDone
                                      ? "text-ink"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {STATUS_CONFIG[step].label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tracking Carrier Card if Available */}
                  {order.trackingNumber && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-200/60 bg-purple-50/50 px-6 py-3 text-purple-950">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-700" />
                        <span className="text-xs font-bold">Carrier Tracking Number:</span>
                        <span className="font-mono text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                          {order.trackingNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.trackingNumber)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 hover:text-purple-950 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedTracking === order.trackingNumber ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  )}

                  {/* Items and Financial Details */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/60 p-3"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
                            {item.productImageSnapshot ? (
                              <img
                                src={item.productImageSnapshot}
                                alt={item.productNameSnapshot}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-ink truncate">
                              {item.productNameSnapshot}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {item.colorSnapshot && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                                  Color: {item.colorSnapshot}
                                </span>
                              )}
                              {item.sizeSnapshot && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                                  Size: {item.sizeSnapshot}
                                </span>
                              )}
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-black text-ink">
                              {inr(Number(item.price) * item.quantity)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {inr(Number(item.price))} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Payment Method
                        </span>
                        <p className="text-xs font-semibold text-ink capitalize">
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"} •{" "}
                          <span
                            className={
                              order.paymentStatus === "paid"
                                ? "text-emerald-700 font-bold"
                                : "text-amber-700 font-bold"
                            }
                          >
                            {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-baseline gap-2 text-right">
                        <span className="text-xs text-muted-foreground">Total Paid:</span>
                        <span className="text-xl font-extrabold text-primary">
                          {inr(Number(order.total))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
