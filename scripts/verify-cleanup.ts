import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function verify() {
  if (!process.env.DATABASE_URL) process.exit(1);

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const testRecords = await db.query.quotes.findMany({
    where: eq(schema.quotes.customerEmail, "fahimrahman9198@gmail.com"),
  });

  console.log(`\nTest email records remaining: ${testRecords.length}`);
  if (testRecords.length > 0) {
    testRecords.forEach(q => console.log(`  - ${q.quoteNumber}`));
  }
  process.exit(0);
}

verify();
