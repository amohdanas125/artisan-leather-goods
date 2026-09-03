import "dotenv/config";
import { eq } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const allProducts = await db.select().from(schema.products);
  console.log(`Found ${allProducts.length} products in DB.`);

  for (const product of allProducts) {
    const existingVariants = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.productId, product.id));

    if (existingVariants.length === 0) {
      console.log(`Creating variants for product: ${product.name} (${product.slug})`);
      const colors = (Array.isArray(product.colors) && product.colors.length > 0) ? product.colors : ["Default"];
      const sizes = (Array.isArray(product.sizes) && product.sizes.length > 0) ? product.sizes : ["One Size"];

      for (const color of colors) {
        for (const size of sizes) {
          await db.insert(schema.productVariants).values({
            productId: product.id,
            color,
            size,
            stockQty: 100,
          });
        }
      }
      console.log(`Created variants for ${product.slug}!`);
    } else {
      console.log(`Product ${product.slug} already has ${existingVariants.length} variants.`);
    }
  }

  await pool.end();
  console.log("Variant repair completed successfully!");
}

run().catch((err) => {
  console.error("Repair failed:", err);
  process.exit(1);
});
