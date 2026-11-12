
import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { employees, departments, designations } from "@/db/schema";
import { requireRole } from "@/lib/authorization.server";

export const getMyProfile = createServerFn({
  method: "GET",
}).handler(async () => {
  const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

  if (!appUser.employeeId) {
    return {
      account: {
        email: appUser.email,
        role: appUser.role,
      },
      employee: null,
    };
  }

  const result = await db
    .select({
      employee: employees,
      departmentName: departments.name,
      designationTitle: designations.title,
    })
    .from(employees)
    .leftJoin(
      departments,
      eq(employees.departmentId, departments.id)
    )
    .leftJoin(
      designations,
      eq(employees.designationId, designations.id)
    )
    .where(eq(employees.id, appUser.employeeId))
    .limit(1);

  const employeeData = result[0];

  return {
    account: {
      email: appUser.email,
      role: appUser.role,
    },
    employee: employeeData
      ? {
          ...employeeData.employee,
          departmentName: employeeData.departmentName,
          designationTitle: employeeData.designationTitle,
        }
      : null,
  };
});

const updateMyProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().max(20).optional(),
  address: z.string().max(1000).optional(),
});

export const updateMyProfile = createServerFn({
  method: "POST",
})
  .validator((data) => updateMyProfileSchema.parse(data))
  .handler(async ({ data }) => {
    const appUser = await requireRole(["EMPLOYEE"]);

    if (!appUser.employeeId) {
      throw new Error("No employee record is linked to your account.");
    }

    await db
      .update(employees)
      .set({
        firstName: data.firstName,
        lastName: data.lastName || null,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        address: data.address || null,
      })
      .where(eq(employees.id, appUser.employeeId));

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  });
