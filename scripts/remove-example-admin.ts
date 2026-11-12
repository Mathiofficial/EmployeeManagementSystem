
import "dotenv/config";
import { eq } from "drizzle-orm";

import { db, pool } from "../src/db";
import { users } from "../src/db/schema";
import { user as authUser } from "../src/db/auth-schema";

async function main() {
  const exampleEmail = "your-admin-email@example.com";

  try {
    await db.transaction(async (tx) => {
      await tx.delete(users).where(eq(users.email, exampleEmail));

      await tx.delete(authUser).where(eq(authUser.email, exampleEmail));
    });

    console.log("Example admin account removed successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exitCode = 1;
});
