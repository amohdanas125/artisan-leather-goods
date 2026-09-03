import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, desc, eq, gte, ilike, lte, or, sql, SQL } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import {
  products,
  productImages,
  productVariants,
  categories,
} from "@/database/schema";
import { ProductQueryDto } from "./dto/product-query.dto";
import { CreateProductDto, VariantInputDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AddImageDto } from "./dto/add-image.dto";
import { UploadService } from "@/upload/upload.service";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly uploadService: UploadService
  ) {}

  /** Public listing with filtering, search, sort, and pagination. */
  async findAll(query: ProductQueryDto) {
    const conditions: SQL[] = [eq(products.isActive, true)];

    if (query.bestSeller !== undefined)
      conditions.push(eq(products.isBestSeller, query.bestSeller));
    if (query.isNew !== undefined) conditions.push(eq(products.isNew, query.isNew));
    if (query.minPrice !== undefined)
      conditions.push(gte(products.basePrice, String(query.minPrice)));
    if (query.maxPrice !== undefined)
      conditions.push(lte(products.basePrice, String(query.maxPrice)));
    if (query.search) {
      const clause = or(
        ilike(products.name, `%${query.search}%`),
        ilike(products.description, `%${query.search}%`)
      );
      if (clause) conditions.push(clause);
    }
    // colors/sizes are stored as a jsonb string array — ? checks containment
    if (query.color) conditions.push(sql`${products.colors} ? ${query.color}`);
    if (query.size) conditions.push(sql`${products.sizes} ? ${query.size}`);

    if (query.category) {
      const [cat] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, query.category))
        .limit(1);
      if (cat) conditions.push(eq(products.categoryId, cat.id));
    }

    const sortMap = {
      newest: desc(products.createdAt),
      price_asc: asc(products.basePrice),
      price_desc: desc(products.basePrice),
      rating: desc(products.avgRating),
      popularity: desc(products.reviewCount),
    } as const;

    const offset = (query.page - 1) * query.limit;

    const rows = await this.db.query.products.findMany({
      where: and(...conditions),
      orderBy: sortMap[query.sort],
      limit: query.limit,
      offset,
      with: {
        images: { orderBy: asc(productImages.sortOrder), limit: 3 },
        category: true,
      },
    });

    return { products: rows, page: query.page, limit: query.limit };
  }

  /** Public detail by slug — active products only, with variants, gallery, and reviews. */
  async findBySlug(slug: string) {
    const product = await this.db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.isActive, true)),
      with: {
        variants: true,
        images: { orderBy: asc(productImages.sortOrder) }, // full gallery
        category: true,
        reviews: {
          where: (reviews, { eq }) => eq(reviews.isApproved, true),
          orderBy: (reviews, { desc }) => desc(reviews.createdAt),
          limit: 20,
          with: { user: { columns: { name: true, image: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException("Product not found");

    // Self-healing: if product has 0 variants, generate default variants
    if (!product.variants || product.variants.length === 0) {
      const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ["Default"];
      const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["One Size"];
      const variantsToInsert = colors.flatMap((color) =>
        sizes.map((size) => ({
          productId: product.id,
          color,
          size,
          stockQty: 100,
        }))
      );
      const inserted = await this.db.insert(productVariants).values(variantsToInsert).returning();
      product.variants = inserted;
    }

    return product;
  }

  /* ---------------------------- admin ---------------------------- */

  async adminFindAll(search?: string) {
    return this.db.query.products.findMany({
      where: search
        ? or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`))
        : undefined,
      orderBy: desc(products.createdAt),
      with: { images: true, variants: true, category: true },
    });
  }

  async adminFindOne(id: string) {
    const product = await this.db.query.products.findFirst({
      where: eq(products.id, id),
      with: { images: true, variants: true, category: true },
    });
    if (!product) throw new NotFoundException("Product not found");

    if (!product.variants || product.variants.length === 0) {
      const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ["Default"];
      const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["One Size"];
      const variantsToInsert = colors.flatMap((color) =>
        sizes.map((size) => ({
          productId: product.id,
          color,
          size,
          stockQty: 100,
        }))
      );
      const inserted = await this.db.insert(productVariants).values(variantsToInsert).returning();
      product.variants = inserted;
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    const [product] = await this.db
      .insert(products)
      .values({
        ...productData,
        basePrice: String(productData.basePrice),
        mrp: String(productData.mrp),
      })
      .returning();

    const colors = Array.isArray(productData.colors) && productData.colors.length > 0 ? productData.colors : ["Default"];
    const sizes = Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ["One Size"];

    const variantsToInsert =
      variants && variants.length > 0
        ? variants
        : colors.flatMap((color) =>
            sizes.map((size) => ({
              color,
              size,
              stockQty: 100,
            }))
          );

    await this.db.insert(productVariants).values(
      variantsToInsert.map((v: any) => ({
        productId: product.id,
        color: v.color ?? "Default",
        size: v.size ?? "One Size",
        stockQty: v.stockQty ?? 100,
        sku: v.sku,
        priceOverride:
          v.priceOverride !== undefined ? String(v.priceOverride) : undefined,
        mrpOverride: v.mrpOverride !== undefined ? String(v.mrpOverride) : undefined,
      }))
    );

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const { variants, basePrice, mrp, ...body } = dto;

    const [updated] = await this.db
      .update(products)
      .set({
        ...body,
        ...(basePrice !== undefined && { basePrice: String(basePrice) }),
        ...(mrp !== undefined && { mrp: String(mrp) }),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) throw new NotFoundException("Product not found");

    if (variants && variants.length > 0) {
      await this.db.delete(productVariants).where(eq(productVariants.productId, id));
      await this.db.insert(productVariants).values(
        variants.map((v) => ({
          productId: id,
          color: v.color ?? "Default",
          size: v.size ?? "One Size",
          stockQty: v.stockQty ?? 100,
          sku: v.sku,
          priceOverride:
            v.priceOverride !== undefined ? String(v.priceOverride) : undefined,
          mrpOverride: v.mrpOverride !== undefined ? String(v.mrpOverride) : undefined,
        }))
      );
    }

    return updated;
  }

  /** Soft delete — keeps the row so historical orders keep valid references. */
  async archive(id: string) {
    const [updated] = await this.db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Product not found");
    return { message: "Product archived" };
  }

  async addImage(productId: string, dto: AddImageDto) {
    const [image] = await this.db
      .insert(productImages)
      .values({
        ...dto,
        b2FileKey: dto.b2FileKey || "product-image",
        productId,
      })
      .returning();
    return image;
  }

  async removeImage(imageId: string) {
    const [image] = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.id, imageId))
      .limit(1);
    if (!image) throw new NotFoundException("Image not found");

    await this.uploadService.deleteObject(image.b2FileKey);
    await this.db.delete(productImages).where(eq(productImages.id, imageId));
    return { message: "Image deleted" };
  }

  async addVariant(productId: string, dto: VariantInputDto) {
    const [variant] = await this.db
      .insert(productVariants)
      .values({
        productId,
        color: dto.color ?? "Default",
        size: dto.size ?? "One Size",
        stockQty: dto.stockQty ?? 0,
        sku: dto.sku,
        priceOverride:
          dto.priceOverride !== undefined ? String(dto.priceOverride) : undefined,
        mrpOverride: dto.mrpOverride !== undefined ? String(dto.mrpOverride) : undefined,
      })
      .returning();
    return variant;
  }
}
