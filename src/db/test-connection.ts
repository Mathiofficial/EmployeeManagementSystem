
import { db, pool } from "./index";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    const result = await db.execute(
      sql`SELECT 1 AS connected`
    );

    console.log("Database connected successfully!");
    console.log(result.rows);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await pool.end();
  }
}

testConnection();
