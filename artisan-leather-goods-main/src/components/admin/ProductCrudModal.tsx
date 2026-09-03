import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { type CategorySlug, type Product } from "@/data/catalog";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

import heroImg from "@/assets/hero-leather.jpg";
import toteImg from "@/assets/p-tote.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import beltImg from "@/assets/p-belt.jpg";
import bootsImg from "@/assets/p-boots.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import cardholderImg from "@/assets/p-cardholder.jpg";
import crossbodyImg from "@/assets/p-crossbody.jpg";

const DEFAULT_IMAGE_OPTIONS = [
  { label: "Leather Tote", url: toteImg },
  { label: "Bifold Wallet", url: walletImg },
  { label: "Braided Belt", url: beltImg },
  { label: "Derby Boots", url: bootsImg },
  { label: "Travel Duffel", url: duffelImg },
  { label: "Card Holder", url: cardholderImg },
  { label: "Crossbody Bag", url: crossbodyImg },
  { label: "Hero Briefcase", url: heroImg },
];

export function ProductCrudModal({
  isOpen,
  onClose,
  productToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
}) {
  const { categories, refreshCatalog, createProduct, updateProduct } = useStore();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("bags");
  const [price, setPrice] = useState<number | "">("");
  const [mrp, setMrp] = useState<number | "">("");
  const [rating, setRating] = useState<number>(4.8);
  const [reviews, setReviews] = useState<number>(10);
  const [img, setImg] = useState<string>(toteImg);
  const [customImgUrl, setCustomImgUrl] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [colors, setColors] = useState("Cognac, Espresso, Black");
  const [sizes, setSizes] = useState("One Size");
  const [bestSeller, setBestSeller] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setMrp(productToEdit.mrp);
      setRating(productToEdit.rating);
      setReviews(productToEdit.reviews);
      setImg(productToEdit.img);
      setCustomImgUrl("");
      setDescription(productToEdit.description);
      setDetails(productToEdit.details.join("\n"));
      setColors(productToEdit.colors.join(", "));
      setSizes(productToEdit.sizes.join(", "));
      setBestSeller(Boolean(productToEdit.bestSeller));
    } else {
      setName("");
      setSlug("");
      setCategory(categories[0]?.slug ?? "bags");
      setPrice("");
      setMrp("");
      setRating(4.8);
      setReviews(24);
      setImg(categories[0]?.img ?? toteImg);
      setCustomImgUrl("");
      setDescription("");
      setDetails("Full-grain vegetable-tanned leather\nSolid brass hardware\nHand-burnished edges");
      setColors("Cognac, Espresso, Black, Natural Tan");
      setSizes("Regular, Large");
      setBestSeller(false);
    }
  }, [productToEdit, isOpen, categories]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!productToEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter product name");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please enter a unique product slug");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!mrp || Number(mrp) <= 0) {
      toast.error("Please enter a valid MRP");
      return;
    }

    const finalImg = customImgUrl.trim() || img || toteImg;
    const finalDetails = details
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
    const finalColors = colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const finalSizes = sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const selectedCat = categories.find((c) => c.slug === category);
    const resolvedColors = finalColors.length > 0 ? finalColors : ["Cognac", "Espresso"];
    const resolvedSizes = finalSizes.length > 0 ? finalSizes : ["One Size"];
    const variants = resolvedColors.flatMap((color) =>
      resolvedSizes.map((size) => ({
        color,
        size,
        stockQty: 100,
      }))
    );

    const backendDto = {
      name: name.trim(),
      slug: slug.trim(),
      basePrice: Number(price),
      mrp: Number(mrp),
      description:
        description.trim() ||
        "Handcrafted with premium full-grain leather for lifelong durability.",
      details:
        finalDetails.length > 0 ? finalDetails : ["Full-grain leather", "Hand-stitched finish"],
      colors: resolvedColors,
      sizes: resolvedSizes,
      variants,
      isBestSeller: bestSeller,
      ...(selectedCat?.id ? { categoryId: selectedCat.id } : {}),
    };

    (async () => {
      try {
        let savedProductId = productToEdit?.id;
        if (productToEdit?.id) {
          await api.admin.products.update(productToEdit.id, backendDto);
        } else {
          const createRes = await api.admin.products.create(backendDto);
          savedProductId = createRes?.product?.id;
        }

        // If product was created/updated on backend, and has an image, attach image
        if (savedProductId && finalImg) {
          try {
            await api.admin.products.addImage(savedProductId, {
              url: finalImg,
              b2FileKey: finalImg.startsWith("http") ? finalImg.split("/").pop() || "product-image" : "product-image",
              altText: name.trim(),
            });
          } catch (imgErr) {
            console.warn("Could not attach image to backend product:", imgErr);
          }
        }

        await refreshCatalog();
        toast.success(
          productToEdit
            ? `Product "${name}" updated successfully on backend!`
            : `Product "${name}" created successfully on backend!`,
        );
        onClose();
      } catch (err: any) {
        // If backend is offline or unauthorized (offline demo admin session), fallback to local state
        const isOfflineOrUnauthorized =
          err?.message?.includes("Unauthorized") ||
          err?.message?.includes("Failed to fetch") ||
          err?.message?.includes("NetworkError") ||
          err?.name === "TypeError";

        if (isOfflineOrUnauthorized) {
          const localProduct: Product = {
            id: productToEdit?.id || `local-prod-${Date.now()}`,
            slug: slug.trim(),
            name: name.trim(),
            category: (category as CategorySlug) || "bags",
            price: Number(price),
            mrp: Number(mrp),
            rating: Number(rating) || 5.0,
            reviews: Number(reviews) || 0,
            img: finalImg,
            gallery: [finalImg],
            description:
              description.trim() ||
              "Handcrafted with premium full-grain leather for lifelong durability.",
            details:
              finalDetails.length > 0 ? finalDetails : ["Full-grain leather", "Hand-stitched finish"],
            colors: finalColors.length > 0 ? finalColors : ["Cognac", "Espresso"],
            sizes: finalSizes.length > 0 ? finalSizes : ["One Size"],
            bestSeller: bestSeller,
          };

          if (productToEdit) {
            updateProduct(productToEdit.slug, localProduct);
          } else {
            createProduct(localProduct);
          }
          if (err?.message?.includes("Unauthorized")) {
            toast.error("Admin session expired or unauthorized. Product saved only locally for this browser session. Please sign out & back in to sync with database.");
          } else {
            toast.warning(`Backend offline (${err?.message || "Network error"}). Product "${name}" saved locally.`);
          }
          onClose();
          return;
        }

        toast.error(err.message || "Failed to save product.");
      }
    })();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-border bg-card p-6 shadow-2xl">
          <DialogHeader className="border-b border-border/60 pb-4">
            <DialogTitle className="text-xl font-bold text-ink">
              {productToEdit ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {productToEdit
              ? "Update product pricing, specifications, categories, and inventory details."
              : "Fill in the details below to add a new handcrafted leather product to the store."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Row 1: Name and Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Vintage Leather Messenger"
                required
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. vintage-leather-messenger"
                required
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Row 2: Category and Best Seller */}
          <div className="grid gap-4 sm:grid-cols-2 items-center">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {(categories || []).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 sm:pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="h-4 w-4 rounded accent-[oklch(0.47_0.09_55)]"
                />
                <span className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-accent" /> Mark as Best Seller
                </span>
              </label>
            </div>
          </div>

          {/* Row 3: Price and MRP */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="4999"
                required
                min={1}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Original MRP (₹) *
              </label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value ? Number(e.target.value) : "")}
                placeholder="6999"
                required
                min={1}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Row 4: Ratings and Reviews */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rating (1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reviews Count
              </label>
              <input
                type="number"
                min="0"
                value={reviews}
                onChange={(e) => setReviews(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Row 5: Product Image */}
          <ImageUploadZone
            value={img}
            onChange={setImg}
            presetImages={DEFAULT_IMAGE_OPTIONS}
            label="Product Photo (Upload File / Preset / URL)"
          />

          {/* Row 6: Description */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the leather cut, stitching technique, functionality..."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Row 7: Specifications / Bullet Details */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Specifications (One item per line)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Full-grain vegetable-tanned leather, 2.0mm&#10;Solid brass hardware&#10;Dimensions: 38 × 30 × 13 cm"
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Row 8: Colors and Sizes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Colors (Comma separated)
              </label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Cognac, Espresso, Black, Natural Tan"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sizes (Comma separated)
              </label>
              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="Regular, Large or 30, 32, 34"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-4 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark transition-colors cursor-pointer"
            >
              {productToEdit ? "Save Changes" : "Create Product"}
            </button>
          </DialogFooter>
        </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
