"use client";

import { useEffect, useState } from "react";

type LeaveRequest = {
  reason: string;
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  manager_approval: string;
  employee: {
    fullname: string;
  };
};

const ManagerDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://leave-management-system-backend-g9ke.onrender.com/leaveRequests/approver", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch leave requests");

      const data = await response.json();
      setLeaveRequests(data);
      setShowTable(true);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, decision: "Approved" | "Rejected") => {
    try {
      const response = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/leaveRequest/${id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "Manager", // or 'id: "Manager"' if that's what your backend expects
          approved: decision === "Approved",
        }),
      });

      if (!response.ok) throw new Error("Failed to update leave request");

      await fetchLeaveRequests();
    } catch (err: any) {
      console.error("Approval error:", err);
      alert("❌ Failed to update leave request.");
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-2">Welcome, Manager</h1>
      <p className="mb-4">Click below to view employee leave requests for approval.</p>

      <button
        onClick={fetchLeaveRequests}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
      >
        🔔 View Leave Requests
      </button>

      {loading && <p className="text-gray-600 dark:text-gray-400">Loading leave requests...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && showTable && leaveRequests.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No leave requests found.</p>
      )}

      {showTable && !loading && leaveRequests.length > 0 && (
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-4 py-2">Employee</th>
              <th className="border px-4 py-2">Reason</th>
              <th className="border px-4 py-2">Start Date</th>
              <th className="border px-4 py-2">End Date</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Manager Approval</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id} className="bg-white dark:bg-gray-900">
                <td className="border px-4 py-2">{request.employee?.fullname || "Unknown"}</td>
                <td className="border px-4 py-2">{request.reason}</td>
                <td className="border px-4 py-2">{new Date(request.startDate).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{new Date(request.endDate).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{request.status}</td>
                <td className="border px-4 py-2">{request.manager_approval}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleApproval(request.id, "Approved")}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    disabled={request.manager_approval !== "Pending"}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleApproval(request.id, "Rejected")}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    disabled={request.manager_approval !== "Pending"}
                  >
                    ❌ Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerDashboard;
