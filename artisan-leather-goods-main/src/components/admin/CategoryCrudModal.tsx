import { useEffect, useState } from "react";
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
import { api } from "@/lib/api";
import { useStore, type CategoryItem } from "@/lib/store";

import toteImg from "@/assets/p-tote.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import beltImg from "@/assets/p-belt.jpg";
import bootsImg from "@/assets/p-boots.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import heroImg from "@/assets/hero-leather.jpg";

const DEFAULT_CATEGORY_IMAGES = [
  { label: "Tote Bag", url: toteImg },
  { label: "Wallet", url: walletImg },
  { label: "Belt", url: beltImg },
  { label: "Boots", url: bootsImg },
  { label: "Duffel", url: duffelImg },
  { label: "Hero Hide", url: heroImg },
];

export function CategoryCrudModal({
  isOpen,
  onClose,
  categoryToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: CategoryItem | null;
}) {
  const { refreshCatalog } = useStore();

  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [blurb, setBlurb] = useState("");
  const [img, setImg] = useState<string>(toteImg);

  useEffect(() => {
    if (categoryToEdit) {
      setLabel(categoryToEdit.label);
      setSlug(categoryToEdit.slug);
      setBlurb(categoryToEdit.blurb);
      setImg(categoryToEdit.img || toteImg);
    } else {
      setLabel("");
      setSlug("");
      setBlurb("");
      setImg(toteImg);
    }
  }, [categoryToEdit, isOpen]);

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!categoryToEdit) {
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

    if (!label.trim()) {
      toast.error("Please enter a category title.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please enter a category slug.");
      return;
    }

    const backendDto = {
      name: label.trim(),
      slug: slug.trim(),
      blurb: blurb.trim() || "Handcrafted leather collection tailored for everyday elegance.",
      imageUrl: img || undefined,
    };

    (async () => {
      try {
        if (categoryToEdit?.id) {
          await api.admin.categories.update(categoryToEdit.id, backendDto);
        } else {
          await api.admin.categories.create(backendDto);
        }
        await refreshCatalog();
        toast.success(
          categoryToEdit
            ? `Category "${label}" updated successfully!`
            : `Category "${label}" created successfully!`,
        );
        onClose();
      } catch (err: any) {
        const isOfflineOrUnauthorized =
          err?.message?.includes("Unauthorized") ||
          err?.message?.includes("Failed to fetch") ||
          err?.message?.includes("NetworkError") ||
          err?.name === "TypeError";

        if (isOfflineOrUnauthorized) {
          const localCat = {
            id: categoryToEdit?.id || `local-cat-${Date.now()}`,
            slug: slug.trim(),
            label: label.trim(),
            blurb: blurb.trim() || "Handcrafted leather collection tailored for everyday elegance.",
            img: img || toteImg,
          };

          if (categoryToEdit) {
            updateCategory(categoryToEdit.slug, localCat);
            toast.success(`Category "${label}" updated locally!`);
          } else {
            createCategory(localCat);
            toast.success(`Category "${label}" created locally!`);
          }
          onClose();
          return;
        }

        toast.error(err.message || "Failed to save category.");
      }
    })();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle className="text-xl font-bold text-ink">
            {categoryToEdit ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {categoryToEdit
              ? "Update category title, slug, and promotional blurb."
              : "Create a new department to organize handcrafted leather products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category Title *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. Jackets & Outerwear"
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
              placeholder="e.g. jackets"
              required
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Blurb / Subtitle
            </label>
            <textarea
              rows={2}
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="e.g. Hand-tailored leather jackets and overcoats cut from full-grain hides."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <ImageUploadZone
            value={img}
            onChange={setImg}
            presetImages={DEFAULT_CATEGORY_IMAGES}
            label="Category Thumbnail Photo"
            folder="categories"
          />

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
              {categoryToEdit ? "Save Changes" : "Create Category"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
