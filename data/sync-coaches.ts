/**
 * Sync coaches from a freshly scraped CSV into the database.
 *
 * Usage:
 *   1. Run super_scrape.py to produce a new CSV
 *   2. npx tsx data/sync-coaches.ts <path-to-new-csv>
 *
 * This script:
 *   - Reads the new CSV
 *   - Compares each row against existing coaches (matched by email)
 *   - Inserts only coaches whose email doesn't already exist
 *   - Reports how many new coaches were added
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { coaches } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

// State abbreviation → region mapping (same as seed data)
const STATE_REGIONS: Record<string, string> = {
  CT: "Northeast", ME: "Northeast", MA: "Northeast", NH: "Northeast",
  RI: "Northeast", VT: "Northeast", NJ: "Northeast", NY: "Northeast",
  PA: "Northeast", DE: "Northeast", MD: "Northeast", DC: "Northeast",
  IL: "Midwest", IN: "Midwest", MI: "Midwest", OH: "Midwest",
  WI: "Midwest", IA: "Midwest", KS: "Midwest", MN: "Midwest",
  MO: "Midwest", NE: "Midwest", ND: "Midwest", SD: "Midwest",
  AL: "South", AR: "South", FL: "South", GA: "South", KY: "South",
  LA: "South", MS: "South", NC: "South", SC: "South", TN: "South",
  VA: "South", WV: "South", TX: "South", OK: "South",
  AZ: "West", CO: "West", ID: "West", MT: "West", NV: "West",
  NM: "West", UT: "West", WY: "West", AK: "West", CA: "West",
  HI: "West", OR: "West", WA: "West",
};

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function normalizeDivision(div: string): string {
  const d = div.trim();
  if (/division\s*i$/i.test(d) || /^d1$/i.test(d)) return "NCAA D1";
  if (/division\s*ii/i.test(d) || /^d2$/i.test(d)) return "NCAA D2";
  if (/division\s*iii/i.test(d) || /^d3$/i.test(d)) return "NCAA D3";
  if (/naia/i.test(d)) return "NAIA";
  if (/njcaa/i.test(d)) return "NJCAA";
  return d;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx data/sync-coaches.ts <path-to-csv>");
    console.error("\nExample:");
    console.error("  npx tsx data/sync-coaches.ts ~/Desktop/recruitboost/recruitref_coaches_scraped.csv");
    process.exit(1);
  }

  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const pgSql = neon(process.env.DATABASE_URL!);
  const db = drizzle(pgSql);

  // 1. Read the CSV
  console.log(`Reading CSV from: ${resolvedPath}`);
  const csvContent = fs.readFileSync(resolvedPath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  console.log(`Found ${records.length} total records in CSV`);

  // Filter to records with a coach name and email
  const validRecords = records.filter(
    (r) => r["Coach Name"]?.trim() && r["Email"]?.trim()
  );
  console.log(`${validRecords.length} records have coach names and emails`);

  // 2. Get all existing emails from the database
  console.log("Fetching existing coach emails from database...");
  const existingEmails = new Set(
    (await db.select({ email: coaches.email }).from(coaches)).map((r) => r.email.toLowerCase())
  );
  console.log(`${existingEmails.size} coaches already in database`);

  // 3. Find new coaches
  const newRecords = validRecords.filter(
    (r) => !existingEmails.has(r["Email"].trim().toLowerCase())
  );
  console.log(`${newRecords.length} new coaches to insert`);

  if (newRecords.length === 0) {
    console.log("\nDatabase is already up to date! No new coaches found.");
    return;
  }

  // 4. Insert new coaches in batches
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
    const batch = newRecords.slice(i, i + BATCH_SIZE);
    const values = batch.map((row) => {
      const { firstName, lastName } = parseName(row["Coach Name"]);
      const state = row["State"]?.trim() || null;
      const division = row["Division"] ? normalizeDivision(row["Division"]) : null;
      const region = row["Region"]?.trim() || (state ? STATE_REGIONS[state] || null : null);

      return {
        firstName,
        lastName,
        email: row["Email"].trim(),
        phone: row["Phone"]?.trim() || null,
        school: row["School"]?.trim() || "",
        sport: row["Sport"]?.trim() || "",
        division,
        conference: row["Conference"]?.trim() || null,
        role: row["Coach Role"]?.trim() || null,
        state,
        region,
      };
    });

    await db.insert(coaches).values(values);
    inserted += values.length;
    console.log(`Inserted ${inserted}/${newRecords.length} new coaches`);
  }

  // 5. Report final count
  const result = await db.select({ count: sql<number>`count(*)` }).from(coaches);
  console.log(`\nSync complete! Total coaches in database: ${result[0]?.count}`);
  console.log(`Added ${newRecords.length} new coaches.`);
}

main().catch(console.error);
