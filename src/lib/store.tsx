import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProduct, type Product } from "@/data/catalog";
import { track } from "@/lib/analytics";

export type CartItem = {
  slug: string;
  qty: number;
  color: string;
  size: string;
};

export type CartLine = CartItem & { product: Product; lineTotal: number };

const CART_KEY = "terracotta.cart.v1";
const WISH_KEY = "terracotta.wishlist.v1";

export const SHIPPING_THRESHOLD = 2999;
export const SHIPPING_FEE = 149;
export const TAX_RATE = 0.12;

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
  items: CartItem[];
  lines: CartLine[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  addToCart: (slug: string, opts?: { qty?: number; color?: string; size?: string }) => void;
  setQty: (slug: string, color: string, size: string, qty: number) => void;
  removeFromCart: (slug: string, color: string, size: string) => void;
  clearCart: () => void;
  wishlist: string[];
  isWished: (slug: string) => boolean;
  toggleWish: (slug: string) => void;
  moveToCart: (slug: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setItems(read<CartItem[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart: StoreValue["addToCart"] = useCallback((slug, opts = {}) => {
    const product = getProduct(slug);
    if (!product) return;
    const color = opts.color ?? product.colors[0]!;
    const size = opts.size ?? product.sizes[0]!;
    const qty = opts.qty ?? 1;
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.slug === slug && i.color === color && i.size === size,
      );
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
  }, []);

  const setQty: StoreValue["setQty"] = useCallback((slug, color, size, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.slug === slug && i.color === color && i.size === size))
        : prev.map((i) =>
            i.slug === slug && i.color === color && i.size === size ? { ...i, qty } : i,
          ),
    );
  }, []);

  const removeFromCart: StoreValue["removeFromCart"] = useCallback((slug, color, size) => {
    setItems((prev) =>
      prev.filter((i) => !(i.slug === slug && i.color === color && i.size === size)),
    );
    track("remove_from_cart", { item_id: slug, color, size });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWish = useCallback((slug: string) => {
    setWishlist((prev) => {
      const has = prev.includes(slug);
      track(has ? "remove_from_wishlist" : "add_to_wishlist", { item_id: slug });
      return has ? prev.filter((s) => s !== slug) : [...prev, slug];
    });
  }, []);

  const moveToCart = useCallback(
    (slug: string) => {
      addToCart(slug);
      setWishlist((prev) => prev.filter((s) => s !== slug));
    },
    [addToCart],
  );

  const value = useMemo<StoreValue>(() => {
    const lines: CartLine[] = items.flatMap((i) => {
      const product = getProduct(i.slug);
      return product ? [{ ...i, product, lineTotal: product.price * i.qty }] : [];
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(subtotal * TAX_RATE);
    return {
      hydrated,
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
      wishlist,
      isWished: (slug: string) => wishlist.includes(slug),
      toggleWish,
      moveToCart,
    };
  }, [
    hydrated,
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
