
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRole } from "@/lib/authorization.server";

import {
  getAttendanceByEmployeeId,
} from "./services/attendance.service";

import {
  getLeaveRequestsByEmployeeId,
  getAllLeaveTypes,
} from "./services/leave.service";

import {
  getAllEmployees,
  createEmployee,
  getEmployeeById as fetchEmployeeById,
  updateEmployee as saveEmployee,
  deactivateEmployee as deactivateEmployeeRecord,
} from "./services/employee.service";

// GET: Retrieve employee by ID
export const getEmployee = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await fetchEmployeeById(data.id);
  });

// GET: Retrieve all employees
export const getEmployees = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireRole(["ADMIN"]);

  return await getAllEmployees();
});
const employeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),

  phone: z.string().optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),

  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),

  joiningDate: z.string().date("Enter a valid joining date"),

  salary: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid salary")
    .optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// GET: Retrieve attendance and leave history for one employee (ADMIN only)
export const getEmployeeHistory = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const employee = await fetchEmployeeById(data.id);

    if (!employee) {
      return null;
    }

    const [
      attendanceRecords,
      leaveRequests,
      leaveTypes,
    ] = await Promise.all([
      getAttendanceByEmployeeId(data.id),
      getLeaveRequestsByEmployeeId(data.id),
      getAllLeaveTypes(),
    ]);

    const leaveTypeMap = new Map(
      leaveTypes.map((type) => [type.id, type.name])
    );

    return {
      attendance: attendanceRecords,

      leaves: leaveRequests.map((leave) => ({
        ...leave,
        leaveTypeName:
          leaveTypeMap.get(leave.leaveTypeId) ?? "Unknown",
      })),
    };
  });

// POST: Create employee
export const addEmployee = createServerFn({
  method: "POST",
})
  .validator((data) => employeeSchema.parse(data))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await createEmployee(data);
  });

// POST: Update employee
export const editEmployee = createServerFn({
  method: "POST",
})
  .validator((data) =>
    employeeSchema.extend({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const { id, ...employeeData } = data;

    return await saveEmployee(id, employeeData);
  });

// POST: Deactivate employee
export const deactivateEmployee = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await deactivateEmployeeRecord(data.id);
  });
