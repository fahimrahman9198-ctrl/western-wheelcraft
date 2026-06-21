import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function cleanupRecords() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  try {
    console.log("\n=== Cleaning Test Records ===\n");

    // Delete communications first (foreign key dependency)
    const commResult = await db
      .delete(schema.communications)
      .where(eq(schema.communications.customerId, "32c2aed2-0735-41b0-b5a2-ffae0e016bfc"));
    console.log(`Deleted communications`);

    // Delete quotes
    const quoteResult = await db
      .delete(schema.quotes)
      .where(eq(schema.quotes.customerId, "32c2aed2-0735-41b0-b5a2-ffae0e016bfc"));
    console.log(`Deleted quotes`);

    // Delete bookings
    const bookingResult = await db
      .delete(schema.bookings)
      .where(eq(schema.bookings.customerId, "32c2aed2-0735-41b0-b5a2-ffae0e016bfc"));
    console.log(`Deleted bookings`);

    // Delete customer
    const customerResult = await db
      .delete(schema.customers)
      .where(eq(schema.customers.id, "32c2aed2-0735-41b0-b5a2-ffae0e016bfc"));
    console.log(`Deleted customer\n`);

    console.log("✓ Cleanup complete");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

cleanupRecords();
