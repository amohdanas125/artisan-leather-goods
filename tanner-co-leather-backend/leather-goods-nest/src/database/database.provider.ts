import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

export const DRIZZLE = "DRIZZLE_ORM";

// Enables the Pool driver (needed for real interactive transactions —
// used by CheckoutService) outside the browser. Requires the Node.js
// runtime; if you ever move this to an edge deployment, switch to
// drizzle-orm/neon-http instead (no interactive transaction support).
neonConfig.webSocketConstructor = ws;

export const databaseProviders: Provider[] = [
  {
    provide: DRIZZLE,
    inject: [ConfigService],
    useFactory: (config: ConfigService): NeonDatabase<typeof schema> => {
      const pool = new Pool({ connectionString: config.get<string>("DATABASE_URL") });
      return drizzle(pool, { schema });
    },
  },
];

export type DrizzleDB = NeonDatabase<typeof schema>;
