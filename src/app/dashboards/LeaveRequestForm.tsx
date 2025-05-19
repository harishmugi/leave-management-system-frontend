'use client';
import React, { useState, useEffect } from 'react';
import { LeaveType } from './EmployeeDashboard';

interface LeaveRequestFormData {
  leave_type_id: string;
  reason: string;
  startDate: string;
  endDate: string;
}

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  onSubmit: (data: LeaveRequestFormData) => void;
  formKey: number; // used to reset form
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ leaveTypes, onSubmit, formKey }) => {
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leave_type_id: '',
    reason: '',
    startDate: '',
    endDate: ''
  });

  // 🔁 Reset form when formKey changes
  useEffect(() => {
    setFormData({
      leave_type_id: '',
      reason: '',
      startDate: '',
      endDate: ''
    });
  }, [formKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-300"
    >
      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">Leave Type</label>
        <select
          name="leave_type_id"
          value={formData.leave_type_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select leave type</option>
          {leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.leave_type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">Reason</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-all"
      >
        Submit Request
      </button>
    </form>
  );
};

export default LeaveRequestForm;
