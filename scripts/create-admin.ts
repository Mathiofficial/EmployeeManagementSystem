
import "dotenv/config";
import { eq } from "drizzle-orm";

import { auth } from "../src/lib/auth";
import { db, pool } from "../src/db";
import { users } from "../src/db/schema";

async function main() {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    }

    if (password.length < 8 || password.length > 128) {
      throw new Error("Password must contain 8–128 characters.");
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error("An application user with this email already exists.");
    }

    // Create the Better Auth login account
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Connect it to the application's ADMIN role
    await db.insert(users).values({
      email,
      passwordHash: "BETTER_AUTH_MANAGED",
      role: "ADMIN",
      employeeId: null,
      authUserId: result.user.id,
    });

    console.log("ADMIN account created and linked successfully.");
    console.log("Admin email:", email);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Admin creation failed:", error);
  process.exitCode = 1;
});
