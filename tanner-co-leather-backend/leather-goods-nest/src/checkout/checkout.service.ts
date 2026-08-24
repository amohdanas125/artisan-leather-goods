import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import {
  addresses,
  cartItems,
  carts,
  coupons,
  orderItems,
  orders,
  productVariants,
  products,
  productImages,
  users,
} from "@/database/schema";
import { CheckoutDto } from "./dto/checkout.dto";
import { generateOrderNumber } from "@/common/utils/order-number.util";
import { AuthUser } from "@/common/decorators/current-user.decorator";
import { PaymentsService } from "@/payments/payments.service";
import { MailService } from "@/mail/mail.service";

const SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly payments: PaymentsService,
    private readonly mail: MailService
  ) {}

  async checkout(user: AuthUser, dto: CheckoutDto) {
    // 1. Resolve the shipping address (existing or newly provided)
    let addressId = dto.addressId;
    if (!addressId && dto.newAddress) {
      const [addr] = await this.db
        .insert(addresses)
        .values({ ...dto.newAddress, userId: user.id })
        .returning();
      addressId = addr.id;
    }
    if (!addressId) throw new BadRequestException("A shipping address is required");

    const [address] = await this.db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .limit(1);
    if (!address || address.userId !== user.id) throw new NotFoundException("Address not found");

    // 2. Load the user's cart + items
    const [cart] = await this.db.select().from(carts).where(eq(carts.userId, user.id)).limit(1);
    if (!cart) throw new BadRequestException("Your cart is empty");

    const items = await this.db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        priceAtAdd: cartItems.priceAtAdd,
        productName: products.name,
        variantStock: productVariants.stockQty,
        color: productVariants.color,
        size: productVariants.size,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(eq(cartItems.cartId, cart.id));

    if (items.length === 0) throw new BadRequestException("Your cart is empty");

    // 3. Verify stock before committing to a transaction
    for (const item of items) {
      if (item.variantStock < item.quantity) {
        throw new BadRequestException(
          `"${item.productName}" only has ${item.variantStock} left in stock`
        );
      }
    }

    const subtotal = items.reduce((sum, i) => sum + Number(i.priceAtAdd) * i.quantity, 0);

    // 4. Validate coupon (if provided)
    let discount = 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const [coupon] = await this.db
        .select()
        .from(coupons)
        .where(eq(coupons.code, dto.couponCode.toUpperCase()))
        .limit(1);

      if (!coupon || !coupon.isActive) throw new BadRequestException("Invalid coupon code");
      if (coupon.expiryDate && coupon.expiryDate < new Date())
        throw new BadRequestException("This coupon has expired");
      if (coupon.usageLimit && (coupon.timesUsed ?? 0) >= coupon.usageLimit)
        throw new BadRequestException("This coupon has reached its usage limit");
      if (subtotal < Number(coupon.minOrderValue ?? 0))
        throw new BadRequestException("Order does not meet the coupon's minimum value");

      discount =
        coupon.discountType === "percent"
          ? (subtotal * Number(coupon.discountValue)) / 100
          : Number(coupon.discountValue);
      discount = Math.min(discount, subtotal);
      couponId = coupon.id;
    }

    const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal - discount + shippingFee;

    // 5. Run the whole order creation as one atomic transaction
    const order = await this.db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          userId: user.id,
          paymentMethod: dto.paymentMethod,
          paymentStatus: "pending",
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          shippingFee: shippingFee.toFixed(2),
          total: total.toFixed(2),
          couponId,
          addressId,
        })
        .returning();

      for (const item of items) {
        const [image] = await tx
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, item.productId))
          .limit(1);

        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.priceAtAdd,
          productNameSnapshot: item.productName,
          productImageSnapshot: image?.url,
          colorSnapshot: item.color,
          sizeSnapshot: item.size,
        });

        await tx
          .update(productVariants)
          .set({ stockQty: sql`${productVariants.stockQty} - ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }

      if (couponId) {
        await tx
          .update(coupons)
          .set({ timesUsed: sql`${coupons.timesUsed} + 1` })
          .where(eq(coupons.id, couponId));
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      return newOrder;
    });

    // 6. For online payments, create a Razorpay order via wretch so the
    //    frontend can open the payment sheet. A webhook (add when ready)
    //    should flip paymentStatus to "paid" — never trust the client for that.
    let paymentOrder = null;
    if (dto.paymentMethod === "online") {
      paymentOrder = await this.payments.createOrder(total, order.orderNumber);
    }

    // 7. Fire the confirmation email (best-effort — failures are logged, not thrown)
    await this.mail.sendOrderConfirmationEmail(user.email, order.orderNumber, total.toFixed(2));

    return { order, paymentOrder };
  }
}
