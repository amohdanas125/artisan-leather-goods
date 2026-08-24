import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { addresses } from "@/database/schema";
import { AddressDto } from "./dto/address.dto";

@Injectable()
export class AddressesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  list(userId: string) {
    return this.db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async create(userId: string, dto: AddressDto) {
    if (dto.isDefault) {
      await this.db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }
    const [address] = await this.db
      .insert(addresses)
      .values({ ...dto, userId })
      .returning();
    return address;
  }

  async update(userId: string, id: string, dto: Partial<AddressDto>) {
    if (dto.isDefault) {
      await this.db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }
    const [updated] = await this.db
      .update(addresses)
      .set(dto)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();
    if (!updated) throw new NotFoundException("Address not found");
    return updated;
  }

  async remove(userId: string, id: string) {
    await this.db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
    return { message: "Address deleted" };
  }
}
