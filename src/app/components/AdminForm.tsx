"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiUserPlus, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

type UserFormData = {
  fullname: string;
  email: string;
  password: string;
  role: string;
  managerEmail?: string;
};

const AdminForm: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    fullname: '',
    email: '',
    password: '',
    role: '',
    managerEmail: '',
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-dismiss messages after 5s
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (uploadMessage.text) {
      const timer = setTimeout(() => setUploadMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    const now = new Date().toISOString();
    const fullPayload = {
      ...formData,
      role: capitalizeRole(formData.role),
      managerEmail: formData.managerEmail || '',
      created_at: now,
      updated_at: now,
    };

    try {
      const response = await fetch('https://leave-management-system-backend-g9ke.onrender.com/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: `Failed: ${data.error || 'Something went wrong'}`, type: 'error' });
      } else {
        setMessage({ text: 'User created successfully!', type: 'success' });
        setFormData({
          fullname: '',
          email: '',
          password: '',
          role: '',
          managerEmail: '',
        });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setUploadFile(e.target.files[0]);
  };

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadMessage({ text: '', type: '' });

    if (!uploadFile) {
      setUploadMessage({ text: 'Please select an Excel (.xlsx) file first.', type: 'error' });
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await fetch('https://leave-management-system-backend-g9ke.onrender.com/employees/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadMessage({ 
          text: `Upload successful! Added ${data.employees?.length || 0} employees.`, 
          type: 'success' 
        });
        setUploadFile(null);
      } else {
        setUploadMessage({ text: `Upload failed: ${data.error || 'Unknown error'}`, type: 'error' });
      }
    } catch (err) {
      setUploadMessage({ text: 'Network or server error occurred.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  function capitalizeRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-white dark:bg-gray-800 rounded-xl shadow-lg space-y-8 transition-colors duration-300">
      {/* User Registration Form */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FiUserPlus className="text-blue-500" />
          User Registration (Admin)
        </h2>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-md flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <FiCheckCircle className="text-lg" />
              ) : (
                <FiAlertCircle className="text-lg" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Full Name</span>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Role</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Select role</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR</option>
              <option value="Director">Director</option>
            </select>
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Manager Email (optional)</span>
            <input
              type="email"
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            /></label></div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-all ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <>
              <FiLoader className="animate-spin" />
              Processing...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </motion.form>

      {/* Bulk Upload Form */}
      <motion.form
        onSubmit={onUpload}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FiUpload className="text-green-500" />
          Bulk Upload Employees via Excel
        </h2>

        <AnimatePresence>
          {uploadMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-md flex items-center gap-2 ${
                uploadMessage.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>{uploadMessage.type === 'success' ? (
                <FiCheckCircle className="text-lg" />) : (
                <FiAlertCircle className="text-lg" />
)}
              <span>{uploadMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 transition-colors">
          <input
            type="file"
            id="file-upload"
            accept=".xlsx"
            onChange={onFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-center"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <FiUpload className="text-3xl text-gray-500 dark:text-gray-400" />
              <p className="text-gray-700 dark:text-gray-300">
                {uploadFile 
                  ? `Selected: ${uploadFile.name}` 
                  : 'Drag & drop your Excel file here, or click to browse'}
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (Only .xlsx files accepted)
              </span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={!uploadFile || isUploading}
          className={`w-full py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-all ${
            !uploadFile || isUploading
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:scale-95'
          }`}
        >
          {isUploading ? (
            <>
              <FiLoader className="animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Excel'
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default AdminForm;