import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

async function checkRecords() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  try {
    console.log("\n=== Test Records ===\n");

    // Quotes
    const quotes = await db.query.quotes.findMany({
      limit: 5,
    });
    console.log(`Found ${quotes.length} quotes:`);
    quotes.slice(-3).forEach(q => {
      console.log(`  - ${q.quoteNumber} | ${q.source} | ${q.customerName}`);
    });

    // Bookings
    const bookings = await db.query.bookings.findMany({
      limit: 5,
    });
    console.log(`\nFound ${bookings.length} bookings:`);
    bookings.slice(-2).forEach(b => {
      console.log(`  - ${b.bookingNumber} | ${b.customerId.slice(0, 8)}...`);
    });

    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

checkRecords();
