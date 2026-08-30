import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  type LucideIcon,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inr } from "@/data/catalog";
import { api } from "@/lib/api";
import { useStore, type Order, type OrderStatus } from "@/lib/store";

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

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}) {
  const { updateOrderStatus } = useStore();
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");

  if (!order) return null;

  const StatusIcon = STATUS_CONFIG[order.status]?.icon ?? Clock;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      if (order.id) {
        await api.admin.orders.updateStatus(order.id, {
          status: newStatus,
          ...(trackingNumber ? { trackingNumber } : {}),
        });
      }
      updateOrderStatus(order.orderId, newStatus);
      if (onOrderUpdated) onOrderUpdated();
      toast.success(
        `Order ${order.orderId} status set to "${STATUS_CONFIG[newStatus]?.label ?? newStatus}"`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status on server.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl overflow-hidden rounded-3xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-xl font-bold text-ink">
                Order {order.orderId}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </DialogDescription>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${STATUS_CONFIG[order.status]?.color ?? "bg-gray-100 text-gray-800"}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{STATUS_CONFIG[order.status]?.label ?? order.status}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status Updater */}
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Update Fulfillment Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                      order.status === st
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-card text-secondary-foreground hover:border-primary"
                    }`}
                  >
                    {STATUS_CONFIG[st].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border/60 pt-3">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Carrier Tracking Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BLUEDART-998822 / FEDEX-7819"
                  className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusChange(order.status)}
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-dark cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Save Tracking
                </button>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Shipping Info
              </h4>
              <p className="text-sm font-bold text-ink">{order.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{order.email}</p>
              {order.phone && <p className="text-xs text-muted-foreground">{order.phone}</p>}
              <p className="text-xs text-secondary-foreground mt-2 leading-relaxed">
                {order.address}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Method
              </h4>
              <p className="text-sm font-bold text-ink">{order.payment}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-ink">{inr(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold text-ink">
                    {order.shipping === 0 ? "FREE" : inr(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (12% GST):</span>
                  <span className="font-semibold text-ink">{inr(order.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-bold text-sm text-primary">
                  <span>Total Paid:</span>
                  <span>{inr(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Breakdown */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ordered Items ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                >
                  <div>
                    <p className="text-sm font-bold text-ink">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Color: {item.color} · Size: {item.size} · Qty: {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">{inr(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
