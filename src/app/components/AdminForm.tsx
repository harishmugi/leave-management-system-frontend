"use client";

import React, { useState, FormEvent } from 'react';

type UserFormData = {
  fullname: string;
  email: string;
  password: string;
  role: string;
  managerEmail?: string;
  hrEmail?: string;
  directorEmail?: string;
};

const AdminForm: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    fullname: '',
    email: '',
    password: '',
    role: '',
    managerEmail: '',
    hrEmail: '',
    directorEmail: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const now = new Date().toISOString();

    const fullPayload = {
      fullname: formData.fullname,
      email: formData.email,
      password: formData.password,
      role: capitalizeRole(formData.role),
      managerEmail: formData.managerEmail || '',
      hrEmail: formData.hrEmail || '',
      directorEmail: formData.directorEmail || '',
      created_at: now,
      updated_at: now,
    };

    console.log('Payload:', fullPayload);

    const jsonData = JSON.stringify(fullPayload);
    await hitBackend(jsonData);
  };

  function capitalizeRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  async function hitBackend(jsonData: string) {
    try {
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend error:', data);
        setMessage(`❌ Failed: ${data.message || 'Something went wrong'}`);
        return;
      }

      console.log(data);
      setMessage('✅ User registered successfully!');
    } catch (err) {
      console.error('Network or parsing error:', err);
      setMessage('❌ Network error. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Registration (Admin)</h2>

      {message && <p className="text-sm text-center font-semibold">{message}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
        <input
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        >
          <option value="">Select role</option>
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="HR">HR</option>
          <option value="Director">Director</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Manager Email (optional)</label>
        <input
          name="managerEmail"
          value={formData.managerEmail}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">HR Email (optional)</label>
        <input
          name="hrEmail"
          value={formData.hrEmail}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Director Email (optional)</label>
        <input
          name="directorEmail"
          value={formData.directorEmail}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
      >
        Submit
      </button>
    </form>
  );
};

export default AdminForm;
