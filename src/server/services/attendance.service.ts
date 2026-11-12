
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { attendance , employees } from "@/db/schema";

// GET: Retrieve all attendance records (ADMIN)
export async function getAllAttendance() {
  return await db.select().from(attendance);
}

// GET: Retrieve attendance records for one employee
export async function getAttendanceByEmployeeId(employeeId: string) {
  return await db
    .select()
    .from(attendance)
    .where(eq(attendance.employeeId, employeeId));
}

// GET: Retrieve attendance by ID (ADMIN)
export async function getAttendanceById(id: string) {
  const result = await db
    .select()
    .from(attendance)
    .where(eq(attendance.id, id));

  return result[0] ?? null;
}

// GET: Retrieve attendance by ID belonging to one employee
export async function getAttendanceByIdForEmployee(
  id: string,
  employeeId: string
) {
  const result = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.id, id),
        eq(attendance.employeeId, employeeId)
      )
    );

  return result[0] ?? null;
}

// CREATE: Add attendance record
export async function createAttendance(data: {
  employeeId: string;
  attendanceDate: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
}) {
  return await db
    .insert(attendance)
    .values(data)
    .returning();
}

// UPDATE: Update attendance record
export async function updateAttendance(
  id: string,
  data: {
    employeeId: string;
    attendanceDate: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
  }
) {
  return await db
    .update(attendance)
    .set(data)
    .where(eq(attendance.id, id))
    .returning();
}

// DELETE: Delete attendance record
export async function deleteAttendance(id: string) {
  return await db
    .delete(attendance)
    .where(eq(attendance.id, id))
    .returning();
}


export async function getAttendanceByEmployeeAndDate(
  employeeId: string,
  attendanceDate: string
) {
  const result = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.employeeId, employeeId),
        eq(attendance.attendanceDate, attendanceDate)
      )
    );

  return result[0] ?? null;
}

export async function updateAttendanceCheckOut(
  id: string,
  checkOut: string
) {
  return await db
    .update(attendance)
    .set({ checkOut })
    .where(eq(attendance.id, id))
    .returning();
}


export async function getAttendanceWithEmployees() {
  return await db
    .select({
      id: attendance.id,
      employeeId: attendance.employeeId,
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
      attendanceDate: attendance.attendanceDate,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
    })
    .from(attendance)
    .leftJoin(
      employees,
      eq(attendance.employeeId, employees.id)
    );
}
