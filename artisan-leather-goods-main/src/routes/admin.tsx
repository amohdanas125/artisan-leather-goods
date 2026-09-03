import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpDown,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  FolderTree,
  Layers,
  type LucideIcon,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trash2,
  Truck,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CategoryCrudModal } from "@/components/admin/CategoryCrudModal";
import { CustomerDetailsModal } from "@/components/admin/CustomerDetailsModal";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { ProductCrudModal } from "@/components/admin/ProductCrudModal";
import { inr, type Product } from "@/data/catalog";
import { api, getAuthToken } from "@/lib/api";
import { useStore, type CategoryItem, type Order, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Terracotta Leather Co." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "products" | "categories" | "orders" | "reviews" | "customers";
type ProductSortOption = "name" | "price-asc" | "price-desc" | "rating";

function convertBackendAdminOrder(o: any): Order {
  return {
    id: o.id,
    orderId: o.orderNumber,
    createdAt: o.placedAt || o.createdAt,
    email: o.user?.email || o.shippingAddress?.email || "customer@example.com",
    name: o.user?.name || o.shippingAddress?.name || "Customer",
    phone: o.shippingAddress?.phone || undefined,
    address: o.shippingAddress
      ? `${o.shippingAddress.line1 || ""}, ${o.shippingAddress.city || ""}, ${o.shippingAddress.state || ""} ${o.shippingAddress.postalCode || ""}`
      : "Shipping Address on File",
    payment: o.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
    subtotal: Number(o.subtotal || 0),
    shipping: Number(o.shippingCost || 0),
    tax: Number(o.tax || 0),
    total: Number(o.total || 0),
    status: o.status,
    trackingNumber: o.trackingNumber,
    items: (o.items || []).map((item: any) => ({
      name: item.productSnapshot?.name || item.product?.name || "Leather Item",
      qty: item.quantity,
      color: item.colorSnapshot || item.variant?.color || "Cognac",
      size: item.sizeSnapshot || item.variant?.size || "One Size",
      lineTotal: Number(item.price) * item.quantity,
    })),
  };
}

function AdminLoginPage() {
  const { user, login, logout } = useStore();
  const [email, setEmail] = useState("admin@tannerandco.com");
  const [password, setPassword] = useState("Admin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome to the Admin Portal!");
    } catch (err: any) {
      if (err?.message?.includes("Failed to fetch") || err?.name === "TypeError") {
        toast.error("Backend server is not running on localhost:4000. Please start the backend to log in.");
      } else {
        toast.error(err.message || "Invalid admin credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F5EE] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-4">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Admin Portal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with administrative credentials to access store controls.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
          {user && user.role !== "admin" ? (
            <div className="text-center space-y-4">
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
                <p className="font-bold">Access Restricted</p>
                <p className="mt-1">
                  You are signed in as <span className="font-semibold">{user.email}</span> (customer). Administrative privileges are required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Sign Out & Switch Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@tannerandco.com"
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-4 pr-11 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink cursor-pointer transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-cream/70 p-3 text-[11px] text-muted-foreground">
                <p className="font-semibold text-ink">Demo Credentials:</p>
                <p className="font-mono mt-0.5">admin@tannerandco.com / Admin@12345</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Access Admin Portal</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

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

function AdminPage() {
  const {
    user,
    logout,
    hydrated,
    products,
    categories,
    orders,
    refreshCatalog,
    deleteProduct,
    deleteCategory,
    deleteOrder,
    resetToDefaultData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Live Server Admin State
  const [serverOrders, setServerOrders] = useState<Order[]>([]);
  const [serverReviews, setServerReviews] = useState<any[]>([]);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [serverCustomers, setServerCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerRoleFilter, setCustomerRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);

  const [serverStats, setServerStats] = useState<{
    totalRevenue: number;
    ordersToday: number;
    newCustomersThisWeek: number;
    lowStockVariants: any[];
    recentOrders: any[];
  } | null>(null);

  const loadAdminData = useCallback(async () => {
    try {
      const [statsRes, ordersRes, reviewsRes, customersRes] = await Promise.all([
        api.admin.dashboard.getStats().catch(() => null),
        api.admin.orders.getAll().catch(() => null),
        api.admin.reviews.getAll().catch(() => null),
        api.admin.customers.getAll().catch(() => null),
      ]);
      if (statsRes) setServerStats(statsRes);
      if (ordersRes?.orders) {
        setServerOrders(ordersRes.orders.map(convertBackendAdminOrder));
      }
      if (reviewsRes?.reviews) {
        setServerReviews(reviewsRes.reviews);
      }
      if (customersRes?.customers) {
        setServerCustomers(customersRes.customers);
      }
    } catch (e) {
      console.error("Failed to load admin data", e);
    }
  }, []);

  const handleModerateReview = async (id: string, isApproved: boolean) => {
    try {
      await api.admin.reviews.moderate(id, isApproved);
      toast.success(
        isApproved ? "Review approved and published live!" : "Review hidden from storefront.",
      );
      const res = await api.admin.reviews.getAll();
      if (res?.reviews) setServerReviews(res.reviews);
      await refreshCatalog();
    } catch (err: any) {
      toast.error(err.message || "Failed to update review status.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await api.admin.reviews.delete(id);
      toast.success("Review deleted successfully.");
      const res = await api.admin.reviews.getAll();
      if (res?.reviews) setServerReviews(res.reviews);
      await refreshCatalog();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review.");
    }
  };

  const handleToggleBlockCustomer = async (id: string, isBlocked: boolean) => {
    try {
      await api.admin.customers.setBlocked(id, isBlocked);
      toast.success(isBlocked ? "Customer access restricted." : "Customer access restored.");
      const res = await api.admin.customers.getAll();
      if (res?.customers) setServerCustomers(res.customers);
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer status.");
    }
  };

  const handleRoleChangeCustomer = async (id: string, role: "customer" | "admin") => {
    try {
      await api.admin.customers.setRole(id, role);
      toast.success(
        role === "admin"
          ? "Customer granted Administrator privileges."
          : "User role updated to Patron.",
      );
      const res = await api.admin.customers.getAll();
      if (res?.customers) setServerCustomers(res.customers);
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await api.admin.customers.delete(customerToDelete.id);
      toast.success(`Customer "${customerToDelete.name}" deleted.`);
      setCustomerToDelete(null);
      const res = await api.admin.customers.getAll();
      if (res?.customers) setServerCustomers(res.customers);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete customer.");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user, loadAdminData]);

  const activeOrders = useMemo(() => {
    return serverOrders.length > 0 ? serverOrders : orders;
  }, [serverOrders, orders]);

  // Product CRUD states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productSortBy, setProductSortBy] = useState<
    "name" | "price-asc" | "price-desc" | "rating"
  >("name");

  // Category CRUD states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Order state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Metrics calculation
  const totalRevenue = useMemo(() => {
    if (serverStats && serverStats.totalRevenue > 0) return serverStats.totalRevenue;
    return activeOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  }, [serverStats, activeOrders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.slug.toLowerCase().includes(productSearch.toLowerCase());
        const matchesCategory =
          productCategoryFilter === "all" || p.category === productCategoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (productSortBy === "price-asc") return a.price - b.price;
        if (productSortBy === "price-desc") return b.price - a.price;
        if (productSortBy === "rating") return b.rating - a.rating;
        return a.name.localeCompare(b.name);
      });
  }, [products, productSearch, productCategoryFilter, productSortBy]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return activeOrders.filter((o) => {
      const matchesSearch =
        o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.email.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeOrders, orderSearch, orderStatusFilter]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return serverReviews.filter((r) => {
      const matchesSearch =
        r.product?.name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.user?.name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.comment?.toLowerCase().includes(reviewSearch.toLowerCase());
      const matchesStatus =
        reviewStatusFilter === "all"
          ? true
          : reviewStatusFilter === "pending"
            ? !r.isApproved
            : r.isApproved;
      return matchesSearch && matchesStatus;
    });
  }, [serverReviews, reviewSearch, reviewStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return serverCustomers.filter((c) => {
      const q = customerSearch.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q));
      const matchesRole = customerRoleFilter === "all" || c.role === customerRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [serverCustomers, customerSearch, customerRoleFilter]);

  const token = getAuthToken();
  if (hydrated && (!user || user.role !== "admin" || !token)) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Briefcase className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-primary">
                Terra<span className="text-ink">cotta</span>
              </span>
              <span className="ml-2 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/80 bg-cream/70 px-3 py-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-ink">{user.email}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                resetToDefaultData();
                toast.success("Store catalog reset to default initial state.");
              }}
              title="Reset sample inventory data"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-ink cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary-dark cursor-pointer transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Live Store</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                toast.info("Signed out of Admin Portal.");
              }}
              className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-border/60 bg-cream/50">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6">
            {[
              { id: "overview", label: "Dashboard Overview", icon: Layers },
              { id: "products", label: `Products (${products.length})`, icon: Package },
              { id: "categories", label: `Categories (${categories.length})`, icon: FolderTree },
              { id: "orders", label: `Orders (${orders.length})`, icon: Truck },
              { id: "reviews", label: `Reviews (${serverReviews.length})`, icon: Star },
              { id: "customers", label: `Customers (${serverCustomers.length})`, icon: Users },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as Tab)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card text-muted-foreground hover:text-ink hover:bg-card/80 border border-border/80"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* ======================= TAB 1: OVERVIEW ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-ink">{inr(totalRevenue)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  From {activeOrders.length} total orders
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                    <Truck className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-ink">{activeOrders.length}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {activeOrders.filter((o) => o.status === "processing" || o.status === "confirmed" || o.status === "pending").length}{" "}
                  active fulfillments
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Live Products</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-ink">{products.length}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {products.filter((p) => p.bestSeller).length} marked as Best Sellers
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Departments</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <FolderTree className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-black text-ink">{categories.length}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Active categories</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Recent Orders Overview */}
              <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-ink">Recent Orders</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {activeOrders.slice(0, 4).map((order) => {
                    const StatusIcon = STATUS_CONFIG[order.status]?.icon ?? Clock;
                    return (
                      <div
                        key={order.orderId}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/60 p-4 transition-colors hover:border-primary"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-ink">{order.orderId}</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[order.status]?.color ?? "bg-gray-100 text-gray-800"}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {STATUS_CONFIG[order.status]?.label ?? order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.name} ({order.email}) · {order.items.length} item(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-ink">{inr(order.total)}</span>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {activeOrders.length === 0 && (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No customer orders placed yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Watch */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-ink mb-3">Inventory Watch</h3>
                  {serverStats?.lowStockVariants && serverStats.lowStockVariants.length > 0 ? (
                    <div className="space-y-2">
                      {serverStats.lowStockVariants.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs"
                        >
                          <div>
                            <p className="font-bold text-ink">{item.productName}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.color} · {item.size}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            {item.stockQty} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/80 bg-background/50 p-4 text-center">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                      <p className="text-xs font-bold text-ink">Healthy Inventory Levels</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        All product variants currently maintain adequate stock.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/80 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary-dark cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create New Product</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: PRODUCTS CRUD ======================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-ink">Catalog & Inventory</h2>
                <p className="text-xs text-muted-foreground">
                  Manage artisan leather goods, inventory variants, pricing, and collections.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title or slug..."
                  className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-xs outline-none focus:border-primary"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-ink outline-none focus:border-primary"
              >
                <option value="all">All Departments</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={productSortBy}
                onChange={(e) => setProductSortBy(e.target.value as ProductSortOption)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-ink outline-none focus:border-primary"
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Price / MRP</th>
                      <th className="px-5 py-3.5">Rating</th>
                      <th className="px-5 py-3.5">Badge</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                          No products found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.slug} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.img}
                                alt={p.name}
                                className="h-12 w-12 rounded-xl object-cover border border-border shrink-0"
                              />
                              <div>
                                <Link
                                  to="/product/$slug"
                                  params={{ slug: p.slug }}
                                  className="font-bold text-ink hover:text-primary transition-colors line-clamp-1"
                                >
                                  {p.name}
                                </Link>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  /{p.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 capitalize font-medium text-secondary-foreground">
                            {categories.find((c) => c.slug === p.category)?.label ?? p.category}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-ink">{inr(p.price)}</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-muted-foreground line-through">
                                  {inr(p.mrp)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-amber-700">★ {p.rating}</span>
                            <span className="text-muted-foreground text-[11px]">
                              {" "}
                              ({p.reviews})
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {p.bestSeller ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                                <Sparkles className="h-3 w-3" /> Best Seller
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setProductToEdit(p);
                                  setIsProductModalOpen(true);
                                }}
                                title="Edit Product"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-secondary-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                title="Delete Product"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: CATEGORIES CRUD ======================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-ink">Categories Management</h2>
                <p className="text-xs text-muted-foreground">
                  Organize store departments, navigation links, and collection banners.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => {
                const productCount = products.filter((p) => p.category === c.slug).length;
                return (
                  <div
                    key={c.slug}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                        <img src={c.img} alt={c.label} className="h-full w-full object-cover" />
                        <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white">
                          {productCount} {productCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-ink">{c.label}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">/{c.slug}</p>
                        <p className="text-xs text-secondary-foreground mt-2 line-clamp-2">
                          {c.blurb}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border/80 p-4 flex items-center justify-between bg-muted/20">
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        View Collection →
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryToEdit(c);
                            setIsCategoryModalOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-secondary-foreground hover:border-primary hover:text-primary cursor-pointer"
                          title="Edit Category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: ORDERS ======================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-ink">Order Fulfillment & Tracking</h2>
                <p className="text-xs text-muted-foreground">
                  Track, update statuses, and view purchased items across all customer orders.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, customer name, or email..."
                  className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-xs outline-none focus:border-primary"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-ink outline-none focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Order ID & Date</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Items</th>
                      <th className="px-5 py-3.5">Total Paid</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                          No orders found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const StatusIcon = STATUS_CONFIG[order.status]?.icon ?? Clock;
                        return (
                          <tr key={order.orderId} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-ink">{order.orderId}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-ink">{order.name}</p>
                              <p className="text-[11px] text-muted-foreground">{order.email}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-medium text-secondary-foreground">
                                {order.items.map((i) => `${i.name} (x${i.qty})`).join(", ")}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-primary">{inr(order.total)}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[order.status]?.color ?? "bg-gray-100 text-gray-800"}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {STATUS_CONFIG[order.status]?.label ?? order.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrderToDelete(order)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                                  title="Delete Order Log"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 5: REVIEWS ======================= */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Header & Description */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink sm:text-2xl">
                  Customer Reviews Moderation
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review customer ratings, approve verified buyer testimonials, or remove inappropriate feedback.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Search reviews by customer, email, product, or content..."
                  className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-xs outline-none focus:border-primary"
                />
              </div>

              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value as any)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-ink outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Reviews ({serverReviews.length})</option>
                <option value="pending">
                  Pending Approval ({serverReviews.filter((r) => !r.isApproved).length})
                </option>
                <option value="approved">
                  Approved & Live ({serverReviews.filter((r) => r.isApproved).length})
                </option>
              </select>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
                <Star className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-bold text-ink">No customer reviews found</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Customer product reviews will appear here for moderation.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/product/$slug"
                          params={{ slug: rev.product?.slug || "" }}
                          className="font-bold text-xs text-primary hover:underline"
                        >
                          {rev.product?.name || "Product"}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-accent">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= rev.rating ? "fill-current text-accent" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-bold text-ink ml-1">{rev.rating}/5</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            rev.isApproved
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {rev.isApproved ? "Approved / Live" : "Pending Moderation"}
                        </span>
                      </div>

                      <p className="text-xs text-ink leading-relaxed font-medium">"{rev.comment}"</p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-ink">{rev.user?.name || "Customer"}</span>
                        <span>({rev.user?.email || "No email"})</span>
                        <span>•</span>
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {rev.isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleModerateReview(rev.id, false)}
                          className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Hide Review</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModerateReview(rev.id, true)}
                          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-2xs hover:bg-primary-dark cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve Review</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 6: CUSTOMERS ======================= */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            {/* Top Customer KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Patrons</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black text-ink">{serverCustomers.length}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Registered patron accounts</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">VIP Patrons</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black text-ink">
                  {serverCustomers.filter((c) => Number(c.lifetimeSpent || 0) >= 10000).length}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">&gt; ₹10,000 lifetime spend</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Patron Spend</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black text-ink">
                  {inr(
                    serverCustomers.reduce(
                      (sum, c) => sum + Number(c.lifetimeSpent || 0),
                      0,
                    ),
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Total customer sales</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Restricted</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-800">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black text-ink">
                  {serverCustomers.filter((c) => c.isBlocked).length}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Blocked accounts</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by patron name, email, or phone…"
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["all", "customer", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCustomerRoleFilter(r)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors cursor-pointer ${
                      customerRoleFilter === r
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-secondary-foreground hover:border-primary"
                    }`}
                  >
                    {r === "all" ? "All Roles" : r === "customer" ? "Patrons" : "Admins"}
                  </button>
                ))}
              </div>
            </div>

            {/* Customers Table */}
            {filteredCustomers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-bold text-ink">No customers found</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try adjusting your search query or role filter.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3.5">Patron</th>
                        <th className="px-5 py-3.5">Contact</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Orders</th>
                        <th className="px-5 py-3.5">Lifetime Value</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredCustomers.map((cust) => {
                        const isSelf = user?.id === cust.id;
                        return (
                          <tr key={cust.id} className="hover:bg-cream/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-serif text-sm font-bold text-primary">
                                  {cust.name ? cust.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <span className="font-extrabold text-ink block">{cust.name}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Joined{" "}
                                    {new Date(cust.createdAt).toLocaleDateString("en-IN", {
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-ink block font-medium">{cust.email}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {cust.phone || "—"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  cust.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {cust.role === "admin" ? "Administrator" : "Patron"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="font-bold text-ink">
                                {cust.totalOrders || 0} orders
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="font-extrabold text-emerald-800">
                                {inr(Number(cust.lifetimeSpent || 0))}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              {cust.isBlocked ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                                  <Lock className="h-3 w-3" /> Blocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCustomerId(cust.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-secondary-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors"
                                  title="View Customer Dossier & Orders"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>

                                {!isSelf && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleBlockCustomer(cust.id, !cust.isBlocked)
                                      }
                                      className={`flex h-8 w-8 items-center justify-center rounded-lg border cursor-pointer transition-colors ${
                                        cust.isBlocked
                                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                          : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                      }`}
                                      title={cust.isBlocked ? "Unblock Account" : "Restrict Account"}
                                    >
                                      {cust.isBlocked ? (
                                        <UserCheck className="h-3.5 w-3.5" />
                                      ) : (
                                        <UserX className="h-3.5 w-3.5" />
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setCustomerToDelete(cust)}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
                                      title="Delete Customer Account"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <ProductCrudModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <CategoryCrudModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOrderUpdated={loadAdminData}
      />

      <CustomerDetailsModal
        customerId={selectedCustomerId}
        isOpen={Boolean(selectedCustomerId)}
        onClose={() => setSelectedCustomerId(null)}
        onCustomerUpdated={loadAdminData}
      />

      {/* Confirm Delete Customer */}
      <DeleteConfirmDialog
        isOpen={Boolean(customerToDelete)}
        title={`Delete Patron "${customerToDelete?.name}"?`}
        description={`Are you sure you want to permanently delete the customer account for ${customerToDelete?.email}? This action cannot be undone.`}
        onCancel={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteCustomer}
      />

      {/* Confirm Delete Product */}
      <DeleteConfirmDialog
        isOpen={Boolean(productToDelete)}
        title={`Delete "${productToDelete?.name}"?`}
        description="Are you sure you want to permanently remove this product from the catalog? This action cannot be undone."
        onCancel={() => setProductToDelete(null)}
        onConfirm={async () => {
          if (productToDelete) {
            try {
              if (productToDelete.id) {
                await api.admin.products.delete(productToDelete.id).catch(() => {});
              }
              deleteProduct(productToDelete.slug);
              await refreshCatalog();
              toast.success(`Product "${productToDelete.name}" deleted.`);
            } catch (err: any) {
              deleteProduct(productToDelete.slug);
              toast.success(`Product "${productToDelete.name}" deleted locally.`);
            }
            setProductToDelete(null);
          }
        }}
      />

      {/* Confirm Delete Category */}
      <DeleteConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title={`Delete Category "${categoryToDelete?.label}"?`}
        description={`Are you sure you want to delete this category? Products in this category may need to be reassigned.`}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={async () => {
          if (categoryToDelete) {
            try {
              if (categoryToDelete.id) {
                await api.admin.categories.delete(categoryToDelete.id).catch(() => {});
              }
              deleteCategory(categoryToDelete.slug);
              await refreshCatalog();
              toast.success(`Category "${categoryToDelete.label}" deleted.`);
            } catch (err: any) {
              deleteCategory(categoryToDelete.slug);
              toast.success(`Category "${categoryToDelete.label}" deleted locally.`);
            }
            setCategoryToDelete(null);
          }
        }}
      />

      {/* Confirm Delete Order */}
      <DeleteConfirmDialog
        isOpen={Boolean(orderToDelete)}
        title={`Delete Order ${orderToDelete?.orderId}?`}
        description="Are you sure you want to delete this order record from the dashboard?"
        onCancel={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            deleteOrder(orderToDelete.orderId);
            toast.success(`Order ${orderToDelete.orderId} deleted.`);
            setOrderToDelete(null);
          }
        }}
      />
    </div>
  );
}
