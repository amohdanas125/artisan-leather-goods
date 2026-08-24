import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { users } from "@/database/schema";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getProfile(userId: string) {
    const [profile] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        image: users.image,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const [updated] = await this.db
      .update(users)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.avatarB2Key && { avatarB2Key: dto.avatarB2Key }),
        ...(dto.avatarUrl && { image: dto.avatarUrl }),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, image: users.image });
    return updated;
  }
}
