import { Link } from "@tanstack/react-router";
import { Backpack, Facebook, Instagram, Play, Youtube } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store";

const footerCols = [
  {
    title: "Shop",
    links: [
      { label: "All Bags", slug: "bags" },
      { label: "Wallets", slug: "wallets" },
      { label: "Belts", slug: "belts" },
      { label: "Footwear", slug: "footwear" },
      { label: "Travel", slug: "travel" },
    ],
  },
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
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <span className="font-display text-2xl font-extrabold text-accent">Terracotta</span>
            <p className="mt-3 max-w-xs text-sm text-ink-foreground/70">
              Hand-stitched full-grain leather goods, made in small batches since 1998.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Terracotta Android App coming soon to Google Play!");
                }}
                className="flex h-9 items-center gap-2 rounded-lg border border-ink-foreground/25 px-3 text-xs cursor-pointer hover:border-accent hover:text-accent transition-colors"
              >
                <Play className="h-3.5 w-3.5" /> Google Play
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Terracotta iOS App coming soon to App Store!");
                }}
                className="flex h-9 items-center gap-2 rounded-lg border border-ink-foreground/25 px-3 text-xs cursor-pointer hover:border-accent hover:text-accent transition-colors"
              >
                <Backpack className="h-3.5 w-3.5" /> App Store
              </a>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-accent">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: l.slug }}
                      className="hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-accent">
              Customer Service
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
              {[
                "Track Order",
                "Shipping & Returns",
                "Leather Care Guide",
                "FAQs",
                "Contact Us",
              ].map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onClick={(e) => handleAccountClick(l, e)}
                    className="hover:text-accent cursor-pointer text-left"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-accent">My Account</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Login / Sign Up", e)}
                  className="hover:text-accent cursor-pointer text-left"
                >
                  {user ? `Logged In: ${user.name}` : "Login / Sign Up"}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Order History", e)}
                  className="hover:text-accent cursor-pointer text-left"
                >
                  Order History
                </button>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-accent">
                  Wishlist
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Saved Addresses", e)}
                  className="hover:text-accent cursor-pointer text-left"
                >
                  Saved Addresses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleAccountClick("Gift Cards", e)}
                  className="hover:text-accent cursor-pointer text-left"
                >
                  Gift Cards
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-foreground/15 pt-6 sm:flex-row">
          <p className="text-xs text-ink-foreground/60">
            © 2026 Terracotta Leather Co. All rights reserved.
          </p>
          <div className="flex gap-4 text-ink-foreground/70">
            <a href="#" aria-label="Instagram" className="hover:text-accent">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-accent">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-accent">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
