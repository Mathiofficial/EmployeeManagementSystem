import { user as authUser } from "@/db/auth-schema";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/authorization.server";
import { db } from "@/db";
import { employees, users } from "@/db/schema";

const createEmployeeAccountSchema = z.object({
  employeeId: z.string().uuid(),
  password: z.string().min(8).max(128),
});

export const createEmployeeAccount = createServerFn({
  method: "POST",
})
  .validator((data) => createEmployeeAccountSchema.parse(data))
  .handler(async ({ data }) => {
    // Only ADMIN can create employee login accounts
    await requireRole(["ADMIN"]);

    // Find the employee
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, data.employeeId),
    });

    if (!employee) {
      throw new Error("Employee not found.");
    }

    if (employee.status !== "ACTIVE") {
      throw new Error("Only active employees can receive login accounts.");
    }

    const email = employee.email.trim().toLowerCase();

    // Check for an existing application account
    const existingAccount = await db.query.users.findFirst({
      where: or(
        eq(users.employeeId, employee.id),
        eq(users.email, email),
      ),
    });

    if (existingAccount) {
      throw new Error("This employee already has a login account.");
    }

    // Create the Better Auth account
    const result = await auth.api.createUser({
      headers: getRequestHeaders(),
      body: {
        email,
        password: data.password,
        name: `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
        role: "user",
      },
    });

    try {
      // Link the Better Auth account to the employee
      await db.insert(users).values({
        email,
        passwordHash: "BETTER_AUTH_MANAGED",
        role: "EMPLOYEE",
        employeeId: employee.id,
        authUserId: result.user.id,
      });
    } catch (error) {
      // Remove the Better Auth user if application account linking fails
      await db
        .delete(authUser)
        .where(eq(authUser.id, result.user.id));

      throw error;
    }
    

    return {
      success: true,
      message: "Employee login account created successfully.",
      email,
    };
  });
  
export const getEmployeeAccountStatus = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      employeeId: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const account = await db.query.users.findFirst({
      where: eq(users.employeeId, data.employeeId),
      columns: {
        id: true,
      },
    });

    return {
      hasAccount: Boolean(account),
    };
  });

export const resetEmployeePassword = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      employeeId: z.string().uuid(),
      newPassword: z.string().min(8).max(128),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const account = await db.query.users.findFirst({
      where: eq(users.employeeId, data.employeeId),
    });

    if (!account || !account.authUserId) {
      throw new Error("Employee login account not found.");
    }

    await auth.api.setUserPassword({
      headers: getRequestHeaders(),
      body: {
        userId: account.authUserId,
        newPassword: data.newPassword,
      },
    });

    return {
      success: true,
      message: "Employee password updated successfully.",
    };
  });
