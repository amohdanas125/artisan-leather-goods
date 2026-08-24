import heroImg from "@/assets/hero-leather.jpg";
import toteImg from "@/assets/p-tote.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import beltImg from "@/assets/p-belt.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import cardholderImg from "@/assets/p-cardholder.jpg";
import crossbodyImg from "@/assets/p-crossbody.jpg";
import bootsImg from "@/assets/p-boots.jpg";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta.env?.["VITE_API_URL"] as string | undefined)) ||
  "http://localhost:4000/api";

const TOKEN_KEY = "terracotta.jwt.v1";
const SESSION_KEY = "terracotta.cart.session.v1";

// Asset mapping fallback for local development
export const LOCAL_ASSETS: Record<string, string> = {
  "hero-leather.jpg": heroImg,
  "p-tote.jpg": toteImg,
  "p-wallet.jpg": walletImg,
  "p-belt.jpg": beltImg,
  "p-duffel.jpg": duffelImg,
  "p-cardholder.jpg": cardholderImg,
  "p-crossbody.jpg": crossbodyImg,
  "p-boots.jpg": bootsImg,
};

export function resolveImageUrl(urlOrKey?: string | null): string {
  if (!urlOrKey) return heroImg;
  for (const [key, asset] of Object.entries(LOCAL_ASSETS)) {
    if (urlOrKey.includes(key)) {
      return asset;
    }
  }
  return urlOrKey;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getCartSessionId(): string {
  if (typeof window === "undefined") return "guest-session";
  let sid = window.localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    window.localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function loadRazorpaySdk(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface ApiErrorResponse {
  statusCode?: number;
  message: string | string[];
  error?: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const sessionId = getCartSessionId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (sessionId) {
    headers["x-cart-session"] = sessionId;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = "An error occurred";
    if (typeof data === "object" && data !== null && "message" in data) {
      errorMessage = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    } else if (typeof data === "string" && data.trim()) {
      errorMessage = data;
    }
    throw new Error(errorMessage);
  }

  return data as T;
}

// Backend Response Types
export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  blurb?: string;
  imageUrl?: string | null;
  parentId?: string | null;
}

export interface BackendProductImage {
  id: string;
  productId: string;
  b2FileKey: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface BackendProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  priceOverride?: string | null;
  mrpOverride?: string | null;
  stockQty: number;
  sku: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  categoryId?: string;
  basePrice: string;
  mrp: string;
  sku: string;
  stockQty: number;
  colors: string[];
  sizes: string[];
  details: string[];
  avgRating: string;
  reviewCount: number;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  createdAt: string;
  images?: BackendProductImage[];
  variants?: BackendProductVariant[];
  category?: BackendCategory;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: string;
    user?: { name: string; image?: string };
  }>;
}

export interface ProductQueryParams {
  category?: string;
  color?: string;
  size?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SavedAddress {
  id: string;
  userId?: string;
  label?: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function convertBackendProduct(p: BackendProduct) {
  const images =
    p.images && p.images.length > 0
      ? p.images.map((img) => resolveImageUrl(img.url))
      : [resolveImageUrl(null)];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: (p.category?.slug ?? "bags") as any,
    price: Number(p.basePrice) || 0,
    mrp: Number(p.mrp) || Number(p.basePrice) || 0,
    rating: Number(p.avgRating) || 5.0,
    reviews: p.reviewCount || 0,
    img: images[0]!,
    gallery: images,
    description: p.description,
    details: p.details || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    bestSeller: p.isBestSeller,
    variants: p.variants || [],
  };
}

export function convertBackendCategory(c: BackendCategory) {
  return {
    id: c.id,
    slug: c.slug,
    label: c.name,
    blurb: c.blurb || "",
    img: resolveImageUrl(c.imageUrl),
  };
}

export const api = {
  auth: {
    login: (email: string, password?: string) =>
      apiFetch<{ accessToken: string; user: { id: string; name: string; email: string; phone?: string; role: string } }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password: password || "Admin@12345" }),
        }
      ),
    register: (dto: {
      name: string;
      email: string;
      password?: string | undefined;
      phone?: string | undefined;
    }) =>
      apiFetch<{ accessToken: string; user: { id: string; name: string; email: string; phone?: string; role: string } }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: dto.name,
            email: dto.email,
            password: dto.password || "Password@123",
            phone: dto.phone,
          }),
        }
      ),
    getMe: () =>
      apiFetch<{ user: { id: string; name: string; email: string; phone?: string; role: string } }>("/auth/me"),
    forgotPassword: (email: string) =>
      apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  },
  products: {
    getAll: async (params?: ProductQueryParams) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryStr = searchParams.toString();
      const path = queryStr ? `/products?${queryStr}` : "/products";
      return apiFetch<{ products: BackendProduct[]; total: number; page: number; limit: number }>(path);
    },
    getBySlug: async (slug: string) => {
      return apiFetch<{ product: BackendProduct }>(`/products/${slug}`);
    },
  },
  categories: {
    getAll: async () => {
      return apiFetch<{ categories: BackendCategory[] }>("/categories");
    },
  },
  cart: {
    get: async () => {
      return apiFetch<{
        cart: { id: string } | null;
        items: Array<{
          id: string;
          quantity: number;
          priceAtAdd: string;
          product: { id: string; name: string; slug: string };
          variant: { id: string; color: string; size: string; price: string | null; stockQty: number };
          image: string | null;
        }>;
        subtotal: number;
      }>("/cart");
    },
    addItem: async (dto: { productId: string; variantId: string; quantity: number }) => {
      return apiFetch<{ item: any }>("/cart", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
    updateItem: async (itemId: string, quantity: number) => {
      return apiFetch<{ item: any }>(`/cart/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
    },
    removeItem: async (itemId: string) => {
      return apiFetch<{ message: string }>(`/cart/${itemId}`, {
        method: "DELETE",
      });
    },
  },
  checkout: {
    placeOrder: async (dto: {
      addressId?: string | undefined;
      newAddress?: {
        fullName: string;
        phone: string;
        line1: string;
        line2?: string | undefined;
        city: string;
        state: string;
        pincode: string;
        country?: string | undefined;
      } | undefined;
      paymentMethod: "online" | "cod";
      couponCode?: string | undefined;
    }) => {
      return apiFetch<{ order: any; paymentOrder?: any }>("/checkout", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },
  orders: {
    getMyOrders: async () => {
      return apiFetch<{ orders: any[] }>("/orders");
    },
    getById: async (orderId: string) => {
      return apiFetch<{ order: any }>(`/orders/${orderId}`);
    },
  },
  coupons: {
    validate: async (code: string, subtotal: number) => {
      return apiFetch<{
        discount: number;
        coupon: {
          id: string;
          code: string;
          discountType: string;
          discountValue: string;
        };
      }>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, subtotal }),
      });
    },
  },
  wishlist: {
    get: async () => {
      return apiFetch<{
        wishlist: Array<{
          id: string;
          image?: string;
          product: { id: string; name: string; slug: string; basePrice: string; mrp: string };
        }>;
      }>("/wishlist");
    },
    add: async (productId: string) => {
      return apiFetch<{ item: any }>("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
    },
    remove: async (productId: string) => {
      return apiFetch<{ message: string }>(`/wishlist/${productId}`, {
        method: "DELETE",
      });
    },
  },
  reviews: {
    create: async (dto: { productId: string; rating: number; comment?: string; orderId?: string }) => {
      return apiFetch<{ review: any; message: string }>("/reviews", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },
  account: {
    profile: {
      get: async () => {
        return apiFetch<{
          profile: {
            id: string;
            name: string;
            email: string;
            phone?: string | null;
            image?: string | null;
            role: string;
            createdAt: string;
          };
        }>("/account/profile");
      },
      update: async (dto: { name?: string; phone?: string; avatarUrl?: string }) => {
        return apiFetch<{ profile: { id: string; name: string; image?: string } }>(
          "/account/profile",
          {
            method: "PATCH",
            body: JSON.stringify(dto),
          }
        );
      },
    },
    addresses: {
      getAll: async () => {
        return apiFetch<{ addresses: SavedAddress[] }>("/account/addresses");
      },
      create: async (dto: {
        label?: string;
        fullName: string;
        phone: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
        isDefault?: boolean;
      }) => {
        return apiFetch<{ address: SavedAddress }>("/account/addresses", {
          method: "POST",
          body: JSON.stringify(dto),
        });
      },
      update: async (
        id: string,
        dto: {
          label?: string;
          fullName?: string;
          phone?: string;
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          pincode?: string;
          country?: string;
          isDefault?: boolean;
        }
      ) => {
        return apiFetch<{ address: SavedAddress }>(`/account/addresses/${id}`, {
          method: "PATCH",
          body: JSON.stringify(dto),
        });
      },
      delete: async (id: string) => {
        return apiFetch<{ message: string }>(`/account/addresses/${id}`, {
          method: "DELETE",
        });
      },
    },
  },
  payments: {
    getConfig: async () => {
      return apiFetch<{ keyId: string; isLive: boolean }>("/payments/config");
    },
    verify: async (dto: {
      orderId: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    }) => {
      return apiFetch<{ success: boolean; message: string; order: any }>("/payments/verify", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
  },
  admin: {
    dashboard: {
      getStats: async () => {
        return apiFetch<{
          totalRevenue: number;
          ordersToday: number;
          newCustomersThisWeek: number;
          lowStockVariants: Array<{
            id: string;
            productId: string;
            productName: string;
            color: string;
            size: string;
            stockQty: number;
          }>;
          recentOrders: any[];
        }>("/admin/dashboard");
      },
    },
    products: {
      getAll: async (search?: string) => {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        return apiFetch<{ products: BackendProduct[] }>(`/admin/products${query}`);
      },
      getById: async (id: string) => {
        return apiFetch<{ product: BackendProduct }>(`/admin/products/${id}`);
      },
      create: async (dto: any) => {
        return apiFetch<{ product: BackendProduct }>("/admin/products", {
          method: "POST",
          body: JSON.stringify(dto),
        });
      },
      update: async (id: string, dto: any) => {
        return apiFetch<{ product: BackendProduct }>(`/admin/products/${id}`, {
          method: "PATCH",
          body: JSON.stringify(dto),
        });
      },
      delete: async (id: string) => {
        return apiFetch<{ message: string }>(`/admin/products/${id}`, {
          method: "DELETE",
        });
      },
    },
    categories: {
      create: async (dto: { name: string; slug: string; blurb?: string | undefined; imageUrl?: string | undefined }) => {
        return apiFetch<{ category: BackendCategory }>("/categories", {
          method: "POST",
          body: JSON.stringify(dto),
        });
      },
      update: async (
        id: string,
        dto: Partial<{ name: string; slug: string; blurb?: string | undefined; imageUrl?: string | undefined }>
      ) => {
        return apiFetch<{ category: BackendCategory }>(`/categories/${id}`, {
          method: "PATCH",
          body: JSON.stringify(dto),
        });
      },
      delete: async (id: string) => {
        return apiFetch<{ message: string }>(`/categories/${id}`, {
          method: "DELETE",
        });
      },
    },
    orders: {
      getAll: async (status?: string) => {
        const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
        return apiFetch<{ orders: any[] }>(`/admin/orders${query}`);
      },
      getById: async (id: string) => {
        return apiFetch<{ order: any }>(`/admin/orders/${id}`);
      },
      updateStatus: async (
        id: string,
        dto: {
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | undefined;
          paymentStatus?: "pending" | "paid" | "failed" | "refunded" | undefined;
          trackingNumber?: string | undefined;
        }
      ) => {
        return apiFetch<{ order: any }>(`/admin/orders/${id}`, {
          method: "PATCH",
          body: JSON.stringify(dto),
        });
      },
    },
    customers: {
      getAll: async (search?: string, role?: string) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (role && role !== "all") params.append("role", role);
        const query = params.toString() ? `?${params.toString()}` : "";
        return apiFetch<{
          customers: Array<{
            id: string;
            name: string;
            email: string;
            phone: string | null;
            role: string;
            isBlocked: boolean;
            createdAt: string;
            totalOrders: number;
            lifetimeSpent: number;
            lastOrderAt: string | null;
          }>;
        }>(`/admin/customers${query}`);
      },
      getById: async (id: string) => {
        return apiFetch<{
          customer: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            role: string;
            isBlocked: boolean;
            createdAt: string;
            totalOrders: number;
            lifetimeSpent: number;
          };
          orders: any[];
        }>(`/admin/customers/${id}`);
      },
      setBlocked: async (id: string, isBlocked: boolean) => {
        return apiFetch<{ customer: any }>(`/admin/customers/${id}/block`, {
          method: "PATCH",
          body: JSON.stringify({ isBlocked }),
        });
      },
      setRole: async (id: string, role: "customer" | "admin") => {
        return apiFetch<{ customer: any }>(`/admin/customers/${id}/role`, {
          method: "PATCH",
          body: JSON.stringify({ role }),
        });
      },
      delete: async (id: string) => {
        return apiFetch<{ message: string; customer: any }>(`/admin/customers/${id}`, {
          method: "DELETE",
        });
      },
    },
    reviews: {
      getAll: async (status?: "pending" | "approved") => {
        const query = status ? `?status=${encodeURIComponent(status)}` : "";
        return apiFetch<{ reviews: any[] }>(`/admin/reviews${query}`);
      },
      moderate: async (id: string, isApproved: boolean) => {
        return apiFetch<{ review: any }>(`/admin/reviews/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isApproved }),
        });
      },
      delete: async (id: string) => {
        return apiFetch<{ message: string }>(`/admin/reviews/${id}`, {
          method: "DELETE",
        });
      },
    },
  },
};
