"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiCheck, FiX, FiCalendar, FiLoader, FiAlertCircle, FiCheckCircle, FiUser } from "react-icons/fi";
import EmployeeDashboard from "./EmployeeDashboard";
import LeaveCalendar from "../calendar/calendar";
import EmployeeManagement from "./EmployeeManagement";

// Interfaces
interface LeaveType {
  leave_type: string;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  manager_approval: "Pending" | "Approved" | "Rejected" | "NotRequired";
  HR_approval: "Pending" | "Approved" | "Rejected";
  employee: {
    fullname: string;
    id: string;
  };
  leaveType?: LeaveType;
  reason?: string;
}

type ViewMode = "requests" | "employee" | "calendar" | "employees";
type Notification = { text: string; type: "success" | "error" | "info" | "" };

const HRDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification>({ text: "", type: "" });
  const [currentView, setCurrentView] = useState<ViewMode>("requests");

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.text) {
      const timer = setTimeout(() => setNotification({ text: "", type: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    setNotification({ text: "", type: "" });
    try {
      const response = await fetch("https://leave-management-system-backend-g9ke.onrender.com/leaveRequests/approver", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leave requests: ${response.statusText}`);
      }

      const data: LeaveRequest[] = await response.json();
      setLeaveRequests(data);
      setNotification({ text: "Leave requests loaded successfully", type: "success" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      console.error("Fetch error:", err);
      setNotification({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle HR approval/rejection
  const handleHRApproval = useCallback(
    async (id: string, decision: "Approved" | "Rejected") => {
      if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this leave request?`)) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/leaveRequest/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: "Hr", approved: decision === "Approved" }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update leave request: ${response.statusText}`);
        }

        setLeaveRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, HR_approval: decision } : req))
        );
        setNotification({
          text: `Leave request ${decision.toLowerCase()} successfully`,
          type: "success",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update leave request";
        console.error("Approval error:", err);
        setNotification({ text: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load data when view changes
  useEffect(() => {
    if (currentView === "requests") {
      fetchLeaveRequests();
    }
  }, [currentView, fetchLeaveRequests]);

  // Render current view based on ViewMode
  const renderCurrentView = () => {
    switch (currentView) {
      case "employee":
        return (
          <div className="p-6">
            <EmployeeDashboard />
          </div>
        );
      case "calendar":
        return (
          <div className="p-6">
            <LeaveCalendar role="HR" />
          </div>
        );
      case "employees":
        return <EmployeeManagement />;
      case "requests":
      default:
        return (
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                  <FiCalendar />
                  Leave Requests Awaiting HR Approval
                </h2>
                {leaveRequests.filter((req) => req.manager_approval !== "Pending" && req.HR_approval === "Pending")
                  .length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    No leave requests currently require HR approval.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white dark:bg-gray-700 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Leave Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Manager Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            HR Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {leaveRequests
                          .filter((request) => request.manager_approval !== "Pending" && request.HR_approval === "Pending")
                          .map((request) => (
                            <motion.tr
                              key={request.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                                {request.employee?.fullname || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {request.leaveType?.leave_type || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                                {request.reason || "No reason provided"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {new Date(request.startDate).toLocaleDateString()} -{" "}
                                {new Date(request.endDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    request.manager_approval === "Approved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : request.manager_approval === "Pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : request.manager_approval === "NotRequired"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }`}
                                >
                                  {request.manager_approval}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    request.HR_approval === "Approved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : request.HR_approval === "Pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }`}
                                >
                                  {request.HR_approval}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleHRApproval(request.id, "Approved")}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                    disabled={loading}
                                  >
                                    <FiCheck />
                                    Approve
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleHRApproval(request.id, "Rejected")}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                    disabled={loading}
                                  >
                                    <FiX />
                                    Reject
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {notification.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
                notification.type === "success"
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : notification.type === "error"
                  ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              }`}
            >
              {notification.type === "success" ? (
                <FiCheckCircle className="text-xl" />
              ) : notification.type === "error" ? (
                <FiAlertCircle className="text-xl" />
              ) : (
                <FiBell className="text-xl" />
              )}
              <span>{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiUser className="text-purple-500" />
                  HR Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {currentView === "requests" && "Manage leave requests"}
                  {currentView === "employee" && "Employee dashboard"}
                  {currentView === "calendar" && "Team leave calendar"}
                  {currentView === "employees" && "Employee management"}
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView("requests")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${
                    currentView === "requests"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <FiBell />
                  Leave Requests
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView("employee")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${
                    currentView === "employee"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <FiUser />
                  My Leaves
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView("calendar")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${
                    currentView === "calendar"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <FiCalendar />
                  Calendar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView("employees")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${
                    currentView === "employees"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <FiUser />
                  Employee Management
                </motion.button>
              </div>
            </div>
          </div>

          {renderCurrentView()}
        </motion.div>
      </div>
    </div>
  );
};

export default HRDashboard;