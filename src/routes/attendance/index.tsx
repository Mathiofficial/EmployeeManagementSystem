import { getLeaveRequests } from "@/server/leave.functions";
import {
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { getEmployees } from "@/server/employee.functions";
import { getCurrentAppUser } from "@/lib/auth.functions";

import {
  getAttendanceRecords,
  markMyAttendance,
  checkOutMyAttendance,
  getAdminAttendanceReport,
} from "@/server/attendance.functions";

export const Route = createFileRoute("/attendance/")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw redirect({ to: "/login" });
    }

    if (appUser.role !== "ADMIN" && appUser.role !== "EMPLOYEE") {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
  const appUser = await getCurrentAppUser();
  const records = await getAttendanceRecords();

  const adminRecords =
    appUser?.role === "ADMIN"
      ? await getAdminAttendanceReport({ data: {} })
      : [];

  const employees =
    appUser?.role === "ADMIN"
      ? await getEmployees()
      : [];

  const leaveRequests =
    appUser?.role === "ADMIN"
      ? await getLeaveRequests()
      : [];

  return {
    records,
    adminRecords,
    employees,
    leaveRequests,
    appUser,
  };
},
  component: AttendancePage,
});

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN");
}

function formatTime(value: string | null) {
  if (!value) return "Not recorded";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function AttendancePage() {
  const {
    records,
    adminRecords,
    employees,
    leaveRequests,
    appUser,
  } = Route.useLoaderData();

  return (
    <AttendanceContent
      records={records}
      adminRecords={adminRecords}
      employees={employees}
      leaveRequests={leaveRequests}
      isEmployee={appUser?.role === "EMPLOYEE"}
      isAdmin={appUser?.role === "ADMIN"}
    />
  );
}

function AttendanceContent({
  records,
  adminRecords,
  employees,
  leaveRequests,
  isEmployee,
  isAdmin,
}: {
  records: Awaited<ReturnType<typeof getAttendanceRecords>>;
  adminRecords: Awaited<ReturnType<typeof getAdminAttendanceReport>>;
  employees: Awaited<ReturnType<typeof getEmployees>>;
  leaveRequests: Awaited<ReturnType<typeof getLeaveRequests>>;
  isEmployee: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();

  const [marking, setMarking] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const filteredAdminRecords = adminRecords.filter((record) => {
  const matchesDate =
    !filterDate || record.attendanceDate === filterDate;

  const matchesEmployee =
    !filterEmployee || record.employeeId === filterEmployee;

  return matchesDate && matchesEmployee;
});

const activeEmployees = employees.filter(
  (employee) => employee.status === "ACTIVE"
);

const presentCount = filteredAdminRecords.filter(
  (record) => record.status === "PRESENT"
).length;

const halfDayCount = filteredAdminRecords.filter(
  (record) => record.status === "HALF_DAY"
).length;

const onLeaveEmployees = filterDate
  ? activeEmployees.filter((employee) => {
      if (filterEmployee && employee.id !== filterEmployee) {
        return false;
      }

      return leaveRequests.some(
        (leave) =>
          leave.employeeId === employee.id &&
          leave.status === "APPROVED" &&
          leave.startDate <= filterDate &&
          leave.endDate >= filterDate
      );
    })
  : [];

const absentEmployees = filterDate
  ? activeEmployees.filter((employee) => {
      if (filterEmployee && employee.id !== filterEmployee) {
        return false;
      }

      const employeeRecord = adminRecords.find(
        (record) =>
          record.employeeId === employee.id &&
          record.attendanceDate === filterDate
      );

      const isOnApprovedLeave = onLeaveEmployees.some(
        (leaveEmployee) => leaveEmployee.id === employee.id
      );

      if (isOnApprovedLeave) {
        return false;
      }

      return !employeeRecord || employeeRecord.status === "ABSENT";
    })
  : [];

const absentCount = filterDate ? absentEmployees.length : null;

const leaveCount = filterDate
  ? onLeaveEmployees.length
  : filteredAdminRecords.filter((record) => record.status === "LEAVE").length;

const employeeOptions = Array.from(
  new Map(
    adminRecords.map((record) => [
      record.employeeId,
      {
        id: record.employeeId,
        name: `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim(),
        code: record.employeeCode,
      },
    ])
  ).values()
);

const exportAttendanceReport = () => {
  const headers = [
    "Employee Name",
    "Employee Code",
    "Attendance Date",
    "Check In",
    "Check Out",
    "Status",
  ];

  const rows = filteredAdminRecords.map((record) => [
    `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim(),
    record.employeeCode ?? "",
    record.attendanceDate,
    record.checkIn ?? "",
    record.checkOut ?? "",
    record.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "attendance-report.csv";
  link.click();
  URL.revokeObjectURL(url);
};

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const todayRecord = records.find(
    (record) => record.attendanceDate === today
  );

  async function handleCheckIn() {
    setMarking(true);
    setMessage("");
    setError("");

    try {
      await markMyAttendance();
      setMessage("Check-in successful!");
      await router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to check in."
      );
    } finally {
      setMarking(false);
    }
  }

  async function handleCheckOut() {
    setCheckingOut(true);
    setMessage("");
    setError("");

    try {
      await checkOutMyAttendance();
      setMessage("Check-out successful!");
      await router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to check out."
      );
    } finally {
      setCheckingOut(false);
    }
  }

  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
  }).format(new Date());

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Attendance Management
        </h1>
        <p className="mt-2 text-gray-500">
          View attendance records and check-in details.
        </p>
      </div>

      {isEmployee && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">
            Today's Attendance
          </h2>

          <p className="mt-2 text-gray-500">{todayFormatted}</p>

          {todayRecord ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm">
                Check In:{" "}
                <span className="font-semibold">
                  {formatTime(todayRecord.checkIn)}
                </span>
              </p>

              <p className="text-sm">
                Check Out:{" "}
                <span className="font-semibold">
                  {formatTime(todayRecord.checkOut)}
                </span>
              </p>

              {!todayRecord.checkOut ? (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {checkingOut ? "Checking Out..." : "Check Out"}
                </button>
              ) : (
                <p className="font-medium text-green-600">
                  You have completed today's attendance.
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={marking}
              className="mt-4 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {marking ? "Checking In..." : "Check In"}
            </button>
          )}

          {message && (
            <p className="mt-3 text-sm text-green-600">{message}</p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
      
      {isAdmin && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Admin Attendance Filters
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Filter by Date
              </label>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Filter by Employee
              </label>

              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="">All Employees</option>

                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Matching Records: {filteredAdminRecords.length}
            </p>

            <button
              type="button"
              onClick={() => {
                setFilterDate("");
                setFilterEmployee("");
              }}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={exportAttendanceReport}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Present</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {presentCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Absent</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {absentCount ?? "Select a date"}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Half Day</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {halfDayCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">On Leave</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {leaveCount}
            </p>
          </div>
        </div>
      )}

      {isAdmin && filterDate && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Absent Employees</h2>

          {absentEmployees.length === 0 ? (
            <p className="text-sm text-gray-500">
              No absent employees found for this date.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm text-gray-600">
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Employee Code</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {absentEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b text-sm">
                      <td className="p-3">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="p-3">{employee.employeeCode}</td>
                      <td className="p-3 font-medium text-red-600">
                        ABSENT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isAdmin && filterDate && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Employees On Leave</h2>

          {onLeaveEmployees.length === 0 ? (
            <p className="text-sm text-gray-500">
              No employees are on approved leave for this date.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm text-gray-600">
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Employee Code</th>
                    <th className="p-3">Leave Status</th>
                  </tr>
                </thead>

                <tbody>
                  {onLeaveEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b text-sm">
                      <td className="p-3">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="p-3">{employee.employeeCode}</td>
                      <td className="p-3 font-medium text-blue-600">
                        ON LEAVE
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            Attendance Records
          </h2>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            Total Records: {isAdmin ? filteredAdminRecords.length : records.length}
          </span>
        </div>

        {(isAdmin ? filteredAdminRecords.length : records.length) === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm text-gray-600">
                  {isAdmin && <th className="p-3">Employee Name</th>}
                  {isAdmin && <th className="p-3">Employee Code</th>}
                  <th className="p-3">Attendance Date</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Status</th>
                  {!isAdmin && <th className="p-3">Employee ID</th>}
                </tr>
              </thead>

              <tbody>
                {isAdmin
                  ? filteredAdminRecords.map((record) => (
                      <tr key={record.id} className="border-b text-sm">
                        <td className="p-3">
                          {`${record.firstName ?? ""} ${record.lastName ?? ""}`.trim()}
                        </td>
                        <td className="p-3">{record.employeeCode}</td>
                        <td className="p-3">
                          {formatDate(record.attendanceDate)}
                        </td>
                        <td className="p-3">{formatTime(record.checkIn)}</td>
                        <td className="p-3">{formatTime(record.checkOut)}</td>
                        <td className="p-3">{record.status}</td>
                      </tr>
                    ))
                  : records.map((record) => (
                      <tr key={record.id} className="border-b text-sm">
                        <td className="p-3">
                          {formatDate(record.attendanceDate)}
                        </td>
                        <td className="p-3">{formatTime(record.checkIn)}</td>
                        <td className="p-3">{formatTime(record.checkOut)}</td>
                        <td className="p-3">{record.status}</td>
                        <td className="p-3 font-mono text-xs">
                          {record.employeeId}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
