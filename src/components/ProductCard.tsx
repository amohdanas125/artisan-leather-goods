import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";

import { inr, type Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { track } from "@/lib/analytics";

export function ProductCard({ product, listName }: { product: Product; listName: string }) {
  const { addToCart, isWished, toggleWish } = useStore();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <button
        aria-label={isWished(product.slug) ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => toggleWish(product.slug)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-card hover:text-primary"
      >
        <Heart
          className={`h-4 w-4 ${isWished(product.slug) ? "fill-primary text-primary" : ""}`}
        />
      </button>

      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        onClick={() =>
          track("select_item", {
            item_id: product.slug,
            item_name: product.name,
            item_list_name: listName,
          })
        }
      >
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          width={640}
          height={640}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs font-semibold text-accent-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          {product.rating.toFixed(1)}
          <span className="font-normal text-muted-foreground">({product.reviews})</span>
        </div>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="mt-1 flex-1 text-sm font-semibold leading-snug text-ink hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-primary">{inr(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
        </div>
        <button
          onClick={() => addToCart(product.slug)}
          className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
