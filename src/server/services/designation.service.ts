
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { designations, employees } from "@/db/schema";

// GET: Retrieve all designations
export async function getAllDesignations() {
  return await db.select().from(designations);
}

// GET: Retrieve designations by department
export async function getDesignationsByDepartment(departmentId: string) {
  return await db
    .select()
    .from(designations)
    .where(eq(designations.departmentId, departmentId));
}

// GET: Retrieve designation by ID
export async function getDesignationById(id: string) {
  const result = await db
    .select()
    .from(designations)
    .where(eq(designations.id, id));

  return result[0] ?? null;
}

// CREATE: Add a new designation
export async function createDesignation(data: {
  title: string;
  departmentId: string;
}) {
  return await db
    .insert(designations)
    .values(data)
    .returning();
}

// UPDATE: Update designation
export async function updateDesignation(
  id: string,
  data: {
    title: string;
    departmentId: string;
  }
) {
  return await db
    .update(designations)
    .set(data)
    .where(eq(designations.id, id))
    .returning();
}

// DELETE: Delete designation
export async function deleteDesignation(id: string) {
  const linkedEmployees = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.designationId, id))
    .limit(1);

  if (linkedEmployees.length > 0) {
    throw new Error(
      "Cannot delete this designation because employees are associated with it."
    );
  }

  return await db
    .delete(designations)
    .where(eq(designations.id, id))
    .returning();
}
