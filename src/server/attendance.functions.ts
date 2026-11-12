
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRole } from "@/lib/authorization.server";

import {
  getAllAttendance,
  getAttendanceByEmployeeId,
  getAttendanceWithEmployees,
  getAttendanceById as fetchAttendanceById,
  getAttendanceByIdForEmployee,
  getAttendanceByEmployeeAndDate,
  createAttendance as addAttendance,
  updateAttendance as saveAttendance,
  updateAttendanceCheckOut,
  deleteAttendance as removeAttendance,
  
} from "./services/attendance.service";

// Validation schema
const attendanceSchema = z.object({
  employeeId: z.string().uuid(),
  attendanceDate: z.string().date(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.enum([
    "PRESENT",
    "ABSENT",
    "HALF_DAY",
    "LEAVE",
  ]),
});

// GET: Retrieve attendance records
export const getAttendanceRecords = createServerFn({
  method: "GET",
}).handler(async () => {
  const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

  if (appUser.role === "ADMIN") {
    return await getAllAttendance();
  }

  if (!appUser.employeeId) {
    throw new Error("Your account is not linked to an employee record.");
  }

  return await getAttendanceByEmployeeId(appUser.employeeId);
});

// GET: Retrieve attendance by ID
export const getAttendance = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

    if (appUser.role === "ADMIN") {
      return await fetchAttendanceById(data.id);
    }

    if (!appUser.employeeId) {
      throw new Error("Your account is not linked to an employee record.");
    }

    return await getAttendanceByIdForEmployee(
      data.id,
      appUser.employeeId
    );
  });

// POST: Create attendance (ADMIN only)
export const createAttendance = createServerFn({
  method: "POST",
})
  .validator((data) => attendanceSchema.parse(data))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await addAttendance(data);
  });

export const markMyAttendance = createServerFn({
  method: "POST",
}).handler(async () => {
  const appUser = await requireRole(["EMPLOYEE"]);

  if (!appUser.employeeId) {
    throw new Error("Your account is not linked to an employee record.");
  }

  const now = new Date();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const existing = await getAttendanceByEmployeeAndDate(
    appUser.employeeId,
    today
  );

  if (existing) {
    throw new Error("You have already checked in today.");
  }

  return await addAttendance({
    employeeId: appUser.employeeId,
    attendanceDate: today,
    checkIn: now.toISOString(),
    status: "PRESENT",
  });
});

export const checkOutMyAttendance = createServerFn({
  method: "POST",
}).handler(async () => {
  const appUser = await requireRole(["EMPLOYEE"]);

  if (!appUser.employeeId) {
    throw new Error("Your account is not linked to an employee record.");
  }

  const now = new Date();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const existing = await getAttendanceByEmployeeAndDate(
    appUser.employeeId,
    today
  );

  if (!existing) {
    throw new Error("Please check in before checking out.");
  }

  if (existing.checkOut) {
    throw new Error("You have already checked out today.");
  }

  return await updateAttendanceCheckOut(
    existing.id,
    now.toISOString()
  );
});

// POST: Update attendance (ADMIN only)
export const updateAttendance = createServerFn({
  method: "POST",
})
  .validator((data) =>
    attendanceSchema.extend({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const { id, ...attendanceData } = data;

    return await saveAttendance(id, attendanceData);
  });

// POST: Delete attendance (ADMIN only)
export const deleteAttendance = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await removeAttendance(data.id);
  });

  
export const getAdminAttendanceReport = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      attendanceDate: z.string().date().optional(),
      employeeId: z.string().uuid().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    let records = await getAttendanceWithEmployees();

    if (data.attendanceDate) {
      records = records.filter(
        (record) => record.attendanceDate === data.attendanceDate
      );
    }

    if (data.employeeId) {
      records = records.filter(
        (record) => record.employeeId === data.employeeId
      );
    }

    return records;
  });
