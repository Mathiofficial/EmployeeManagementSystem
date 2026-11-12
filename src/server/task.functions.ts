import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRole } from "@/lib/authorization.server";

import {
  getAllTasks,
  getTasksByEmployeeId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "./services/task.service";

// Task validation schema
const taskSchema = z.object({
  employeeId: z.string().uuid(),
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  startDate: z.string().date("Enter a valid start date"),
  dueDate: z.string().date("Enter a valid due date"),
});

// GET: Retrieve tasks based on logged-in user's role
export const getTasks = createServerFn({
  method: "GET",
}).handler(async () => {
  const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

  if (appUser.role === "ADMIN") {
    return await getAllTasks();
  }

  if (!appUser.employeeId) {
    throw new Error("No employee account is linked to this user.");
  }

  return await getTasksByEmployeeId(appUser.employeeId);
});

// GET: Retrieve one task
export const getTask = createServerFn({
  method: "GET",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const appUser = await requireRole(["ADMIN", "EMPLOYEE"]);

    const task = await getTaskById(data.id);

    if (!task) {
      return null;
    }

    // Employees can only view their own tasks
    if (
      appUser.role === "EMPLOYEE" &&
      task.employeeId !== appUser.employeeId
    ) {
      return null;
    }

    return task;
  });

// POST: Admin creates a task
export const addTask = createServerFn({
  method: "POST",
})
  .validator((data) => taskSchema.parse(data))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await createTask(data);
  });

// POST: Admin updates task details
export const editTask = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
      employeeId: z.string().uuid().optional(),
      title: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      status: z.enum([
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
      ]).optional(),
      startDate: z.string().date().optional(),
      dueDate: z.string().date().optional(),
    })
    .refine(
      (data) => Object.keys(data).some((key) => key !== "id"),
      "At least one task field must be provided."
    )
    .parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    const { id, ...taskData } = data;

    return await updateTask(id, taskData);
  });

// POST: Admin deletes a task
export const removeTask = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireRole(["ADMIN"]);

    return await deleteTask(data.id);
  });

// POST: Employee updates their own task status
export const updateMyTaskStatus = createServerFn({
  method: "POST",
})
  .validator((data) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["IN_PROGRESS", "COMPLETED"]),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const appUser = await requireRole(["EMPLOYEE"]);

    if (!appUser.employeeId) {
      throw new Error("No employee account is linked to this user.");
    }

    const task = await getTaskById(data.id);

    if (!task) {
      throw new Error("Task not found.");
    }

    // Verify task ownership
    if (task.employeeId !== appUser.employeeId) {
      throw new Error("You cannot update another employee's task.");
    }

    return await updateTask(data.id, {
      status: data.status,
    });
  });