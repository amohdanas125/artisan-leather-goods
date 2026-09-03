import { Link } from "@tanstack/react-router";
import { Backpack, Facebook, Instagram, Play, Youtube } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store";

const shopLinks = [
  { label: "All Bags", slug: "bags" },
  { label: "Wallets", slug: "wallets" },
  { label: "Belts", slug: "belts" },
  { label: "Footwear", slug: "footwear" },
  { label: "Travel", slug: "travel" },
];

const customerServiceLinks = [
  "Track Order",
  "Shipping & Returns",
  "Leather Care Guide",
  "FAQs",
  "Contact Us",
];

const accountLinks = [
  "Login / Sign Up",
  "Order History",
  "Wishlist",
  "Saved Addresses",
  "Gift Cards",
];

export function SiteFooter() {
  const { user, openAuthModal } = useStore();

  const handleAccountClick = (link: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (link === "Login / Sign Up") {
      if (user) {
        toast.info(`You are logged in as ${user.name} (${user.email}).`);
      } else {
        openAuthModal("login");
      }
    } else if (link === "Wishlist") {
      // Handled by Link
    } else if (link === "Order History") {
      if (!user) {
        openAuthModal("login");
        toast.info("Please sign in to view your order history.");
      } else {
        toast.info("You currently have no past orders.");
      }
    } else if (link === "Saved Addresses") {
      if (!user) {
        openAuthModal("login");
        toast.info("Please sign in to view your saved addresses.");
      } else {
        toast.info("No saved addresses found. Add one during checkout!");
      }
    } else if (link === "Gift Cards") {
      toast.info("Gift cards will be available in our upcoming seasonal collection!");
    } else {
      toast.info(`${link} information will be updated shortly.`);
    }
  };

  return (
    <footer className="bg-[#1C1613] text-ink-foreground border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          {/* Brand Info Column (Full width on mobile, 2 cols on lg) */}
          <div className="col-span-2 lg:col-span-2">
            <span className="font-display text-2xl font-extrabold text-white tracking-tight">
              Terracotta
            </span>
            <p className="mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-ink-foreground/70">
              Hand-stitched full-grain leather goods, crafted in small batches since 1998. Built to last a lifetime with natural patina.
            </p>

            {/* Mobile-friendly App Badges */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Terracotta Android App coming soon to Google Play!");
                }}
                className="flex h-8 sm:h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-[11px] sm:text-xs text-white/90 hover:border-white hover:text-white transition-colors cursor-pointer"
              >
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" /> Google Play
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Terracotta iOS App coming soon to App Store!");
                }}
                className="flex h-8 sm:h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-[11px] sm:text-xs text-white/90 hover:border-white hover:text-white transition-colors cursor-pointer"
              >
                <Backpack className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> App Store
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Shop</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-ink-foreground/70">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: l.slug }}
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Customer Service
            </h3>
            <ul className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-ink-foreground/70">
              {customerServiceLinks.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onClick={(e) => handleAccountClick(l, e)}
                    className="hover:text-white transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account Column */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              My Account
            </h3>
            <ul className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 text-xs sm:text-sm text-ink-foreground/70">
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Login / Sign Up", e)}
                  className="hover:text-white transition-colors cursor-pointer text-left block py-0.5"
                >
                  {user ? `Logged In: ${user.name}` : "Login / Sign Up"}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Order History", e)}
                  className="hover:text-white transition-colors cursor-pointer text-left block py-0.5"
                >
                  Order History
                </button>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors block py-0.5">
                  Wishlist
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Saved Addresses", e)}
                  className="hover:text-white transition-colors cursor-pointer text-left block py-0.5"
                >
                  Saved Addresses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Gift Cards", e)}
                  className="hover:text-white transition-colors cursor-pointer text-left block py-0.5"
                >
                  Gift Cards
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip (Copyright & Social Links) */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-[11px] sm:text-xs text-ink-foreground/60 text-center sm:text-left">
            © 2026 Terracotta Leather Co. All rights reserved. Full-grain artisan craftsmanship.
          </p>
          <div className="flex gap-4 text-ink-foreground/70">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition-all"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition-all"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition-all"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
