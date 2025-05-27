"use client";

import React, { useEffect, useState } from 'react';
import LeaveRequestForm from './LeaveRequestForm';

import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiLoader, FiPlus, FiList, FiPieChart } from 'react-icons/fi';

export interface LeaveType {
  id: string;
  leave_type: string;
}

export interface LeaveRequestFormValues {
  leave_type_id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  leaveType?: {
    leave_type: string;
  };
}

interface LeaveBalance {
  id: string;
  allocated_leave: number;
  used_leave: number;
  remaining_leave: number;
  leaveType?: {
    leave_type: string;
  };
}


// ... (keep your existing interfaces)

const EmployeeDashboard = () => {
  // ... (keep your existing state and fetch functions)
const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaves, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveDetails, setLeaveDetails] = useState<LeaveBalance[]>([]);
  const [viewMode, setViewMode] = useState<'requests' | 'details' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveTypes');
      if (!res.ok) throw new Error('Failed to load leave types.');
      const data: LeaveType[] = await res.json();
      setLeaveTypes(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching leave types:', err);
      setError(err.message || 'Failed to load leave types.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      console.log('Fetching leave requests...');
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveRequests', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch leave requests');
      const data: LeaveRequest[] = await response.json();
      console.log('Leave data:', data);
      setLeaveRequests(data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      setError('Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveBalance', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch leave balances');
      const data: LeaveBalance[] = await response.json();
      setLeaveDetails(data);
      console.log(data)
      setError(null);
    } catch (error: any) {
      console.error('Error fetching leave balance:', error);
      setError('Unable to load leave balances.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRequestSubmit = async (formData: LeaveRequestFormValues) => {
    try {
      setFormKey(prev => prev + 1);
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveRequest', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit leave request');
      await fetchLeaves();
      setViewMode('requests');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit leave request.');
    }
  };

  // Function to calculate percentage for progress circle
  const calculatePercentage = (used: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.min(100, Math.round((used / allocated) * 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
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
                  <FiCalendar className="text-blue-500" />
                  Leave Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Submit and track your leave requests
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center gap-2"
                >
                  <FiAlertCircle className="text-xl" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leave Request Form */}
            <motion.div 
              className="mb-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <FiPlus />
                New Leave Request
              </h2>
              <LeaveRequestForm
                leaveTypes={leaveTypes}
                onSubmit={handleLeaveRequestSubmit}
                formKey={formKey}
              />
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  fetchLeaves();
                  setViewMode('requests');
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg shadow ${
                  viewMode === 'requests'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              >
                <FiList />
                View My Leave Requests
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  fetchLeaveDetails();
                  setViewMode('details');
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg shadow ${
                  viewMode === 'details'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              >
                <FiPieChart />
                View Leave Balances
              </motion.button>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'requests' && (
                  <motion.div
                    key="requests"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FiList />
                        My Leave Requests
                      </h2>
                    </div>
                    {leaves.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        You haven't submitted any leave requests yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Reason
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Start Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                End Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {leaves.map((request) => (
                              <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                                  {request.leaveType?.leave_type || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                  {request.reason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                  {new Date(request.startDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                  {new Date(request.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    request.status === 'Approved'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : request.status === 'Pending'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {request.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}

                {viewMode === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                      <FiPieChart />
                      Leave Balances
                    </h2>
                    {leaveDetails.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-xl">
                        No leave balance data available.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leaveDetails.map((detail) => {
                          const percentage = calculatePercentage(detail.used_leave, detail.allocated_leave);
                          const circumference = 2 * Math.PI * 45;
                          const strokeDashoffset = circumference - (percentage / 100) * circumference;

                          return (
                            <motion.div
                              key={detail.id}
                              whileHover={{ y: -5 }}
                              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-600"
                            >
                              <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-white">
                                {detail.leaveType?.leave_type || 'Unknown'}
                              </h3>
                              
                              <div className="relative w-40 h-40 mx-auto mb-6">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                  <circle
                                    className="text-gray-200 dark:text-gray-600"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50"
                                    cy="50"
                                  />
                                  <circle
                                    className="text-green-500"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50"
                                    cy="50"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    transform="rotate(-90 50 50)"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                                    {percentage}%
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Used
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Allocated:</span>
                                  <span className="font-medium text-gray-800 dark:text-white">
                                    {detail.allocated_leave} days
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Used:</span>
                                  <span className="font-medium text-gray-800 dark:text-white">
                                    {detail.used_leave} days
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {detail.remaining_leave} days
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;