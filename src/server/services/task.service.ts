
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { tasks, employees } from "@/db/schema";

type CreateTaskData = Pick<
  typeof tasks.$inferInsert,
  "employeeId" | "title" | "description" | "priority" | "startDate" | "dueDate"
>;

async function validateTaskData(
  employeeId: string,
  startDate: string,
  dueDate: string
) {
  const employee = await db
    .select({
      id: employees.id,
      status: employees.status,
    })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  if (employee.length === 0) {
    throw new Error("Selected employee does not exist.");
  }

  if (employee[0].status !== "ACTIVE") {
    throw new Error("Cannot assign a task to an inactive employee.");
  }

  if (dueDate < startDate) {
    throw new Error("Due date cannot be earlier than start date.");
  }
}

// Get all tasks with employee details (Admin)
export async function getAllTasks() {
  return await db
    .select({
      ...getTableColumns(tasks),
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
    })
    .from(tasks)
    .leftJoin(
      employees,
      eq(tasks.employeeId, employees.id)
    );
}
export async function getTasksByEmployeeId(employeeId: string) {
  return await db
    .select({
      ...getTableColumns(tasks),
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
    })
    .from(tasks)
    .leftJoin(employees, eq(tasks.employeeId, employees.id))
    .where(eq(tasks.employeeId, employeeId));
}

// Get a task by ID
export async function getTaskById(id: string) {
  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  return result[0] ?? null;
}

// Create a new task
export async function createTask(data: CreateTaskData) {
  await validateTaskData(
    data.employeeId,
    data.startDate,
    data.dueDate
  );

  return await db
    .insert(tasks)
    .values(data)
    .returning();
}

// Update an existing task
export async function updateTask(
  id: string,
  data: Partial<CreateTaskData> & {
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  }
) {
  const existingTask = await getTaskById(id);

  if (!existingTask) {
    throw new Error("Task not found.");
  }

  const employeeId = data.employeeId ?? existingTask.employeeId;
  const startDate = data.startDate ?? existingTask.startDate;
  const dueDate = data.dueDate ?? existingTask.dueDate;

  await validateTaskData(employeeId, startDate, dueDate);

  return await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, id))
    .returning();
}

// Delete a task
export async function deleteTask(id: string) {
  return await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();
}
