import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, avg, count, desc, eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { orderItems, orders, products, reviews } from "@/database/schema";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  /** A user may review a product only if they have a delivered order
   *  containing it. Goes into a moderation queue until an admin approves it. */
  async create(userId: string, dto: CreateReviewDto) {
    const [purchase] = await this.db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.productId, dto.productId),
          eq(orders.status, "delivered")
        )
      )
      .limit(1);

    if (!purchase)
      throw new ForbiddenException("You can only review products from a delivered order.");

    const [review] = await this.db
      .insert(reviews)
      .values({
        productId: dto.productId,
        userId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
      })
      .returning();

    return review;
  }

  /* ---------------------------- admin ---------------------------- */

  findAllAdmin(status?: "pending" | "approved") {
    return this.db.query.reviews.findMany({
      where:
        status === "pending"
          ? eq(reviews.isApproved, false)
          : status === "approved"
          ? eq(reviews.isApproved, true)
          : undefined,
      orderBy: desc(reviews.createdAt),
      with: {
        product: { columns: { name: true, slug: true } },
        user: { columns: { name: true, email: true } },
      },
    });
  }

  async moderate(id: string, isApproved: boolean) {
    const [updated] = await this.db
      .update(reviews)
      .set({ isApproved })
      .where(eq(reviews.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Review not found");

    await this.recalcProductRating(updated.productId);
    return updated;
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(reviews).where(eq(reviews.id, id)).returning();
    if (deleted) await this.recalcProductRating(deleted.productId);
    return { message: "Review deleted" };
  }

  private async recalcProductRating(productId: string) {
    const [stats] = await this.db
      .select({ avgRating: avg(reviews.rating), reviewCount: count(reviews.id) })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));

    await this.db
      .update(products)
      .set({
        avgRating: stats.avgRating ?? "0",
        reviewCount: Number(stats.reviewCount ?? 0),
      })
      .where(eq(products.id, productId));
  }
}
