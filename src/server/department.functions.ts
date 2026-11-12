
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRole } from "@/lib/authorization.server";

import {
  getAllDepartments,
  getDepartmentById as fetchDepartmentById,
  createDepartment as addDepartment,
  updateDepartment as saveDepartment,
  deleteDepartment as removeDepartment,
} from "./services/department.service";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});

// GET: Retrieve all departments
export const getDepartments = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireRole(["ADMIN", "EMPLOYEE"]);

  return await getAllDepartments();
});

// GET: Retrieve department by ID
export const getDepartment = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN", "EMPLOYEE"]);

    return await fetchDepartmentById(data.id);
  });

// POST: Create department (ADMIN only)
export const createDepartment = createServerFn({
  method: "POST",
})
  .validator((data) => departmentSchema.parse(data))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await addDepartment(data);
  });

// POST: Update department (ADMIN only)
export const updateDepartment = createServerFn({
  method: "POST",
})
  .validator((data) =>
    departmentSchema.extend({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const { id, ...departmentData } = data;
    return await saveDepartment(id, departmentData);
  });

// POST: Delete department (ADMIN only)
export const deleteDepartment = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await removeDepartment(data.id);
  });
