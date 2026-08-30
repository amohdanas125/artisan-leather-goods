import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Loader2,
  Lock,
  Mail,
  Package,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { inr } from "@/data/catalog";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomerDetailsModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated?: () => void;
}

export function CustomerDetailsModal({
  customerId,
  isOpen,
  onClose,
  onCustomerUpdated,
}: CustomerDetailsModalProps) {
  const [data, setData] = useState<{
    customer: any;
    orders: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (customerId && isOpen) {
      setLoading(true);
      api.admin.customers
        .getById(customerId)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load customer details");
          onClose();
        })
        .finally(() => setLoading(false));
    }
  }, [customerId, isOpen]);

  const handleToggleBlock = async () => {
    if (!data?.customer) return;
    const newBlockedState = !data.customer.isBlocked;
    setUpdatingStatus(true);
    try {
      await api.admin.customers.setBlocked(data.customer.id, newBlockedState);
      setData((prev) =>
        prev
          ? {
              ...prev,
              customer: { ...prev.customer, isBlocked: newBlockedState },
            }
          : null
      );
      toast.success(
        newBlockedState
          ? "Customer account has been restricted."
          : "Customer account restrictions removed."
      );
      onCustomerUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleRole = async () => {
    if (!data?.customer) return;
    const newRole = data.customer.role === "admin" ? "customer" : "admin";
    setUpdatingStatus(true);
    try {
      await api.admin.customers.setRole(data.customer.id, newRole);
      setData((prev) =>
        prev
          ? {
              ...prev,
              customer: { ...prev.customer, role: newRole },
            }
          : null
      );
      toast.success(
        newRole === "admin"
          ? "Customer promoted to Store Administrator."
          : "Account role changed to Patron."
      );
      onCustomerUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-3xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="text-xl font-bold text-ink">
            Customer Profile & Order History
          </DialogTitle>
        </DialogHeader>

        {loading || !data ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary mr-2" />
            <span className="text-xs font-medium text-muted-foreground">
              Loading customer dossier…
            </span>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Header Profile Info */}
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-[#FDFBF7] p-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-serif text-xl font-bold text-primary-foreground shadow-sm">
                  {data.customer.name ? data.customer.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-ink">{data.customer.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        data.customer.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {data.customer.role === "admin" ? "Administrator" : "Patron"}
                    </span>
                    {data.customer.isBlocked && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Blocked
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {data.customer.email}
                    </span>
                    {data.customer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {data.customer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleToggleRole}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:border-primary hover:text-primary cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {data.customer.role === "admin" ? "Demote to Patron" : "Promote to Admin"}
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleToggleBlock}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs cursor-pointer disabled:opacity-50 transition-colors ${
                    data.customer.isBlocked
                      ? "border border-emerald-600/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border border-rose-600/30 bg-rose-50 text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  {data.customer.isBlocked ? "Unblock Account" : "Block Customer"}
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-3.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Orders
                </span>
                <p className="mt-1 text-lg font-black text-ink">
                  {data.customer.totalOrders || data.orders.length}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lifetime Value
                </span>
                <p className="mt-1 text-lg font-black text-emerald-700">
                  {inr(data.customer.lifetimeSpent || 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Member Since
                </span>
                <p className="mt-1 text-xs font-bold text-ink">
                  {new Date(data.customer.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Order History Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Past Purchases ({data.orders.length})
              </h4>
              {data.orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No orders placed yet by this patron.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {data.orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border border-border/80 bg-background p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink">{o.orderNumber}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              o.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "confirmed"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : o.status === "cancelled"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.status}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-secondary-foreground">
                            {o.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block">
                          {new Date(o.placedAt || o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-ink block">{inr(Number(o.total || 0))}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{o.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
