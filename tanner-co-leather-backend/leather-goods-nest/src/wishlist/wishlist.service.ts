import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { wishlists, products, productImages } from "@/database/schema";

@Injectable()
export class WishlistService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async list(userId: string) {
    const rows = await this.db
      .select({
        id: wishlists.id,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          basePrice: products.basePrice,
          mrp: products.mrp,
        },
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId));

    return Promise.all(
      rows.map(async (row) => {
        const [image] = await this.db
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, row.product.id))
          .limit(1);
        return { ...row, image: image?.url ?? null };
      })
    );
  }

  async add(userId: string, productId: string) {
    const [item] = await this.db
      .insert(wishlists)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning();
    return item;
  }

  async remove(userId: string, productId: string) {
    await this.db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return { message: "Removed from wishlist" };
  }
}
