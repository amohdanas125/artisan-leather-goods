import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq, sql } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { coupons } from "@/database/schema";
import { CreateCouponDto } from "./dto/create-coupon.dto";

@Injectable()
export class CouponsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async validate(code: string, subtotal: number) {
    const [coupon] = await this.db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()))
      .limit(1);

    if (!coupon || !coupon.isActive) throw new NotFoundException("Invalid coupon code");
    if (coupon.expiryDate && coupon.expiryDate < new Date())
      throw new BadRequestException("This coupon has expired");
    if (coupon.usageLimit && (coupon.timesUsed ?? 0) >= coupon.usageLimit)
      throw new BadRequestException("This coupon has reached its usage limit");
    if (subtotal < Number(coupon.minOrderValue ?? 0))
      throw new BadRequestException(
        `This coupon requires a minimum order of ₹${coupon.minOrderValue}`
      );

    const discount =
      coupon.discountType === "percent"
        ? (subtotal * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: Math.min(discount, subtotal),
    };
  }

  /* ---------------------------- admin ---------------------------- */

  list() {
    return this.db.select().from(coupons).orderBy(desc(coupons.id));
  }

  async create(dto: CreateCouponDto) {
    const [coupon] = await this.db
      .insert(coupons)
      .values({
        ...dto,
        discountValue: String(dto.discountValue),
        minOrderValue: String(dto.minOrderValue ?? 0),
      })
      .returning();
    return coupon;
  }

  async update(id: string, dto: Partial<CreateCouponDto>) {
    const { discountValue, minOrderValue, ...body } = dto;
    const [updated] = await this.db
      .update(coupons)
      .set({
        ...body,
        ...(discountValue !== undefined && { discountValue: String(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: String(minOrderValue) }),
      })
      .where(eq(coupons.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Coupon not found");
    return updated;
  }

  async remove(id: string) {
    await this.db.delete(coupons).where(eq(coupons.id, id));
    return { message: "Coupon deleted" };
  }
}
