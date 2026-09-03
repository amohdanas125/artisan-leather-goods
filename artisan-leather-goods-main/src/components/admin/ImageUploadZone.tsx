import React, { useRef, useState } from "react";
import { Check, ImagePlus, Link as LinkIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ImageUploadZoneProps {
  value: string;
  onChange: (url: string) => void;
  presetImages?: Array<{ label: string; url: string }>;
  label?: string;
  folder?: "products" | "categories";
}

/**
 * Resizes an image file to max dimensions and converts to JPEG Data URL
 */
async function compressImageFile(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUploadZone({
  value = "",
  onChange,
  presetImages = [],
  label = "Product Image",
  folder = "products",
}: ImageUploadZoneProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "url">("upload");
  const [customUrl, setCustomUrl] = useState(() => {
    const val = value || "";
    return val && !val.startsWith("data:") && !(presetImages || []).some((p) => p.url === val) ? val : "";
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setIsProcessing(true);
    try {
      // 1. Attempt uploading directly to Backblaze B2 via backend presigned URL
      try {
        const publicB2Url = await api.admin.upload.uploadFile(file, folder);
        onChange(publicB2Url);
        toast.success("Image uploaded directly to Backblaze B2!");
        return;
      } catch (uploadErr: any) {
        console.warn("Direct B2 upload failed or backend not reachable, falling back to local processing:", uploadErr);
        if (uploadErr?.message?.toLowerCase().includes("unauthorized")) {
          toast.error("Admin session expired. Please Sign Out and log back in to upload to Backblaze B2.");
        } else {
          toast.error(`Storage upload error: ${uploadErr?.message || "Authentication required"}. Attached preview locally.`);
        }
      }

      // 2. Fallback to local optimized base64 if backend is not reachable
      const compressedDataUrl = await compressImageFile(file);
      onChange(compressedDataUrl);
    } catch (err) {
      toast.error("Could not process the selected image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      toast.error("Please enter a valid image URL.");
      return;
    }
    onChange(customUrl.trim());
    toast.success("Custom image URL applied!");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {/* Mode Selector */}
        <div className="flex rounded-lg border border-border bg-muted/50 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "bg-card text-ink shadow-2xs font-bold"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            <Upload className="h-3 w-3" />
            <span>Upload File</span>
          </button>
          {presetImages.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors cursor-pointer ${
                activeTab === "presets"
                  ? "bg-card text-ink shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              <ImagePlus className="h-3 w-3" />
              <span>Presets</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors cursor-pointer ${
              activeTab === "url"
                ? "bg-card text-ink shadow-2xs font-bold"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
          />

          {value ? (
            <div className="relative flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                <img src={value} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    {typeof value === "string" && value.includes("backblazeb2.com")
                      ? "Uploaded to Backblaze B2"
                      : "Image Attached"}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-muted-foreground font-mono">
                  {typeof value === "string" && value.startsWith("data:")
                    ? "Local File (Optimized)"
                    : String(value || "")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-ink shadow-2xs hover:border-primary cursor-pointer transition-colors"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/80 bg-muted/20 hover:border-primary hover:bg-muted/40"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <p className="text-xs font-bold text-ink">
                {isProcessing ? "Uploading directly to Backblaze B2…" : "Click to Upload or Drag & Drop Image"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Auto-synced to Backblaze B2 Cloud Storage (PNG, JPG, WebP)
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "presets" && presetImages.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {presetImages.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  onChange(opt.url);
                  toast.success(`Preset "${opt.label}" selected!`);
                }}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                  value === opt.url
                    ? "border-primary ring-2 ring-primary/30 scale-105 shadow-xs"
                    : "border-border opacity-70 hover:opacity-100"
                }`}
                title={opt.label}
              >
                <img src={opt.url} alt={opt.label} className="h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white text-center truncate">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-2xs hover:bg-primary-dark cursor-pointer transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
