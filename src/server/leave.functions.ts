
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRole } from "@/lib/authorization.server";

import {
  getAllLeaveRequests,
  getLeaveRequestsByEmployeeId,
  getLeaveRequestById as fetchLeaveRequestById,
  getLeaveRequestByIdForEmployee,
  createLeaveRequest as addLeaveRequest,
  updateLeaveRequest as saveLeaveRequest,
  deleteLeaveRequest as removeLeaveRequest,

  getAllLeaveTypes,
  getLeaveTypeById as fetchLeaveTypeById,
  createLeaveType as addLeaveType,
  updateLeaveType as saveLeaveType,
  deleteLeaveType as removeLeaveType,
} from "./services/leave.service";

// =====================================
// VALIDATION SCHEMAS
// =====================================

const leaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date cannot be earlier than start date",
    path: ["endDate"],
  }
);

const updateLeaveRequestSchema = leaveRequestSchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  approvedBy: z.string().uuid().optional(),
});

const leaveTypeSchema = z.object({
  name: z.string().min(1, "Leave type name is required"),
  description: z.string().optional(),
});

// =====================================
// LEAVE REQUEST SERVER FUNCTIONS
// =====================================

// GET: ADMIN sees all; EMPLOYEE sees only their requests
export const getLeaveRequests = createServerFn({
  method: "GET",
}).handler(async () => {
  const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

  if (appUser.role === "ADMIN") {
    return await getAllLeaveRequests();
  }

  if (!appUser.employeeId) {
    throw new Error("Your account is not linked to an employee record.");
  }

  return await getLeaveRequestsByEmployeeId(appUser.employeeId);
});

// GET: Retrieve one leave request
export const getLeaveRequest = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({ id: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

    if (appUser.role === "ADMIN") {
      return await fetchLeaveRequestById(data.id);
    }

    if (!appUser.employeeId) {
      throw new Error("Your account is not linked to an employee record.");
    }

    return await getLeaveRequestByIdForEmployee(
      data.id,
      appUser.employeeId
    );
  });

// POST: Employee submits their own leave request
export const createLeaveRequest = createServerFn({
  method: "POST",
})
  .validator((data) => leaveRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const appUser = await requireRole(["EMPLOYEE"]);

    if (!appUser.employeeId) {
      throw new Error("Your account is not linked to an employee record.");
    }

    return await addLeaveRequest({
      ...data,
      employeeId: appUser.employeeId,
    });
  });

// POST: ADMIN updates or approves/rejects a leave request
export const updateLeaveRequest = createServerFn({
  method: "POST",
})
  .validator((data) =>
    updateLeaveRequestSchema.extend({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const appUser = await requireRole(["ADMIN"]);

    const { id, ...leaveData } = data;

    return await saveLeaveRequest(id, {
      ...leaveData,
      employeeId: leaveData.employeeId,
      approvedBy: leaveData.status
        ? appUser.id
        : leaveData.approvedBy,
    });
  });

// POST: ADMIN deletes a leave request
export const deleteLeaveRequest = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({ id: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);
    return await removeLeaveRequest(data.id);
  });

// =====================================
// LEAVE TYPE SERVER FUNCTIONS
// =====================================

// GET: Retrieve all leave types
export const getLeaveTypes = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireRole(["ADMIN", "EMPLOYEE"]);
  return await getAllLeaveTypes();
});

// GET: Retrieve leave type by ID
export const getLeaveType = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({ id: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN", "EMPLOYEE"]);
    return await fetchLeaveTypeById(data.id);
  });

// POST: ADMIN creates a leave type
export const createLeaveType = createServerFn({
  method: "POST",
})
  .validator((data) => leaveTypeSchema.parse(data))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);
    return await addLeaveType(data);
  });

// POST: ADMIN updates a leave type
export const updateLeaveType = createServerFn({
  method: "POST",
})
  .validator((data) =>
    leaveTypeSchema.extend({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const { id, ...leaveTypeData } = data;
    return await saveLeaveType(id, leaveTypeData);
  });

// POST: ADMIN deletes a leave type
export const deleteLeaveType = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({ id: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);
    return await removeLeaveType(data.id);
  });
