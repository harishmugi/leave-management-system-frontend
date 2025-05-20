"use client";

import { useState } from 'react';

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

type LeaveRequest = {
  id: string;
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

const DirectorDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/leaveRequests/approver`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch leave requests');

      const data: LeaveRequest[] = await response.json();
      setLeaveRequests(data);
      setShowTable(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Fetch error:', err.message);
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectorApproval = async (id: string, decision: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/leaveRequest/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'Director',
          approved: decision === 'Approved',
        }),credentials:'include'
      });

      if (!response.ok) throw new Error('Failed to update leave request');
      await fetchLeaveRequests(); // Refresh list
    } catch (err) {
      console.error('Approval error:', err);
      alert('❌ Failed to update leave request');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-md shadow transition-colors">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Welcome, Director</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Click below to view employee leave requests.</p>

      <button
        onClick={fetchLeaveRequests}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded transition-all disabled:bg-blue-300 mb-6"
        disabled={loading}
      >
        🔔 View Leave Requests
      </button>

      {loading && <p className="text-gray-600 dark:text-gray-400">Loading leave requests...</p>}
      {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}

      {showTable && !loading && leaveRequests.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No leave requests found.</p>
      )}

      {showTable && !loading && leaveRequests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 border">Employee</th>
                <th className="px-4 py-2 border">Start Date</th>
                <th className="px-4 py-2 border">End Date</th>
                <th className="px-4 py-2 border">Manager Approval</th>
                <th className="px-4 py-2 border">HR Approval</th>
                <th className="px-4 py-2 border">Director Approval</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id} className="border-t dark:border-gray-700 text-center">
                  <td className="px-4 py-2 border">{request.employee?.fullname || 'Unknown'}</td>
                  <td className="px-4 py-2 border">{new Date(request.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{new Date(request.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{request.manager_approval}</td>
                  <td className="px-4 py-2 border">{request.HR_approval}</td>
                  <td className="px-4 py-2 border">{request.director_approval}</td>
                  <td className="px-4 py-2 border space-x-2">
                    {request.director_approval === 'Pending' && request.HR_approval === 'Approved' ? (
                      <>
                        <button
                          onClick={() => handleDirectorApproval(request.id, 'Approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDirectorApproval(request.id, 'Rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-sm italic text-gray-500 dark:text-gray-400">
                        Already {request.director_approval}
                      </span>
                    )}
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

export default DirectorDashboard;
