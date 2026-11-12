
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { employees, users } from "@/db/schema";

const registrationSchema = z.object({
  phone: z.string().max(20).optional(),
});

export const completeRegistration = createServerFn({
  method: "POST",
})
  .validator((data) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    });

    if (!session) {
      throw new Error("Please sign up or log in first.");
    }

    const email = session.user.email.trim().toLowerCase();
    const fullName = session.user.name.trim();
    const nameParts = fullName.split(/\s+/);

    const firstName = nameParts.shift();

    if (!firstName) {
      throw new Error("Your account must have a valid name.");
    }

    const lastName = nameParts.join(" ") || null;

    // Allow a retry if the account was already linked successfully.
    const existingAccount = await db.query.users.findFirst({
      where: eq(users.authUserId, session.user.id),
    });

    if (existingAccount) {
      return {
        success: true,
        employeeId: existingAccount.employeeId,
      };
    }

    // Do not automatically link a public registration to an
    // existing employee record.
    const existingEmployee = await db.query.employees.findFirst({
      where: eq(employees.email, email),
    });

    if (existingEmployee) {
      throw new Error(
        "This email already belongs to an employee. Please contact your administrator."
      );
    }

    const joiningDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const employeeCode = `EMP-${randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    const employeeId = await db.transaction(async (tx) => {
      const [employee] = await tx
        .insert(employees)
        .values({
          employeeCode,
          firstName,
          lastName,
          email,
          phone: data.phone || null,
          joiningDate,
          status: "ACTIVE",
        })
        .returning({ id: employees.id });

      await tx.insert(users).values({
        email,
        passwordHash: "BETTER_AUTH_MANAGED",
        role: "EMPLOYEE",
        employeeId: employee.id,
        authUserId: session.user.id,
      });

      return employee.id;
    });

    return {
      success: true,
      employeeId,
    };
  });
