import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  categories as defaultCategories,
  products as defaultProducts,
  type Product,
} from "@/data/catalog";
import { track } from "@/lib/analytics";
import {
  api,
  convertBackendProduct,
  convertBackendCategory,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  type BackendProduct,
} from "@/lib/api";

export type User = {
  id?: string | undefined;
  name: string;
  email: string;
  phone?: string | undefined;
  role?: string | undefined;
};

export type CategoryItem = {
  id?: string | undefined;
  slug: string;
  label: string;
  blurb: string;
  img: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type OrderItem = {
  name: string;
  qty: number;
  color: string;
  size: string;
  lineTotal: number;
};

export type Order = {
  id?: string | undefined;
  orderId: string;
  createdAt: string;
  email: string;
  name: string;
  phone?: string | undefined;
  address: string;
  payment: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  trackingNumber?: string | undefined;
};

export type CartItem = {
  slug: string;
  qty: number;
  color: string;
  size: string;
  cartItemId?: string | undefined;
  productId?: string | undefined;
  variantId?: string | undefined;
};

export type CartLine = CartItem & { product: Product; lineTotal: number };

const CART_KEY = "terracotta.cart.v1";
const WISH_KEY = "terracotta.wishlist.v1";
const USER_KEY = "terracotta.user.v1";
const PRODUCTS_KEY = "terracotta.products.v1";
const CATEGORIES_KEY = "terracotta.categories.v1";
const ORDERS_KEY = "terracotta.orders.v1";

export const SHIPPING_THRESHOLD = 2999;
export const SHIPPING_FEE = 149;
export const TAX_RATE = 0.12;

const initialOrders: Order[] = [
  {
    orderId: "TC-849201",
    createdAt: "2026-08-20T14:20:00.000Z",
    name: "Arjun Verma",
    email: "arjun.verma@example.com",
    phone: "+91 98112 34567",
    address: "Flat 402, Palm Heights, Indiranagar, Bengaluru, 560038",
    payment: "Card (•••• 4242)",
    subtotal: 11499,
    shipping: 0,
    tax: 1380,
    total: 12879,
    status: "delivered",
    items: [
      {
        name: "Voyager Weekender Duffel",
        qty: 1,
        color: "Cognac",
        size: "42L",
        lineTotal: 11499,
      },
    ],
  },
  {
    orderId: "TC-723190",
    createdAt: "2026-08-21T09:15:00.000Z",
    name: "Priya Sundaram",
    email: "priya.s@example.com",
    phone: "+91 98450 12389",
    address: "12/4 Lake View Road, Anna Nagar, Chennai, 600040",
    payment: "UPI (priya@oksbi)",
    subtotal: 8998,
    shipping: 0,
    tax: 1080,
    total: 10078,
    status: "shipped",
    items: [
      {
        name: "Marlow Full-Grain Tote",
        qty: 1,
        color: "Cognac",
        size: "Regular",
        lineTotal: 6799,
      },
      {
        name: "Ashcroft Bifold Wallet",
        qty: 1,
        color: "Espresso",
        size: "One Size",
        lineTotal: 2199,
      },
    ],
  },
  {
    orderId: "TC-618420",
    createdAt: "2026-08-22T11:45:00.000Z",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 98200 99881",
    address: "B-301, Silver Sands, Bandra West, Mumbai, 400050",
    payment: "Cash on Delivery",
    subtotal: 1949,
    shipping: 149,
    tax: 234,
    total: 2332,
    status: "confirmed",
    items: [
      {
        name: "Hand-Braided Tan Belt",
        qty: 1,
        color: "Natural Tan",
        size: "34",
        lineTotal: 1949,
      },
    ],
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type StoreValue = {
  hydrated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup";
  openAuthModal: (tab?: "login" | "signup") => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshCatalog: () => Promise<void>;

  // Catalog state & CRUD
  products: Product[];
  categories: CategoryItem[];
  getProductBySlug: (slug: string) => Product | undefined;
  createProduct: (product: Product) => void;
  updateProduct: (slug: string, updated: Partial<Product>) => void;
  deleteProduct: (slug: string) => void;
  createCategory: (category: CategoryItem) => void;
  updateCategory: (slug: string, updated: Partial<CategoryItem>) => void;
  deleteCategory: (slug: string) => void;
  resetToDefaultData: () => void;

  // Orders state & CRUD
  orders: Order[];
  addOrder: (
    order: Omit<Order, "createdAt" | "status"> & { status?: OrderStatus; createdAt?: string },
  ) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

  // Cart & Wishlist
  items: CartItem[];
  lines: CartLine[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  addToCart: (slug: string, opts?: { qty?: number; color?: string; size?: string }) => Promise<void>;
  setQty: (slug: string, color: string, size: string, qty: number) => Promise<void>;
  removeFromCart: (slug: string, color: string, size: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  wishlist: string[];
  wishlistCount: number;
  isWished: (slug: string) => boolean;
  toggleWish: (slug: string) => Promise<void>;
  moveToCart: (slug: string) => void;
  refreshWishlist: () => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshCatalog = useCallback(async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.categories.getAll(),
        api.products.getAll({ limit: 100 }),
      ]);
      if (catsRes.categories && catsRes.categories.length > 0) {
        setCategories(catsRes.categories.map(convertBackendCategory));
      }
      if (prodsRes.products && prodsRes.products.length > 0) {
        setProducts(prodsRes.products.map(convertBackendProduct));
      }
    } catch (err) {
      console.warn("Failed to fetch catalog from backend, using fallback:", err);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.cart.get();
      if (res && Array.isArray(res.items)) {
        const serverItems: CartItem[] = res.items.map((item) => ({
          slug: item.product.slug,
          qty: item.quantity,
          color: item.variant.color,
          size: item.variant.size,
          cartItemId: item.id,
          variantId: item.variant.id,
          productId: item.product.id,
        }));
        if (serverItems.length > 0) {
          setItems(serverItems);
        }
      }
    } catch (err) {
      console.warn("Failed to sync server cart:", err);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await api.wishlist.get();
      if (res.wishlist && Array.isArray(res.wishlist)) {
        const slugs = res.wishlist.map((w) => w.product?.slug).filter(Boolean);
        setWishlist(slugs);
      }
    } catch (err) {
      console.warn("Could not fetch server wishlist:", err);
    }
  }, []);

  useEffect(() => {
    setItems(read<CartItem[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setUser(read<User | null>(USER_KEY, null));
    setProducts(read<Product[]>(PRODUCTS_KEY, defaultProducts));
    setCategories(read<CategoryItem[]>(CATEGORIES_KEY, defaultCategories));
    setOrders(read<Order[]>(ORDERS_KEY, initialOrders));
    setHydrated(true);

    const token = getAuthToken();
    if (token) {
      api.auth
        .getMe()
        .then((res) => {
          if (res.user) setUser(res.user);
        })
        .catch(() => {
          removeAuthToken();
          setUser(null);
        });
    }

    refreshCatalog().then(() => {
      refreshCart();
      refreshWishlist();
    });
  }, [refreshCatalog, refreshCart, refreshWishlist]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (hydrated) {
      if (user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(USER_KEY);
      }
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const openAuthModal = useCallback((tab: "login" | "signup" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, password?: string) => {
      const res = await api.auth.login(email, password);
      if (res.accessToken) setAuthToken(res.accessToken);
      if (res.user) setUser(res.user);
      setIsAuthModalOpen(false);
      await Promise.all([refreshCart(), refreshWishlist()]);
      track("login", { method: "email" });
    },
    [refreshCart, refreshWishlist],
  );

  const signup = useCallback(
    async (name: string, email: string, password?: string, phone?: string) => {
      const res = await api.auth.register({
        name,
        email,
        ...(password ? { password } : {}),
        ...(phone ? { phone } : {}),
      });
      if (res.accessToken) setAuthToken(res.accessToken);
      if (res.user) setUser(res.user);
      setIsAuthModalOpen(false);
      await Promise.all([refreshCart(), refreshWishlist()]);
      track("sign_up", { method: "email" });
    },
    [refreshCart, refreshWishlist],
  );

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    setWishlist([]);
    track("logout");
  }, []);

  // Product CRUD
  const getProductBySlug = useCallback(
    (slug: string) => {
      return products.find((p) => p.slug === slug) ?? defaultProducts.find((p) => p.slug === slug);
    },
    [products],
  );

  const createProduct = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const updateProduct = useCallback((slug: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...updated } : p)));
  }, []);

  const deleteProduct = useCallback((slug: string) => {
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  // Category CRUD
  const createCategory = useCallback((category: CategoryItem) => {
    setCategories((prev) => [...prev, category]);
  }, []);

  const updateCategory = useCallback((slug: string, updated: Partial<CategoryItem>) => {
    setCategories((prev) => prev.map((c) => (c.slug === slug ? { ...c, ...updated } : c)));
  }, []);

  const deleteCategory = useCallback((slug: string) => {
    setCategories((prev) => prev.filter((c) => c.slug !== slug));
  }, []);

  // Order CRUD
  const addOrder = useCallback(
    (
      orderData: Omit<Order, "createdAt" | "status"> & { status?: OrderStatus; createdAt?: string },
    ) => {
      const newOrder: Order = {
        ...orderData,
        status: orderData.status ?? "pending",
        createdAt: orderData.createdAt ?? new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
    },
    [],
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status } : o)));
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  }, []);

  const resetToDefaultData = useCallback(() => {
    setProducts(defaultProducts);
    setCategories(defaultCategories);
    setOrders(initialOrders);
  }, []);

  const addToCart: StoreValue["addToCart"] = useCallback(
    async (slug, opts = {}) => {
      const product =
        products.find((p) => p.slug === slug) ?? defaultProducts.find((p) => p.slug === slug);
      if (!product) return;
      const color = opts.color ?? product.colors[0]!;
      const size = opts.size ?? product.sizes[0]!;
      const qty = opts.qty ?? 1;

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.slug === slug && i.color === color && i.size === size);
        if (idx === -1) return [...prev, { slug, qty, color, size }];
        const next = [...prev];
        next[idx] = { ...next[idx]!, qty: next[idx]!.qty + qty };
        return next;
      });

      track("add_to_cart", {
        item_id: slug,
        item_name: product.name,
        item_category: product.category,
        value: product.price * qty,
        currency: "INR",
        quantity: qty,
        color,
        size,
      });

      try {
        let productId = product.id;
        let variantId = product.variants?.find((v) => v.color === color && v.size === size)?.id;

        if (!productId || !variantId) {
          const detail = await api.products.getBySlug(slug);
          if (detail.product) {
            productId = detail.product.id;
            variantId = detail.product.variants?.find((v) => v.color === color && v.size === size)?.id;
          }
        }

        if (productId && variantId) {
          await api.cart.addItem({ productId, variantId, quantity: qty });
          await refreshCart();
        }
      } catch (err) {
        console.warn("Backend cart add error:", err);
      }
    },
    [products, refreshCart],
  );

  const setQty: StoreValue["setQty"] = useCallback(
    async (slug, color, size, qty) => {
      const current = items.find((i) => i.slug === slug && i.color === color && i.size === size);

      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => !(i.slug === slug && i.color === color && i.size === size))
          : prev.map((i) =>
              i.slug === slug && i.color === color && i.size === size ? { ...i, qty } : i,
            ),
      );

      if (current?.cartItemId) {
        try {
          if (qty <= 0) {
            await api.cart.removeItem(current.cartItemId);
          } else {
            await api.cart.updateItem(current.cartItemId, qty);
          }
          await refreshCart();
        } catch (err) {
          console.warn("Backend cart update error:", err);
        }
      }
    },
    [items, refreshCart],
  );

  const removeFromCart: StoreValue["removeFromCart"] = useCallback(
    async (slug, color, size) => {
      const current = items.find((i) => i.slug === slug && i.color === color && i.size === size);
      setItems((prev) =>
        prev.filter((i) => !(i.slug === slug && i.color === color && i.size === size)),
      );
      track("remove_from_cart", { item_id: slug, color, size });

      if (current?.cartItemId) {
        try {
          await api.cart.removeItem(current.cartItemId);
          await refreshCart();
        } catch (err) {
          console.warn("Backend cart remove error:", err);
        }
      }
    },
    [items, refreshCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleWish = useCallback(
    async (slug: string) => {
      const has = wishlist.includes(slug);
      setWishlist((prev) => (has ? prev.filter((s) => s !== slug) : [...prev, slug]));
      track(has ? "remove_from_wishlist" : "add_to_wishlist", { item_id: slug });

      if (getAuthToken()) {
        try {
          const product = products.find((p) => p.slug === slug) ?? getProductBySlug(slug);
          let productId = product?.id;
          if (!productId) {
            const res = await api.products.getBySlug(slug);
            productId = res.product?.id;
          }
          if (productId) {
            if (has) {
              await api.wishlist.remove(productId);
            } else {
              await api.wishlist.add(productId);
            }
          }
        } catch (err) {
          console.warn("Backend wishlist sync error:", err);
        }
      }
    },
    [wishlist, products, getProductBySlug],
  );

  const moveToCart = useCallback(
    (slug: string) => {
      addToCart(slug);
      setWishlist((prev) => prev.filter((s) => s !== slug));
    },
    [addToCart],
  );

  const value = useMemo<StoreValue>(() => {
    const lines: CartLine[] = items.flatMap((i) => {
      const product =
        products.find((p) => p.slug === i.slug) ?? defaultProducts.find((p) => p.slug === i.slug);
      return product ? [{ ...i, product, lineTotal: product.price * i.qty }] : [];
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(subtotal * TAX_RATE);
    return {
      hydrated,
      user,
      setUser,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      login,
      signup,
      logout,
      products,
      categories,
      getProductBySlug,
      createProduct,
      updateProduct,
      deleteProduct,
      createCategory,
      updateCategory,
      deleteCategory,
      resetToDefaultData,
      orders,
      addOrder,
      updateOrderStatus,
      deleteOrder,
      items,
      lines,
      cartCount: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      refreshCart,
      wishlist,
      wishlistCount: wishlist.length,
      isWished: (slug: string) => wishlist.includes(slug),
      toggleWish,
      moveToCart,
      refreshWishlist,
      refreshCatalog,
    };
  }, [
    hydrated,
    user,
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
    logout,
    refreshCatalog,
    refreshCart,
    refreshWishlist,
    products,
    categories,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
    resetToDefaultData,
    orders,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    items,
    wishlist,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleWish,
    moveToCart,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
