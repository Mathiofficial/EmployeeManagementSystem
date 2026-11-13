
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getCurrentAppUser } from "@/lib/auth.functions";
import { getDashboardStats } from "@/server/dashboard.functions";
import StatsCard from "@/components/dashboard/StatsCard";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw redirect({ to: "/login" });
    }

    return { appUser };
  },

  loader: async ({ context }) => {
    if (context.appUser.role === "ADMIN") {
      return await getDashboardStats();
    }

    return null;
  },

  component: Dashboard,
});

function Dashboard() {
  const { appUser } = Route.useRouteContext();
  const stats = Route.useLoaderData();

  const adminLinks = [
    {
      title: "Employees",
      description: "Add, edit and manage employee records.",
      path: "/employees",
    },
    {
      title: "Departments",
      description: "Manage company departments.",
      path: "/departments",
    },
    {
      title: "Attendance",
      description: "View and manage attendance records.",
      path: "/attendance",
    },
    {
      title: "Tasks",
      description: "Assign tasks and track employee progress.",
      path: "/tasks",
    },
    {
      title: "Leave Management",
      description: "View and manage employee leave requests.",
      path: "/leaves",
    },
    {
      title: "Designations",
      description: "Manage employee job titles and department assignments.",
      path: "/designations",
  },
    {
      title: "Settings",
      description: "Manage application settings.",
      path: "/settings",
    },
  ] as const;

  const employeeLinks = [
    {
      title: "My Attendance",
      description: "View your attendance records.",
      path: "/attendance",
    },
    {
      title: "My Tasks",
      description: "View assigned tasks and update your progress.",
      path: "/my-tasks",
    },
    {
      title: "My Leaves",
      description: "Apply for leave and view your requests.",
      path: "/leaves",
    },
    {
      title: "My Profile",
      description: "View your employee profile.",
      path: "/profile",
    },
  ] as const;

  const links =
    appUser.role === "ADMIN" ? adminLinks : employeeLinks;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6">

      {/* Welcome Section */}
      <section className="dashboard-welcome relative overflow-hidden rounded-3xl border p-6 shadow-sm md:p-9">
        <div className="dashboard-welcome-glow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative z-10">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-white/80">
            EMPLOYEE MANAGEMENT SYSTEM
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Welcome back, {appUser.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
            {appUser.role === "ADMIN"
              ? "Manage your workforce, monitor operations and keep everything running smoothly."
              : "Your workspace for attendance, leave requests and employee information."}
          </p>

          <div className="dashboard-welcome-badge mt-5 inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold text-white">
            {appUser.role === "ADMIN" ? "Administrator" : "Employee"}
          </div>
        </div>
      </section>

      {/* Admin Statistics */}
      {appUser.role === "ADMIN" && stats && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--sea-ink)]">
              Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Live summary of your organization's data.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Employees"
              value={stats.totalEmployees}
            />
            <StatsCard
              title="Active Employees"
              value={stats.activeEmployees}
            />
            <StatsCard
              title="Departments"
              value={stats.totalDepartments}
            />
            <StatsCard
              title="Pending Leaves"
              value={stats.pendingLeaves}
            />
          </div>
        </section>
      )}

      {/* Quick Access */}
      <section className="quick-access-section space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--sea-ink)]">
            Quick Access
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {appUser.role === "ADMIN"
              ? "Quickly access your management tools."
              : "Quickly access your employee services."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="quick-access-card group block rounded-2xl border p-6 no-underline"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="quick-access-number flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span aria-hidden="true" className="quick-access-arrow text-lg">
                  →
                </span>
              </div>

              <h3 className="quick-access-title text-lg font-bold">
                {item.title}
              </h3>

              <p className="quick-access-description mt-2 text-sm leading-6">
                {item.description}
              </p>

              <p className="quick-access-action mt-5 text-sm font-bold">
                Open section
              </p>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
