import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB } from "@/database/database.provider";
import { categories, products } from "@/database/schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  list() {
    return this.db.select().from(categories);
  }

  async create(dto: CreateCategoryDto) {
    const [category] = await this.db.insert(categories).values(dto).returning();
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const [updated] = await this.db
      .update(categories)
      .set(dto)
      .where(eq(categories.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Category not found");
    return updated;
  }

  async remove(id: string) {
    await this.db
      .update(products)
      .set({ categoryId: null })
      .where(eq(products.categoryId, id));

    const [deleted] = await this.db.delete(categories).where(eq(categories.id, id)).returning();
    if (!deleted) throw new NotFoundException("Category not found");
    return { message: "Category deleted" };
  }
}
