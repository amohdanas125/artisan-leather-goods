import { Inject, Injectable } from "@nestjs/common";
import { and, count, desc, gte, sql, sum } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { orders, products, productVariants, users } from "@/database/schema";

@Injectable()
export class AdminDashboardService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [revenueRow] = await this.db
      .select({ total: sum(orders.total) })
      .from(orders)
      .where(sql`${orders.paymentStatus} = 'paid'`);

    const [ordersTodayRow] = await this.db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.placedAt, startOfToday));

    const [newCustomersRow] = await this.db
      .select({ count: count() })
      .from(users)
      .where(and(sql`${users.role} = 'customer'`, gte(users.createdAt, startOfWeek)));

    const lowStock = await this.db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        productName: products.name,
        color: productVariants.color,
        size: productVariants.size,
        stockQty: productVariants.stockQty,
      })
      .from(productVariants)
      .innerJoin(products, sql`${productVariants.productId} = ${products.id}`)
      .where(sql`${productVariants.stockQty} <= 5`)
      .limit(10);

    const recentOrders = await this.db.query.orders.findMany({
      orderBy: desc(orders.placedAt),
      limit: 10,
      with: { user: { columns: { name: true, email: true } } },
    });

    return {
      totalRevenue: Number(revenueRow?.total ?? 0),
      ordersToday: ordersTodayRow?.count ?? 0,
      newCustomersThisWeek: newCustomersRow?.count ?? 0,
      lowStockVariants: lowStock,
      recentOrders,
    };
  }
}
