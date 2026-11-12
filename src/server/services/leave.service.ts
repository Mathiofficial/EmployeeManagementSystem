import { eq , and} from "drizzle-orm";
import { db } from "@/db";

import { leaveRequests, leaveTypes } from "@/db/schema";

// =====================================
// LEAVE REQUEST OPERATIONS
// =====================================

// GET: Retrieve all leave requests
export async function getAllLeaveRequests() {
  return await db.select().from(leaveRequests);
}

export async function getLeaveRequestsByEmployeeId(employeeId: string) {
  return await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.employeeId, employeeId));
}

export async function getLeaveRequestByIdForEmployee(
  id: string,
  employeeId: string
) {
  const result = await db
    .select()
    .from(leaveRequests)
    .where(
      and(
        eq(leaveRequests.id, id),
        eq(leaveRequests.employeeId, employeeId)
      )
    );

  return result[0] ?? null;
}

// GET: Retrieve leave request by ID
export async function getLeaveRequestById(id: string) {
  const result = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.id, id));

  return result[0] ?? null;
}

// CREATE: Submit a leave request
export async function createLeaveRequest(data: {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  return await db
    .insert(leaveRequests)
    .values(data)
    .returning();
}

// UPDATE: Update a leave request
export async function updateLeaveRequest(
  id: string,
  data: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status?: string;
    approvedBy?: string;
  }
) {
  return await db
    .update(leaveRequests)
    .set(data)
    .where(eq(leaveRequests.id, id))
    .returning();
}

// DELETE: Delete a leave request
export async function deleteLeaveRequest(id: string) {
  return await db
    .delete(leaveRequests)
    .where(eq(leaveRequests.id, id))
    .returning();
}

// =====================================
// LEAVE TYPE OPERATIONS
// =====================================

// GET: Retrieve all leave types
export async function getAllLeaveTypes() {
  return await db.select().from(leaveTypes);
}

// GET: Retrieve leave type by ID
export async function getLeaveTypeById(id: string) {
  const result = await db
    .select()
    .from(leaveTypes)
    .where(eq(leaveTypes.id, id));

  return result[0] ?? null;
}

// CREATE: Add a leave type
export async function createLeaveType(data: {
  name: string;
  description?: string;
}) {
  return await db
    .insert(leaveTypes)
    .values(data)
    .returning();
}

// UPDATE: Update a leave type
export async function updateLeaveType(
  id: string,
  data: {
    name: string;
    description?: string;
  }
) {
  return await db
    .update(leaveTypes)
    .set(data)
    .where(eq(leaveTypes.id, id))
    .returning();
}

// DELETE: Delete a leave type
export async function deleteLeaveType(id: string) {
  return await db
    .delete(leaveTypes)
    .where(eq(leaveTypes.id, id))
    .returning();
}
