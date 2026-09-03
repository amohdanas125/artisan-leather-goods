import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/catalog";

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  viewAllSlug?: string;
  products: Product[];
  listName: string;
  icon?: React.ReactNode;
}

export function ProductSlider({
  title,
  subtitle,
  badge,
  viewAllSlug = "bags",
  products,
  listName,
  icon,
}: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Header with Title, Badge, Navigation Arrows & View All */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {badge && (
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
              {icon || <Sparkles className="h-3.5 w-3.5 text-primary" />}
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/category/$slug"
            params={{ slug: viewAllSlug }}
            className="hidden text-xs font-bold text-primary hover:text-primary-dark sm:inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span>→</span>
          </Link>

          {/* Desktop & Tablet Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-2xs transition-all cursor-pointer ${
                canScrollLeft
                  ? "text-ink hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                  : "cursor-not-allowed opacity-30 text-muted-foreground"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-2xs transition-all cursor-pointer ${
                canScrollRight
                  ? "text-ink hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                  : "cursor-not-allowed opacity-30 text-muted-foreground"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth"
        >
          {products.map((p) => (
            <div
              key={p.slug}
              className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start flex flex-col"
            >
              <ProductCard product={p} listName={listName} />
            </div>
          ))}
        </div>

        {/* Mobile Left & Right edge fade gradients */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-6 bg-gradient-to-r from-background to-transparent sm:hidden" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-6 bg-gradient-to-l from-background to-transparent sm:hidden" />
        )}
      </div>

      {/* Mobile View All Link */}
      <div className="mt-4 text-center sm:hidden">
        <Link
          to="/category/$slug"
          params={{ slug: viewAllSlug }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark"
        >
          <span>View All {title}</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
