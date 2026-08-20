import { Link } from "@tanstack/react-router";
import { Briefcase, ChevronDown, Heart, Search, ShoppingCart, User } from "lucide-react";

import { categories } from "@/data/catalog";
import { useStore } from "@/lib/store";

const navLinks: { label: string; to: string; params?: Record<string, string> }[] = [
  { label: "Home", to: "/" },
  { label: "Bags", to: "/category/$slug", params: { slug: "bags" } },
  { label: "Wallets", to: "/category/$slug", params: { slug: "wallets" } },
  { label: "Belts", to: "/category/$slug", params: { slug: "belts" } },
  { label: "Footwear", to: "/category/$slug", params: { slug: "footwear" } },
  { label: "Travel", to: "/category/$slug", params: { slug: "travel" } },
];

export function SiteHeader() {
  const { cartCount, wishlist } = useStore();

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:text-[13px]">
          <span>Free Shipping on Orders Above ₹2,999</span>
          <span className="hidden text-accent sm:block">
            Handcrafted Leather Goods Since 1998
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Briefcase className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
              Terra<span className="text-ink">cotta</span>
            </span>
          </Link>

          <button className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary lg:flex">
            Find a Store
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for bags, wallets, belts..."
              className="h-11 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="flex shrink-0 items-center gap-5 text-sm font-medium">
            <button className="flex items-center gap-2 hover:text-primary">
              <User className="h-5 w-5" strokeWidth={1.8} />
              <span className="hidden sm:inline">Login / Sign Up</span>
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-primary">
              <Heart className="h-5 w-5" strokeWidth={1.8} />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex items-center gap-2 hover:text-primary"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="border-t border-border bg-cream">
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2.5">
            <Link
              to="/category/$slug"
              params={{ slug: categories[0]!.slug }}
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Shop by Category
              <ChevronDown className="h-4 w-4" />
            </Link>
            <nav className="flex items-center gap-6 whitespace-nowrap text-sm font-medium text-secondary-foreground">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  params={l.params as never}
                  className="hover:text-primary"
                  activeProps={{ className: "text-primary" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
