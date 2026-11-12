
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type AppRole = "ADMIN" | "EMPLOYEE";

export async function requireRole(allowedRoles: AppRole[]) {
  // Check the Better Auth session
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });

  if (!session) {
    throw new Error("Unauthorized: Please log in.");
  }

  // Find the application user
  const appUser = await db.query.users.findFirst({
    where: eq(users.authUserId, session.user.id),
    columns: {
      id: true,
      email: true,
      role: true,
      employeeId: true,
    },
  });

  if (!appUser) {
    throw new Error("Forbidden: No linked application account.");
  }

  // Verify the application role
  if (!allowedRoles.includes(appUser.role as AppRole)) {
    throw new Error("Forbidden: You do not have permission.");
  }

  return appUser;
}
