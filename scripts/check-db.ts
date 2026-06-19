import { config } from "dotenv";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { db, schema } = await import("../src/lib/db");

  const result = await db.execute(sql`select current_database() as database_name`);
  const databaseName = result.rows[0]?.database_name;
  const customers = await db.select({ id: schema.customers.id }).from(schema.customers).limit(1);

  console.log(`Database connection OK: ${databaseName}`);
  console.log(`Customers table query OK: ${customers.length} sample rows`);
}

main().catch((error) => {
  console.error("Database check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
