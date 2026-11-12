
import { useState } from "react";
import {
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";

import { getCurrentAppUser } from "@/lib/auth.functions";
import { getEmployees } from "@/server/employee.functions";

import {
  getTasks,
  addTask,
  editTask,
  removeTask,
} from "@/server/task.functions";

export const Route = createFileRoute("/tasks/")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw redirect({ to: "/login" });
    }

    if (appUser.role !== "ADMIN") {
      throw redirect({ to: "/dashboard" });
    }
  },

  loader: async () => {
    const [tasks, employees] = await Promise.all([
      getTasks(),
      getEmployees(),
    ]);

    return { tasks, employees };
  },

  component: TasksPage,
});

function TasksPage() {
  const { tasks, employees } = Route.useLoaderData();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!employeeId) {
      alert("Please select an employee.");
      return;
    }

    if (dueDate < startDate) {
      alert("Due date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);

      await addTask({
        data: {
          title,
          description,
          employeeId,
          priority: priority as "LOW" | "MEDIUM" | "HIGH",
          startDate,
          dueDate,
        },
      });

      alert("Task assigned successfully!");

      setTitle("");
      setDescription("");
      setEmployeeId("");
      setPriority("MEDIUM");
      setStartDate("");
      setDueDate("");

      await router.invalidate();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Unable to create task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await editTask({
        data: {
          id,
          status: status as "PENDING" | "IN_PROGRESS" | "COMPLETED",
        },
      });

      await router.invalidate();
    } catch (error) {
      console.error(error);
      alert("Unable to update task status.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await removeTask({ data: { id } });
      alert("Task deleted successfully!");
      await router.invalidate();
    } catch (error) {
      console.error(error);
      alert("Unable to delete task.");
    }
  }

  const activeEmployees = employees.filter(
    (employee) => (employee.status ?? "ACTIVE") === "ACTIVE"
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 p-4 md:p-6">

      {/* Heading */}
      <section>
        <p className="text-xs font-bold tracking-[0.2em] text-teal-600 dark:text-teal-300">
          WORKFORCE MANAGEMENT
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--sea-ink)]">
          Task Management
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Assign tasks to employees and monitor their progress.
        </p>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Tasks", value: tasks.length },
          {
            label: "Pending",
            value: tasks.filter((t) => t.status === "PENDING").length,
          },
          {
            label: "In Progress",
            value: tasks.filter((t) => t.status === "IN_PROGRESS").length,
          },
          {
            label: "Completed",
            value: tasks.filter((t) => t.status === "COMPLETED").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--sea-ink)]">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {/* Create Task Form */}
      <section className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm md:p-6">
        <h2 className="mb-5 text-lg font-semibold text-[var(--sea-ink)]">
          Assign New Task
        </h2>

        <form onSubmit={handleCreateTask} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Task Title *
              </label>
              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full rounded-xl border border-[var(--chip-line)] bg-transparent px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Assign Employee *
              </label>
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
              >
                <option value="">Select Employee</option>
                {activeEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeCode} - {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Start Date *
              </label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--chip-line)] bg-transparent px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Due Date *
              </label>
              <input
                required
                type="date"
                min={startDate || undefined}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--chip-line)] bg-transparent px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
                className="w-full rounded-xl border border-[var(--chip-line)] bg-transparent px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || activeEmployees.length === 0}
            className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Assigning..." : "+ Assign Task"}
          </button>

          {activeEmployees.length === 0 && (
            <p className="text-sm text-orange-500">
              No active employees available for task assignment.
            </p>
          )}
        </form>
      </section>

      {/* Task List */}
      <section className="overflow-hidden rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] shadow-sm">
        <div className="border-b border-[var(--chip-line)] p-5">
          <h2 className="font-semibold text-[var(--sea-ink)]">
            Assigned Tasks
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[var(--sea-ink)]">
              No tasks assigned yet
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Use the form above to assign your first task.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <tr>
                  <th className="px-5 py-4">Task</th>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--chip-line)]">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--sea-ink)]">
                        {task.title}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                        {task.description || "No description"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[var(--sea-ink)]">
                      {task.firstName
                        ? `${task.firstName} ${task.lastName ?? ""}`
                        : "Employee"}
                      {task.employeeCode && (
                        <p className="mt-1 text-xs text-gray-500">
                          {task.employeeCode}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-300">
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[var(--sea-ink)]">
                      {task.dueDate}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        className="rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2 py-2 text-xs text-[var(--sea-ink)]"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
