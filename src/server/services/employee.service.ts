
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { employees, departments, designations } from "@/db/schema";

async function validateDepartmentAndDesignation(
  departmentId?: string | null,
  designationId?: string | null
) {
  if (designationId && !departmentId) {
    throw new Error("Please select a department for this designation.");
  }

  if (departmentId) {
    const department = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (department.length === 0) {
      throw new Error("Selected department does not exist.");
    }
  }

  if (designationId) {
    const designation = await db
      .select({
        id: designations.id,
        departmentId: designations.departmentId,
      })
      .from(designations)
      .where(eq(designations.id, designationId))
      .limit(1);

    if (designation.length === 0) {
      throw new Error("Selected designation does not exist.");
    }

    if (designation[0].departmentId !== departmentId) {
      throw new Error(
        "Selected designation does not belong to the selected department."
      );
    }
  }
}

export async function getAllEmployees() {
  return await db
    .select({
      ...getTableColumns(employees),
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
    );
}

export async function createEmployee(
  data: typeof employees.$inferInsert & {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    joiningDate: string;
    salary?: string;
  }
) {
  await validateDepartmentAndDesignation(
    data.departmentId,
    data.designationId
  );

  return await db
    .insert(employees)
    .values(data)
    .returning();
}

export async function getEmployeeById(
  id: string
): Promise<typeof employees.$inferSelect | null> {
  const result = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  return result[0] ?? null;
}

export async function updateEmployee(
  id: string,
  data: typeof employees.$inferInsert & {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    joiningDate: string;
    salary?: string;
  }
) {
  await validateDepartmentAndDesignation(
    data.departmentId,
    data.designationId
  );

  return await db
    .update(employees)
    .set(data)
    .where(eq(employees.id, id))
    .returning();
}

export async function deactivateEmployee(id: string) {
  return await db
    .update(employees)
    .set({
      status: "INACTIVE",
    })
    .where(eq(employees.id, id))
    .returning();
}
