
import { createServerFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { employees, departments, leaveRequests } from "@/db/schema";
import { requireRole } from "@/lib/authorization.server";

export const getDashboardStats = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireRole(["ADMIN"]);

  const [
    totalEmployees,
    activeEmployees,
    totalDepartments,
    pendingLeaves,
  ] = await Promise.all([
    db.select({ value: count() }).from(employees),

    db.select({ value: count() })
      .from(employees)
      .where(eq(employees.status, "ACTIVE")),

    db.select({ value: count() }).from(departments),

    db.select({ value: count() })
      .from(leaveRequests)
      .where(eq(leaveRequests.status, "PENDING")),
  ]);

  return {
    totalEmployees: totalEmployees[0].value,
    activeEmployees: activeEmployees[0].value,
    totalDepartments: totalDepartments[0].value,
    pendingLeaves: pendingLeaves[0].value,
  };
});
