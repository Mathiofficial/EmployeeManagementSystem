import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  getEmployee,
  editEmployee,
  getEmployeeHistory,
} from "@/server/employee.functions";

import {
  getDepartments,
} from "@/server/department.functions";

import { getDesignations } from "@/server/designation.functions";

import {
  createEmployeeAccount,
  getEmployeeAccountStatus,
  resetEmployeePassword,
} from "@/server/account.functions";

import { getCurrentAppUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/employees/$employeeId")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) throw redirect({ to: "/login" });
    if (appUser.role !== "ADMIN") throw redirect({ to: "/dashboard" });
  },

  loader: async () => {
    const [departments, designations] = await Promise.all([
      getDepartments(),
      getDesignations(),
    ]);

    return { departments, designations };
  },

  component: EditEmployeePage,
});

function EditEmployeePage() {
  const navigate = useNavigate();
  const { employeeId } = Route.useParams();
  const { departments, designations } = Route.useLoaderData();

  const [form, setForm] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    departmentId: "",
    designationId: "",
    joiningDate: "",
    salary: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [hasAccount, setHasAccount] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  type EmployeeHistory = NonNullable<
  Awaited<ReturnType<typeof getEmployeeHistory>>
>;

const [history, setHistory] = useState<EmployeeHistory | null>(null);
const [historyLoading, setHistoryLoading] = useState(true);

  const filteredDesignations = designations.filter(
    (designation) =>
      !form.departmentId ||
      designation.departmentId === form.departmentId
  );

  useEffect(() => {
    async function loadEmployeeHistory() {
      try {
        setHistoryLoading(true);

        const result = await getEmployeeHistory({
          data: { id: employeeId },
        });

        setHistory(result);
      } catch (error) {
        console.error("Failed to load employee history:", error);
      } finally {
        setHistoryLoading(false);
      }
    }
    async function loadEmployee() {
      try {
        const employee = await getEmployee({
          data: { id: employeeId },
        });


        if (!employee) {
          setError("Employee not found.");
          return;
        }

        setForm({
          employeeCode: employee.employeeCode || "",
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          email: employee.email || "",
          phone: employee.phone || "",
          dateOfBirth: employee.dateOfBirth || "",
          gender: employee.gender || "",
          address: employee.address || "",
          departmentId: employee.departmentId || "",
          designationId: employee.designationId || "",
          joiningDate: employee.joiningDate || "",
          salary: employee.salary || "",
          status:
            employee.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        });
      } catch (error) {
        console.error(error);
        setError("Unable to load employee details.");
      } finally {
        setLoading(false);
      }
    }

    async function loadAccountStatus() {
      try {
        const result = await getEmployeeAccountStatus({
          data: { employeeId },
        });

        setHasAccount(result.hasAccount);
      } catch (error) {
        console.error(error);
        setAccountError("Unable to check login account status.");
      } finally {
        setAccountLoading(false);
      }
    }

    loadEmployee();
    loadAccountStatus();
    loadEmployeeHistory();
  }, [employeeId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "departmentId" ? { designationId: "" } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await editEmployee({
        data: {
          id: employeeId,
          ...form,
          phone: form.phone || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          address: form.address || undefined,
          departmentId: form.departmentId || undefined,
          designationId: form.designationId || undefined,
          salary: form.salary || undefined,
        },
      });

      await navigate({ to: "/employees" });
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update employee details."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (resetPassword.length < 8) {
      setResetError("Password must contain at least 8 characters.");
      return;
    }

    setResetting(true);

    try {
      const result = await resetEmployeePassword({
        data: {
          employeeId,
          newPassword: resetPassword,
        },
      });

      setResetPassword("");
      setResetSuccess(result.message);
    } catch (error) {
      setResetError(
        error instanceof Error
          ? error.message
          : "Unable to reset employee password."
      );
    } finally {
      setResetting(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAccountError("");
    setAccountSuccess("");

    if (password.length < 8) {
      setAccountError("Password must contain at least 8 characters.");
      return;
    }

    setCreatingAccount(true);

    try {
      const result = await createEmployeeAccount({
        data: {
          employeeId,
          password,
        },
      });

      setHasAccount(true);
      setPassword("");
      setAccountSuccess(result.message);
    } catch (error) {
      console.error(error);
      setAccountError(
        error instanceof Error
          ? error.message
          : "Unable to create employee account."
      );
    } finally {
      setCreatingAccount(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading employee...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-8">

        <div>
          <h1 className="mb-2 text-2xl font-bold text-[var(--sea-ink)]">
            Edit Employee
          </h1>
          <p className="text-sm text-gray-500">
            Update employee personal and professional information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6 shadow-sm"
        >
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
              Personal Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />

              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />

              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />

              <label className="space-y-1 text-sm">
                Date of Birth
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                Gender
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <textarea
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border p-3"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
              Professional Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="employeeCode"
                placeholder="Employee Code"
                value={form.employeeCode}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />

              <label className="space-y-1 text-sm">
                Department
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                Designation
                <select
                  name="designationId"
                  value={form.designationId}
                  onChange={handleChange}
                  disabled={!form.departmentId}
                  className="w-full rounded-lg border p-3 disabled:opacity-50"
                >
                  <option value="">Select Designation</option>
                  {filteredDesignations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                Joining Date
                <input
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3"
                />
              </label>

              <input
                name="salary"
                type="number"
                min="0"
                step="0.01"
                placeholder="Salary"
                value={form.salary}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              />

              <label className="space-y-1 text-sm">
                Employment Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>
          </section>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Employee"}
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: "/employees" })}
              className="rounded-lg bg-gray-500 px-5 py-3 font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="space-y-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Employee Login Account
          </h2>

          {accountLoading ? (
            <p>Checking account status...</p>
          ) : hasAccount ? (
            <>
              <p className="font-medium text-green-600">
                This employee already has a login account.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <h3 className="font-semibold">Reset Employee Password</h3>

                <input
                  type="password"
                  placeholder="New password (minimum 8 characters)"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  className="w-full rounded-lg border p-3"
                />

                {resetError && (
                  <p className="text-sm text-red-500">{resetError}</p>
                )}
                {resetSuccess && (
                  <p className="text-sm text-green-600">{resetSuccess}</p>
                )}

                <button
                  type="submit"
                  disabled={resetting}
                  className="w-full rounded-lg bg-orange-600 px-4 py-3 text-white disabled:opacity-50"
                >
                  {resetting ? "Resetting..." : "Reset Employee Password"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Create login credentials for this employee.
              </p>

              <form onSubmit={handleCreateAccount} className="space-y-3">
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full rounded-lg border bg-gray-100 p-3"
                />

                <input
                  type="password"
                  placeholder="Create password (minimum 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  className="w-full rounded-lg border p-3"
                />

                {accountError && (
                  <p className="text-sm text-red-500">{accountError}</p>
                )}
                {accountSuccess && (
                  <p className="text-sm text-green-600">{accountSuccess}</p>
                )}

                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-white disabled:opacity-50"
                >
                  {creatingAccount ? "Creating Account..." : "Create Login Account"}
                </button>
              </form>
            </>
          )}

          {accountError && hasAccount && (
            <p className="text-sm text-red-500">{accountError}</p>
          )}
        </div>

        {/* Employee Attendance History */}
        <div className="space-y-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Attendance Summary
          </h2>

          {historyLoading ? (
            <p className="text-gray-500">Loading attendance history...</p>
          ) : !history ? (
            <p className="text-gray-500">Unable to load attendance history.</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {history.attendance.length}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-700">
                    {history.attendance.filter(
                      (record) => record.status.toUpperCase() === "PRESENT"
                    ).length}
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-700">
                    {history.attendance.filter(
                      (record) => record.status.toUpperCase() === "ABSENT"
                    ).length}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-[var(--sea-ink)]">
                Attendance Records
              </h3>

              {history.attendance.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No attendance records found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Check In</th>
                        <th className="p-3">Check Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.attendance.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="p-3">{record.attendanceDate}</td>
                          <td className="p-3">{record.status}</td>
                          <td className="p-3">
                            {record.checkIn
                              ? new Date(record.checkIn).toLocaleTimeString()
                              : "—"}
                          </td>
                          <td className="p-3">
                            {record.checkOut
                              ? new Date(record.checkOut).toLocaleTimeString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Employee Leave History */}
        <div className="space-y-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
            Leave History
          </h2>

          {historyLoading ? (
            <p className="text-gray-500">Loading leave history...</p>
          ) : !history ? (
            <p className="text-gray-500">Unable to load leave history.</p>
          ) : history.leaves.length === 0 ? (
            <p className="text-sm text-gray-500">
              No leave requests found for this employee.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">End Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {history.leaves.map((leave) => (
                    <tr key={leave.id} className="border-b">
                      <td className="p-3">{leave.leaveTypeName}</td>
                      <td className="p-3">{leave.startDate}</td>
                      <td className="p-3">{leave.endDate}</td>
                      <td className="p-3">{leave.status}</td>
                      <td className="p-3">{leave.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
