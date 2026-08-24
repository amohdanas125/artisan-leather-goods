const { neon } = require('@neondatabase/serverless');
const databaseUrl = "postgresql://neondb_owner:npg_SYTOB4o7ZMrQ@ep-round-queen-aza0i9wi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function main() {
  try {
    await sql`ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing' AFTER 'confirmed'`;
    console.log("Successfully added 'processing' to order_status enum in Neon DB");
  } catch (err) {
    console.error("Error executing query:", err);
  }
}

main();
