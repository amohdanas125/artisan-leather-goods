import { Link } from "@tanstack/react-router";
import { Backpack, Facebook, Instagram, Play, Youtube } from "lucide-react";

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

const plainCols = [
  {
    title: "Customer Service",
    links: ["Track Order", "Shipping & Returns", "Leather Care Guide", "FAQs", "Contact Us"],
  },
  {
    title: "My Account",
    links: ["Login / Sign Up", "Order History", "Wishlist", "Saved Addresses", "Gift Cards"],
  },
];

export function SiteFooter() {
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
                className="flex h-9 items-center gap-2 rounded-lg border border-ink-foreground/25 px-3 text-xs"
              >
                <Play className="h-3.5 w-3.5" /> Google Play
              </a>
              <a
                href="#"
                className="flex h-9 items-center gap-2 rounded-lg border border-ink-foreground/25 px-3 text-xs"
              >
                <Backpack className="h-3.5 w-3.5" /> App Store
              </a>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-accent">
                {col.title}
              </h3>
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

          {plainCols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-accent">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-accent">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
