import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Heart,
  LogOut,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { cartCount, wishlist, user, openAuthModal, logout, categories } = useStore();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setIsCategoryMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsCategoryMenuOpen(false);
    }, 150);
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:text-[13px]">
          <span>Free Shipping on Orders Above ₹2,999</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-accent">Handcrafted Leather Since 1998</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Briefcase className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
              Terra<span className="text-ink">cotta</span>
            </span>
          </Link>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for bags, wallets, belts..."
              className="h-11 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="flex shrink-0 items-center gap-5 text-sm font-medium">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-xs transition-colors hover:border-primary cursor-pointer">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl p-2 shadow-xl border-border bg-card"
                >
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <p className="text-xs font-bold text-ink">{user.name}</p>
                    <p className="text-[11px] font-normal text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Account & Addresses</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>Wishlist ({wishlist.length})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span>Cart ({cartCount})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      toast.info("You have been signed out.");
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors"
              >
                <User className="h-5 w-5" strokeWidth={1.8} />
                <span className="hidden sm:inline">Login / Sign Up</span>
              </button>
            )}
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
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto md:overflow-visible px-4 py-2.5">
            {/* Shop by Category hover dropdown */}
            <div
              ref={containerRef}
              className="relative shrink-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                aria-expanded={isCategoryMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer"
              >
                Shop by Category
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isCategoryMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isCategoryMenuOpen && (
                <div
                  className="absolute left-0 top-full z-50 pt-2 w-[340px] sm:w-[380px] origin-top-left animate-in fade-in-0 zoom-in-95 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-xl ring-1 ring-black/5">
                    <div className="mb-2 px-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Collections</span>
                        <span className="flex items-center gap-1 text-[11px] font-normal text-primary">
                          <Sparkles className="h-3 w-3" /> Handcrafted
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="group flex items-center gap-3.5 rounded-xl p-2 transition-colors hover:bg-cream/80"
                          role="menuitem"
                        >
                          <img
                            src={c.img}
                            alt={c.label}
                            className="h-12 w-12 rounded-lg object-cover border border-border/60 shrink-0 transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-ink transition-colors group-hover:text-primary">
                              {c.label}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{c.blurb}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/60 transition-all group-hover:text-primary group-hover:translate-x-0.5 shrink-0" />
                        </Link>
                      ))}
                    </div>

                    <div className="mt-2 border-t border-border/60 pt-2.5 px-2">
                      <Link
                        to="/category/$slug"
                        params={{ slug: categories[0]?.slug ?? "bags" }}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                      >
                        <span>Explore All 5 Categories</span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Free Shipping &gt; ₹2,999
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
