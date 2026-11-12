
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { departments, designations, employees } from "@/db/schema";

// GET: Retrieve all departments
export async function getAllDepartments() {
  return await db.select().from(departments);
}

// GET: Retrieve department by ID
export async function getDepartmentById(id: string) {
  const result = await db
    .select()
    .from(departments)
    .where(eq(departments.id, id));

  return result[0] ?? null;
}

// CREATE: Add a new department
export async function createDepartment(data: {
  name: string;
  description?: string;
}) {
  return await db
    .insert(departments)
    .values(data)
    .returning();
}

// UPDATE: Update department details
export async function updateDepartment(
  id: string,
  data: {
    name: string;
    description?: string;
  }
) {
  return await db
    .update(departments)
    .set(data)
    .where(eq(departments.id, id))
    .returning();
}

// DELETE: Delete department
export async function deleteDepartment(id: string) {
  // Check whether employees are associated with this department
  const linkedEmployees = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.departmentId, id))
    .limit(1);

  if (linkedEmployees.length > 0) {
    throw new Error(
      "Cannot delete this department because employees are associated with it."
    );
  }

  // Check whether designations are associated with this department
  const linkedDesignations = await db
    .select({ id: designations.id })
    .from(designations)
    .where(eq(designations.departmentId, id))
    .limit(1);

  if (linkedDesignations.length > 0) {
    throw new Error(
      "Cannot delete this department because designations are associated with it. Delete or reassign the designations first."
    );
  }

  return await db
    .delete(departments)
    .where(eq(departments.id, id))
    .returning();
}
