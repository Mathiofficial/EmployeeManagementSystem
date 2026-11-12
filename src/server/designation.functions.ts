
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRole } from "@/lib/authorization.server";

import {
  getAllDesignations,
  getDesignationById,
  getDesignationsByDepartment,
  createDesignation as addDesignation,
  updateDesignation as saveDesignation,
  deleteDesignation as removeDesignation,
} from "./services/designation.service";

const designationSchema = z.object({
  title: z.string().min(1, "Designation title is required"),
  departmentId: z.string().uuid("Please select a valid department"),
});

// GET: Retrieve all designations
export const getDesignations = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireRole(["ADMIN", "EMPLOYEE"]);
  return await getAllDesignations();
});

// GET: Retrieve designations by department
export const getDesignationsByDepartmentFn = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      departmentId: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN", "EMPLOYEE"]);
    return await getDesignationsByDepartment(data.departmentId);
  });

// GET: Retrieve designation by ID
export const getDesignation = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN", "EMPLOYEE"]);
    return await getDesignationById(data.id);
  });

// POST: Create designation
export const createDesignation = createServerFn({
  method: "POST",
})
  .validator((data) => designationSchema.parse(data))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);
    return await addDesignation(data);
  });

// POST: Update designation
export const updateDesignation = createServerFn({
  method: "POST",
})
  .validator((data) =>
    designationSchema.extend({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const { id, ...designationData } = data;
    return await saveDesignation(id, designationData);
  });

// POST: Delete designation
export const deleteDesignation = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);
    return await removeDesignation(data.id);
  });
