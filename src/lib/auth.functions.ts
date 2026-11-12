
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export const getCurrentAppUser = createServerFn({
  method: "GET",
}).handler(async () => {
  // Get the logged-in Better Auth session
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });

  if (!session) {
    return null;
  }

  // Find the corresponding application user
  const appUser = await db.query.users.findFirst({
    where: eq(users.authUserId, session.user.id),
    columns: {
      id: true,
      email: true,
      role: true,
      employeeId: true,
    },
  });

  return appUser
  ? {
      ...appUser,
      name: session.user.name,
    }
  : null;
});
