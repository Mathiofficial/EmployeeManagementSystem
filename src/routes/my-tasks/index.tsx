import {useRouter , createFileRoute, redirect } from "@tanstack/react-router";

import { getCurrentAppUser } from "@/lib/auth.functions";
import { getTasks,updateMyTaskStatus } from "@/server/task.functions";

export const Route = createFileRoute("/my-tasks/")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw redirect({ to: "/login" });
    }

    if (appUser.role !== "EMPLOYEE") {
      throw redirect({ to: "/dashboard" });
    }
  },

  loader: () => getTasks(),

  component: MyTasksPage,
});

function MyTasksPage() {
  const tasks = Route.useLoaderData();
  const router = useRouter();

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateMyTaskStatus({
        data: {
          id,
          status: status as "IN_PROGRESS" | "COMPLETED",
        },
      });

      await router.invalidate();
    } catch (error) {
      console.error(error);
      alert("Unable to update task status.");
    }
  }

  const pending = tasks.filter((task) => task.status === "PENDING").length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 p-4 md:p-6">
      <section>
        <p className="text-xs font-bold tracking-[0.2em] text-teal-600 dark:text-teal-300">
          EMPLOYEE WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--sea-ink)]">
          My Tasks
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          View your assigned tasks and update your work progress.
        </p>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Pending", value: pending },
          { label: "In Progress", value: inProgress },
          { label: "Completed", value: completed },
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

      {/* Task Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
          Assigned to Me
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-12 text-center">
            <p className="font-semibold text-[var(--sea-ink)]">
              No tasks assigned yet
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your assigned tasks will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[var(--sea-ink)]">
                    {task.title}
                  </h3>

                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-300">
                    {task.priority}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {task.description || "No description provided."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Start Date
                    </p>
                    <p className="mt-1 font-medium text-[var(--sea-ink)]">
                      {task.startDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Due Date
                    </p>
                    <p className="mt-1 font-medium text-[var(--sea-ink)]">
                      {task.dueDate}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-[var(--chip-line)] pt-4">
                  <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                    Update Status
                  </label>

                  <select
                    value={task.status}
                    disabled={task.status === "COMPLETED"}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    className="w-full rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500 disabled:opacity-60"
                  >
                    <option value="PENDING" disabled>
                      Pending
                    </option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
