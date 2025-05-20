"use client";

import { useState, useEffect } from "react";
import EmployeeDashboard from "./EmployeeDashboard"; // Ensure this path is correct

type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  manager_approval: "Pending" | "Approved" | "Rejected";
  hr_approval: "Pending" | "Approved" | "Rejected";
  employee: {
    fullname: string;
  };
};

const HRDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Fetch leave requests for HR to approve
  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://leave-management-system-backend-g9ke.onrender.com/leaveRequests/approver`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      const data = await response.json();
      console.log("Fetched leave requests:", data); // Log data to inspect it
      setLeaveRequests(data);
      setShowTable(true);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle HR's approval or rejection
  const handleHRApproval = async (
    id: string,
    decision: "Approved" | "Rejected"
  ) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${decision} this leave request?`
    );
    if (!confirmAction) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://leave-management-system-backend-g9ke.onrender.com/leaveRequest/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: "Hr",
            approved: decision === "Approved",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update leave request");

      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, hr_approval: decision } : req
        )
      );
    } catch (err) {
      console.error("Approval error:", err);
      setError("❌ Failed to update leave request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch leave requests when the component is mounted
    fetchLeaveRequests();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Welcome, HR</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        You can approve employee leave requests and access your employee dashboard.
      </p>

      {/* Employee Dashboard Component */}
      <div className="mb-8">
        <EmployeeDashboard />
      </div>

      <button
        onClick={fetchLeaveRequests}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded mb-6 transition-all"
        disabled={loading}
      >
        🔔 View Leave Requests
      </button>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">Loading leave requests...</p>
      )}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {/* Display table if leave requests exist */}
      {showTable && !loading && leaveRequests.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No leave requests found for approval.</p>
      )}

      {/* Leave Requests Table */}
      {showTable && !loading && leaveRequests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="border px-4 py-2">Employee</th>
                <th className="border px-4 py-2">Start Date</th>
                <th className="border px-4 py-2">End Date</th>
                <th className="border px-4 py-2">Manager Approval</th>
                <th className="border px-4 py-2">HR Approval</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2 border">{request.employee?.fullname || "Unknown"}</td>
                  <td className="px-4 py-2 border">{new Date(request.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{new Date(request.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{request.manager_approval}</td>
                  <td className="px-4 py-2 border">{request.hr_approval || "Pending"}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => handleHRApproval(request.id, "Approved")}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-1 rounded"
                      disabled={loading || request.manager_approval !== "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleHRApproval(request.id, "Rejected")}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1 rounded"
                      disabled={loading || request.manager_approval !== "Approved"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
