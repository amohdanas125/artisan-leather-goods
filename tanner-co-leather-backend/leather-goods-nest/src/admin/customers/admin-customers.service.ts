import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq, sql } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import {
  users,
  orders,
  orderItems,
  addresses,
  wishlists,
  carts,
  cartItems,
} from "@/database/schema";

@Injectable()
export class AdminCustomersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(search?: string, roleFilter?: string) {
    const query = this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        totalOrders: sql<number>`cast(count(${orders.id}) as int)`,
        lifetimeSpent: sql<number>`cast(coalesce(sum(case when ${orders.status} != 'cancelled' then cast(${orders.total} as numeric) else 0 end), 0) as float)`,
        lastOrderAt: sql<string | null>`max(${orders.placedAt})`,
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));

    let all = await query;

    if (search) {
      const q = search.toLowerCase();
      all = all.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q)),
      );
    }

    if (roleFilter && roleFilter !== "all") {
      all = all.filter((u) => u.role === roleFilter);
    }

    return all;
  }

  async findOne(id: string) {
    const [customer] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!customer) throw new NotFoundException("Customer not found");

    const orderHistory = await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, id))
      .orderBy(desc(orders.placedAt));

    const totalOrders = orderHistory.length;
    const lifetimeSpent = orderHistory
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      customer: {
        ...customer,
        totalOrders,
        lifetimeSpent,
      },
      orders: orderHistory,
    };
  }

  async setBlocked(id: string, isBlocked: boolean) {
    const [updated] = await this.db
      .update(users)
      .set({ isBlocked })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
      });
    if (!updated) throw new NotFoundException("Customer not found");
    return updated;
  }

  async setRole(id: string, role: "customer" | "admin") {
    const [updated] = await this.db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
      });
    if (!updated) throw new NotFoundException("Customer not found");
    return updated;
  }

  async deleteCustomer(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      throw new BadRequestException("You cannot delete your own administrator account.");
    }

    return await this.db.transaction(async (tx) => {
      // 1. Delete customer cart and cart items
      const [userCart] = await tx.select().from(carts).where(eq(carts.userId, id));
      if (userCart) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
        await tx.delete(carts).where(eq(carts.id, userCart.id));
      }

      // 2. Delete customer wishlists
      await tx.delete(wishlists).where(eq(wishlists.userId, id));

      // 3. Delete customer orders and order items first (orders reference addresses)
      const userOrders = await tx.select().from(orders).where(eq(orders.userId, id));
      for (const ord of userOrders) {
        await tx.delete(orderItems).where(eq(orderItems.orderId, ord.id));
      }
      await tx.delete(orders).where(eq(orders.userId, id));

      // 4. Delete customer saved addresses
      await tx.delete(addresses).where(eq(addresses.userId, id));

      // 5. Delete customer user record
      const [deleted] = await tx
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id, name: users.name });

      if (!deleted) throw new NotFoundException("Customer not found");
      return { message: "Customer account deleted successfully", customer: deleted };
    });
  }
}
