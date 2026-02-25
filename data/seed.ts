import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { coaches } from "../db/schema";
import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

const CSV_PATH = path.join(process.cwd(), "data", "final_corrected_schools.csv");

const pgSql = neon(process.env.DATABASE_URL!);
const db = drizzle(pgSql);

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function main() {
  console.log("Reading CSV...");
  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  console.log(`Found ${records.length} records in CSV`);

  const validRecords = records.filter(
    (r) => r["Coach Name"]?.trim() && r["Email"]?.trim()
  );
  console.log(`${validRecords.length} records have coach names and emails`);

  // Clear existing coaches before seeding
  await db.delete(coaches);
  console.log("Cleared existing coaches");

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
    const batch = validRecords.slice(i, i + BATCH_SIZE);
    const values = batch.map((row) => {
      const { firstName, lastName } = parseName(row["Coach Name"]);
      return {
        firstName,
        lastName,
        email: row["Email"],
        phone: row["Phone"] || null,
        school: row["School"] || "",
        sport: row["Sport"] || "",
        division: row["Division"] || null,
        conference: row["Conference"] || null,
        role: row["Coach Role"] || null,
        state: row["State"] || null,
        region: row["Region"] || null,
      };
    });

    await db.insert(coaches).values(values);
    inserted += values.length;
    console.log(`Inserted ${inserted}/${validRecords.length} coaches`);
  }

  const result = await db.select({ count: sql<number>`count(*)` }).from(coaches);
  console.log(`\nSeed complete! Total coaches in database: ${result[0]?.count}`);
}

main().catch(console.error);
