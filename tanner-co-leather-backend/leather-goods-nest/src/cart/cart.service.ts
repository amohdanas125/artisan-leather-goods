import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { carts, cartItems, productVariants, products, productImages } from "@/database/schema";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { AuthUser } from "@/common/decorators/current-user.decorator";

@Injectable()
export class CartService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  /** Finds the current user's cart, or the guest cart tied to the
   *  x-cart-session header, creating one if it doesn't exist yet. */
  private async getOrCreateCart(user: AuthUser | null, sessionId?: string) {
    if (user) {
      let [cart] = await this.db.select().from(carts).where(eq(carts.userId, user.id)).limit(1);
      if (!cart) [cart] = await this.db.insert(carts).values({ userId: user.id }).returning();
      return cart;
    }

    if (!sessionId) return null;

    let [cart] = await this.db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
    if (!cart) [cart] = await this.db.insert(carts).values({ sessionId }).returning();
    return cart;
  }

  async getCart(user: AuthUser | null, sessionId?: string) {
    const cart = await this.getOrCreateCart(user, sessionId);
    if (!cart) return { cart: null, items: [], subtotal: 0 };

    const items = await this.db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        priceAtAdd: cartItems.priceAtAdd,
        product: { id: products.id, name: products.name, slug: products.slug },
        variant: {
          id: productVariants.id,
          color: productVariants.color,
          size: productVariants.size,
          price: productVariants.priceOverride,
          stockQty: productVariants.stockQty,
        },
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id));

    const withImages = await Promise.all(
      items.map(async (item) => {
        const [image] = await this.db
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, item.product.id))
          .limit(1);
        return { ...item, image: image?.url ?? null };
      })
    );

    const subtotal = withImages.reduce((sum, i) => sum + Number(i.priceAtAdd) * i.quantity, 0);

    return { cart: { id: cart.id }, items: withImages, subtotal };
  }

  async addItem(user: AuthUser | null, sessionId: string | undefined, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(user, sessionId);
    if (!cart)
      throw new BadRequestException(
        "Missing cart session. Send an x-cart-session header for guest carts."
      );

    const [variant] = await this.db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, dto.variantId))
      .limit(1);
    if (!variant) throw new NotFoundException("Variant not found");
    if (variant.stockQty < dto.quantity)
      throw new BadRequestException("Not enough stock for the requested quantity");

    const [product] = await this.db
      .select({ basePrice: products.basePrice })
      .from(products)
      .where(eq(products.id, dto.productId))
      .limit(1);
    if (!product) throw new NotFoundException("Product not found");

    const effectivePrice = variant.priceOverride ?? product.basePrice;

    const [existing] = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, dto.variantId)))
      .limit(1);

    if (existing) {
      const [item] = await this.db
        .update(cartItems)
        .set({ quantity: existing.quantity + dto.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return item;
    }

    const [item] = await this.db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
        priceAtAdd: effectivePrice,
      })
      .returning();
    return item;
  }

  async updateItem(itemId: string, quantity: number) {
    const [item] = await this.db.select().from(cartItems).where(eq(cartItems.id, itemId)).limit(1);
    if (!item) throw new NotFoundException("Cart item not found");

    const [variant] = await this.db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, item.variantId))
      .limit(1);
    if (variant && variant.stockQty < quantity)
      throw new BadRequestException("Not enough stock for the requested quantity");

    const [updated] = await this.db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId))
      .returning();
    return updated;
  }

  async removeItem(itemId: string) {
    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));
    return { message: "Removed from cart" };
  }
}
