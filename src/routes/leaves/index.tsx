
import { useState } from "react";
import { createFileRoute, redirect,useRouter } from "@tanstack/react-router";
import { getCurrentAppUser } from "@/lib/auth.functions";
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveTypes,
  updateLeaveRequest,
} from "@/server/leave.functions";

export const Route = createFileRoute("/leaves/")({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw redirect({ to: "/login" });
    }

    if (appUser.role !== "ADMIN" && appUser.role !== "EMPLOYEE") {
      throw redirect({ to: "/dashboard" });
    }

    return { appUser };
  },

  loader: async () => {
    const [requests, leaveTypes] = await Promise.all([
      getLeaveRequests(),
      getLeaveTypes(),
    ]);

    return { requests, leaveTypes };
  },

  component: LeavePage,
});

function LeavePage() {
  const { appUser } = Route.useRouteContext();
  const { requests, leaveTypes } = Route.useLoaderData();
  const router = useRouter();

  const isAdmin = appUser.role === "ADMIN";

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!leaveTypeId || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setLoading(true);

    try {
      await createLeaveRequest({
        data: {
          employeeId: appUser.employeeId!,
          leaveTypeId,
          startDate,
          endDate,
          reason,
        },
      });

      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setSuccess("Leave request submitted successfully.");

      await router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit leave request."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    request: (typeof requests)[number],
    status: "APPROVED" | "REJECTED"
  ) {
    setError("");
    setSuccess("");

    try {
      await updateLeaveRequest({
        data: {
          id: request.id,
          employeeId: request.employeeId,
          leaveTypeId: request.leaveTypeId,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason ?? undefined,
          status,
        },
      });

      setSuccess(`Leave request ${status.toLowerCase()} successfully.`);
      await router.invalidate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update leave request."
      );
    }
  }

  function getLeaveTypeName(id: string) {
    return leaveTypes.find((type) => type.id === id)?.name ?? "Unknown";
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="mt-2 text-gray-500">
          {isAdmin
            ? "Review and manage employee leave requests."
            : "Apply for leave and track your requests."}
        </p>
      </div>

      {!isAdmin && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">Apply for Leave</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Leave Type *
              </label>
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                required
                className="w-full rounded-lg border p-2.5"
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-lg border p-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded-lg border p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border p-2.5"
                placeholder="Enter the reason for leave"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {isAdmin ? "All Leave Requests" : "My Leave Requests"}
          </h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            Total: {requests.length}
          </span>
        </div>

        {requests.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            No leave requests found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm text-gray-600">
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  {isAdmin && <th className="p-3">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b text-sm">
                    <td className="p-3">{getLeaveTypeName(request.leaveTypeId)}</td>
                    <td className="p-3">{request.startDate}</td>
                    <td className="p-3">{request.endDate}</td>
                    <td className="p-3">{request.reason || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          request.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : request.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="p-3">
                        {request.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleStatusChange(request, "APPROVED")
                              }
                              className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(request, "REJECTED")
                              }
                              className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">Reviewed</span>
                        )}
                      </td>
                    )}
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
