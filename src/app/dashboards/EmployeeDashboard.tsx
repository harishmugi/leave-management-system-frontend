"use client";
import React, { useEffect, useState } from 'react';
import LeaveRequestForm from './LeaveRequestForm';

export interface LeaveType {
  id: string;
  leave_type: string;
}

interface LeaveRequest {
  endDate: string | number | Date;
  startDate: string | number | Date;
  id: string;
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
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveDetails, setLeaveDetails] = useState<LeaveBalance[]>([]);
  const [viewMode, setViewMode] = useState<'requests' | 'details' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveTypes');
        const data = await res.json();
        setLeaveTypes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave types:', err);
        setError('Failed to load leave types.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleLeaveRequestSubmit = async (formData: any) => {
    try {
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveRequest', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Leave request submitted!');
        fetchLeaveRequests();
        setViewMode('requests');
        setError(null);
      } else {
        alert('Submission failed.');
        setError('Failed to submit leave request.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit leave request.');
    }
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/leaveRequests', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }

      const data = await response.json();
      setLeaveRequests(data);
      setError(null);
    } catch (error) {
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

      if (!response.ok) {
        throw new Error('Failed to fetch leave balances');
      }

      const data = await response.json();
      setLeaveDetails(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      setError('Unable to load leave balances.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Welcome, Employee</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Submit your leave request below.</p>

      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}
      {loading && <p className="text-gray-500 dark:text-gray-400 mb-4">Loading...</p>}

      <LeaveRequestForm leaveTypes={leaveTypes} onSubmit={handleLeaveRequestSubmit} />

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={() => {
            fetchLeaveRequests();
            setViewMode('requests');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all"
        >
          View My Leave Requests
        </button>

        <button
          onClick={() => {
            fetchLeaveDetails();
            setViewMode('details');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-all"
        >
          View Leave Details
        </button>
      </div>

      {viewMode === 'requests' && (
        <div className="mt-8 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Leave Requests</h2>
          <table className="w-full text-sm text-left border dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 border dark:border-gray-700">Type</th>
                <th className="px-4 py-3 border dark:border-gray-700">Reason</th>
                <th className="px-4 py-3 border dark:border-gray-700">Start</th>
                <th className="px-4 py-3 border dark:border-gray-700">End</th>
                <th className="px-4 py-3 border dark:border-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2 border dark:border-gray-700">{request.leaveType?.leave_type || 'Unknown'}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{request.reason}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{new Date(request.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{new Date(request.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'details' && (
        <div className="mt-8 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Leave Balances</h2>
          <table className="w-full text-sm text-left border dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 border dark:border-gray-700">Type</th>
                <th className="px-4 py-3 border dark:border-gray-700">Allocated Leave</th>
                <th className="px-4 py-3 border dark:border-gray-700">Used Leave</th>
                <th className="px-4 py-3 border dark:border-gray-700">Remaining Leave</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {leaveDetails.map((detail) => (
                <tr key={detail.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2 border dark:border-gray-700">{detail.leaveType?.leave_type || 'Unknown'}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{detail.allocated_leave}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{detail.used_leave}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{detail.remaining_leave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
