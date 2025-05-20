"use client";

import React, { useEffect, useState } from 'react';
import LeaveRequestForm from './LeaveRequestForm';

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

const EmployeeDashboard = () => {
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

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Employee Dashboard</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Submit and view your leave requests.</p>

      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}
      {loading && <p className="text-gray-500 dark:text-gray-400 mb-4">Loading...</p>}

      <LeaveRequestForm
        leaveTypes={leaveTypes}
        onSubmit={handleLeaveRequestSubmit}
        formKey={formKey}
      />

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => {
            fetchLeaves();
            setViewMode('requests');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          📄 View My Leave Requests
        </button>

        <button
          onClick={() => {
            fetchLeaveDetails();
            setViewMode('details');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          📊 View Leave Balances
        </button>
      </div>

      {viewMode === 'requests' && (
        <div className="mt-8 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">My Leave Requests</h2>
          {leaves.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">You haven't submitted any leave requests yet.</p>
          ) : (
            <table className="w-full text-sm border dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 border">Type</th>
                  <th className="px-4 py-3 border">Reason</th>
                  <th className="px-4 py-3 border">Start</th>
                  <th className="px-4 py-3 border">End</th>
                  <th className="px-4 py-3 border">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {leaves.map((request) => (
                  <tr key={request.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2 border">{request.leaveType?.leave_type || 'Unknown'}</td>
                    <td className="px-4 py-2 border">{request.reason}</td>
                    <td className="px-4 py-2 border">{new Date(request.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border">{new Date(request.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border">{request.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {viewMode === 'details' && (
        <div className="mt-8 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Leave Balances</h2>
          {leaveDetails.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No leave balance data available.</p>
          ) : (
            <table className="w-full text-sm border dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 border">Type</th>
                  <th className="px-4 py-3 border">Allocated</th>
                  <th className="px-4 py-3 border">Used</th>
                  <th className="px-4 py-3 border">Remaining</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {leaveDetails.map((detail) => (
                  <tr key={detail.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2 border">{detail.leaveType?.leave_type || 'Unknown'}</td>
                    <td className="px-4 py-2 border">{detail.allocated_leave}</td>
                    <td className="px-4 py-2 border">{detail.used_leave}</td>
                    <td className="px-4 py-2 border">{detail.remaining_leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
