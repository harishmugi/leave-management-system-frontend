"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiCheck,
  FiX,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiUser   
} from "react-icons/fi";
import LeaveCalendar from "../calendar/calendar";

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

type LeaveRequest = {
  id: string;
  reason:string;
  startDate: string;
  endDate: string;
  status: string;
  manager_approval: ApprovalStatus;
  HR_approval: ApprovalStatus;
  director_approval: ApprovalStatus;
  employee: {
    fullname: string;
  };
};

type ViewMode = "requests" | "calendar";

const DirectorDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ text: "", type: "" });
  const [currentView, setCurrentView] = useState<ViewMode>("requests");

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setNotification({ text: "", type: "" });
    try {
      const response = await fetch(`http://localhost:3000/leaveRequests/approver`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch leave requests');

      const data: LeaveRequest[] = await response.json();
      setLeaveRequests(data);
      setNotification({ text: "Leave requests loaded successfully", type: "success" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Fetch error:', err.message);
        setNotification({ text: err.message || "Failed to fetch leave requests", type: "error" });
      } else {
        console.error('Unknown error:', err);
        setNotification({ text: "An unknown error occurred", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectorApproval = async (id: string, decision: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`http://localhost:3000/leaveRequest/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'Director',
          approved: decision === 'Approved',
        }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to update leave request');
      await fetchLeaveRequests();
      setNotification({
        text: `Leave request ${decision.toLowerCase()} successfully`,
        type: "success",
      });
    } catch (err: unknown) {
      console.error('Approval error:', err);
      setNotification({
        text: "Failed to update leave request",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    if (notification.text) {
      const timer = setTimeout(() => setNotification({ text: "", type: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "calendar":
        return (
          <div className="p-6">
            <LeaveCalendar role="Director" />
          </div>
        );
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
                  Pending Approval Requests
                </h2>
                {leaveRequests.filter(request => request.director_approval === "Pending" && request.HR_approval === "Approved").length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    No pending leave requests found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white dark:bg-gray-700 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          {["Employee", "Reason","Start Date", "End Date", "Manager Approval", "HR Approval", "Director Approval", "Actions"].map(
                            (header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {leaveRequests
                          .filter((request) => request.director_approval === "Pending" && request.HR_approval === "Approved")
                          .map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white">
                                {request.employee?.fullname || "Unknown"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {request.reason}
                              </td>  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {new Date(request.startDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {new Date(request.endDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {request.manager_approval}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {request.HR_approval}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    request.director_approval === "Approved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : request.director_approval === "Pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }`}
                                >
                                  {request.director_approval}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDirectorApproval(request.id, "Approved")}
                                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                                      request.director_approval !== "Pending"
                                        ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                                    disabled={request.director_approval !== "Pending"}
                                  >
                                    <FiCheck />
                                    Approve
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDirectorApproval(request.id, "Rejected")}
                                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                                      request.director_approval !== "Pending"
                                        ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                                    disabled={request.director_approval !== "Pending"}
                                  >
                                    <FiX />
                                    Reject
                                  </motion.button>
                                </div>
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        <AnimatePresence>
          {notification.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
                notification.type === "success"
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <FiCheckCircle className="text-xl" />
              ) : (
                <FiAlertCircle className="text-xl" />
              )}
              <span>{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiUser className="text-blue-500" />
                  Director Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {currentView === "requests" && "Review and approve leave requests"}
                  {currentView === "calendar" && "Team leave calendar"}
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
                  Requests
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
              </div>
            </div>
          </div>

          {/* Main Content */}
          {renderCurrentView()}
        </motion.div>
      </div>
    </div>
  );
};

export default DirectorDashboard;