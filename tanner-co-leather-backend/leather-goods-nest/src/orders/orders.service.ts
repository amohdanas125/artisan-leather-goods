import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { orders } from "@/database/schema";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AuthUser } from "@/common/decorators/current-user.decorator";

@Injectable()
export class OrdersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  findAllForUser(userId: string) {
    return this.db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: desc(orders.placedAt),
      with: { items: true, address: true },
    });
  }

  async findOne(id: string, requester: AuthUser) {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true, address: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (order.userId !== requester.id && requester.role !== "admin")
      throw new ForbiddenException("Forbidden");
    return order;
  }

  /* ---------------------------- admin ---------------------------- */

  findAllAdmin(status?: string) {
    return this.db.query.orders.findMany({
      where: status ? eq(orders.status, status as any) : undefined,
      orderBy: desc(orders.placedAt),
      with: { items: true, user: { columns: { name: true, email: true } } },
    });
  }

  async findOneAdmin(id: string) {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true, address: true, user: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const [updated] = await this.db.update(orders).set(dto).where(eq(orders.id, id)).returning();
    if (!updated) throw new NotFoundException("Order not found");
    return updated;
  }
}
