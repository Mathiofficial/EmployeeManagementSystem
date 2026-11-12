
import { useMemo, useState } from "react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
  redirect,
  Link,
} from "@tanstack/react-router";

import {
  getEmployees,
  deactivateEmployee,
} from "@/server/employee.functions";

import { getCurrentAppUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/employees/")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw redirect({ to: "/login" });
    }

    if (appUser.role !== "ADMIN") {
      throw redirect({ to: "/dashboard" });
    }
  },

  loader: () => getEmployees(),

  component: RouteComponent,
});

function RouteComponent() {
  const employees = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const departments = useMemo(() => {
    return [...new Set(
      employees
        .map((employee) => employee.departmentName)
        .filter((name): name is string => Boolean(name))
    )].sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((employee) => {
        const fullName =
          `${employee.firstName} ${employee.lastName ?? ""}`.toLowerCase();

        const searchValue = search.toLowerCase();

        const matchesSearch =
          fullName.includes(searchValue) ||
          employee.employeeCode.toLowerCase().includes(searchValue) ||
          employee.email.toLowerCase().includes(searchValue);

        const matchesDepartment =
          departmentFilter === "ALL" ||
          employee.departmentName === departmentFilter;

        const matchesStatus =
          statusFilter === "ALL" ||
          (employee.status ?? "ACTIVE") === statusFilter;

        return matchesSearch && matchesDepartment && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "code") {
          return a.employeeCode.localeCompare(b.employeeCode);
        }

        return `${a.firstName} ${a.lastName ?? ""}`.localeCompare(
          `${b.firstName} ${b.lastName ?? ""}`
        );
      });
  }, [employees, search, departmentFilter, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedEmployees = filteredEmployees.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  async function handleDeactivate(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this employee?\n\nTheir attendance and leave history will be preserved."
    );

    if (!confirmed) return;

    try {
      const result = await deactivateEmployee({
        data: { id },
      });

      if (result.length === 0) {
        alert("Employee not found.");
        return;
      }

      alert("Employee deactivated successfully!");

      await router.invalidate();
    } catch (error) {
      console.error(error);
      alert("Unable to deactivate employee.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 p-4 md:p-6">

      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-teal-600 dark:text-teal-300">
            WORKFORCE MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--sea-ink)]">
            Employees
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage employee information and employment status.
          </p>
        </div>

        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          + Add Employee
        </Link>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Employees
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--sea-ink)]">
            {employees.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active Employees
          </p>
          <p className="mt-2 text-2xl font-bold text-teal-600 dark:text-teal-300">
            {employees.filter((e) => (e.status ?? "ACTIVE") === "ACTIVE").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inactive Employees
          </p>
          <p className="mt-2 text-2xl font-bold text-orange-500">
            {employees.filter((e) => e.status === "INACTIVE").length}
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-[var(--sea-ink)]">
          Search and Filters
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, email or employee ID..."
            className="w-full rounded-xl border border-[var(--chip-line)] bg-transparent px-4 py-3 text-sm text-[var(--sea-ink)] outline-none placeholder:text-gray-400 focus:border-teal-500"
          />

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none focus:border-teal-500"
          >
            <option value="name">Sort by Name</option>
            <option value="code">Sort by Employee ID</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredEmployees.length} matching employees
          </p>

          <button
            onClick={() => {
              setSearch("");
              setDepartmentFilter("ALL");
              setStatusFilter("ALL");
              setSortBy("name");
              setCurrentPage(1);
            }}
            className="text-sm font-semibold text-teal-600 transition hover:text-teal-700 dark:text-teal-300"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Employee Table */}
      <section className="overflow-hidden rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] shadow-sm">
        <div className="border-b border-[var(--chip-line)] p-5">
          <h2 className="font-semibold text-[var(--sea-ink)]">
            Employee Directory
          </h2>
        </div>

        {paginatedEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[var(--sea-ink)]">
              No employees found
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <tr>
                  <th className="px-5 py-4">Employee ID</th>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--chip-line)]">
                {paginatedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-semibold text-[var(--sea-ink)]">
                      {employee.employeeCode}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--sea-ink)]">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {employee.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[var(--sea-ink)]">
                      {employee.departmentName ?? "Not assigned"}
                    </td>

                    <td className="px-5 py-4 text-[var(--sea-ink)]">
                      {employee.designationTitle ?? "Not assigned"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          (employee.status ?? "ACTIVE") === "ACTIVE"
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-300"
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-300"
                        }`}
                      >
                        {employee.status ?? "ACTIVE"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigate({
                              to: "/employees/$employeeId",
                              params: { employeeId: employee.id },
                            })
                          }
                          className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-300"
                        >
                          View / Edit
                        </button>

                        <button
                          onClick={() => handleDeactivate(employee.id)}
                          disabled={employee.status === "INACTIVE"}
                          className="font-semibold text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--chip-line)] p-5 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {safePage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-[var(--chip-line)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-black/[0.04] disabled:opacity-40 dark:hover:bg-white/[0.05]"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={safePage === totalPages}
              className="rounded-lg border border-[var(--chip-line)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-black/[0.04] disabled:opacity-40 dark:hover:bg-white/[0.05]"
            >
              Next
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
