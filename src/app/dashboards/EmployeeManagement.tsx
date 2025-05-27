"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiUser, FiEdit, FiSave, FiTrash2, FiPlus, FiLoader, FiX, FiRefreshCw } from "react-icons/fi";
import AdminForm from '../components/AdminForm';

// Interfaces
interface Employee {
    role: string;
    id: string;
    fullname: string;
    email: string;
    joinDate: string;
    soft_delete?: boolean;
}

interface Notification {
    text: string;
    type: "success" | "error" | "info" | "";
}

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<Notification>({ text: "", type: "" });
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);

    // Predefined roles for selection
    const roles = [
        "Employee",
        "Manager",
        "HR",
        "Director"
    ];

    // Clear notification after 5 seconds
    useEffect(() => {
        if (notification.text) {
            const timer = setTimeout(() => setNotification({ text: "", type: "" }), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Fetch active employees
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://leave-management-system-backend-g9ke.onrender.com/employees", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch employees: ${response.statusText}`);
            }

            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch employees";
            setError(errorMessage);
            setNotification({ text: errorMessage, type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch deleted employees
    const fetchDeletedEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://leave-management-system-backend-g9ke.onrender.com/employee/restore", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch deleted employees: ${response.statusText}`);
            }

            const data = await response.json();
            
            setDeletedEmployees(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch deleted employees";
            setError(errorMessage);
            setNotification({ text: errorMessage, type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    // Create or update employee
    const saveEmployee = useCallback(async (employeeData: Employee) => {
        setLoading(true);
        setError(null);
        try {
            const isNewEmployee = !employeeData.id;
            const url = isNewEmployee
                ? "https://leave-management-system-backend-g9ke.onrender.com/employees"
                : `https://leave-management-system-backend-g9ke.onrender.com/employees/${employeeData.id}`;

            const method = isNewEmployee ? "POST" : "PUT";

            const payload = {
                id: employeeData.id,
                fullname: employeeData.fullname,
                email: employeeData.email,
                role: employeeData.role,
                joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0],
                soft_delete: false,
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isNewEmployee ? 'create' : 'update'} employee: ${response.statusText}`);
            }

            const data = await response.json();
            setNotification({
                text: `Employee ${isNewEmployee ? 'created' : 'updated'} successfully`,
                type: "success",
            });

            await fetchEmployees();
            setIsEditing(false);
            setEditingEmployee(null);
            setShowAdminForm(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save employee";
            setError(errorMessage);
            setNotification({ text: errorMessage, type: "error" });
        } finally {
            setLoading(false);
        }
    }, [fetchEmployees]);

    // Soft delete employee
    const deleteEmployee = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/employee/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ soft_delete: true }),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete employee: ${response.statusText}`);
            }

            setNotification({ text: "Employee deleted successfully", type: "success" });
            await fetchEmployees();
            await fetchDeletedEmployees();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete employee";
            setError(errorMessage);
            setNotification({ text: errorMessage, type: "error" });
        } finally {
            setLoading(false);
        }
    }, [fetchEmployees, fetchDeletedEmployees]);

    // Restore employee
    const restoreEmployee = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to restore this employee?")) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/employee/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ soft_delete: false }),
            });

            if (!response.ok) {
                throw new Error(`Failed to restore employee: ${response.statusText}`);
            }

            setNotification({ text: "Employee restored successfully", type: "success" });
            await fetchEmployees();
            await fetchDeletedEmployees();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to restore employee";
            setError(errorMessage);
            setNotification({ text: errorMessage, type: "error" });
        } finally {
            setLoading(false);
        }
    }, [fetchEmployees, fetchDeletedEmployees]);

    // Load employees on mount
    useEffect(() => {
        fetchEmployees();
        fetchDeletedEmployees();
    }, [fetchEmployees, fetchDeletedEmployees]);

    // Render employee edit form with validation
    const renderEmployeeEditForm = () => {
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            if (!editingEmployee) return;

            const { name, value } = e.target;
            setEditingEmployee({
                ...editingEmployee,
                [name]: value
            });
        };

        return (
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-medium mb-4 dark:text-white">
                    {editingEmployee?.id ? "Edit Employee" : "Add New Employee"}
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingEmployee) {
                        saveEmployee(editingEmployee);
                    }
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullname"
                                value={editingEmployee?.fullname || ""}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                required
                                minLength={2}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={editingEmployee?.email || ""}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role *
                            </label>
                            <select
                                name="role"
                                value={editingEmployee?.role || ""}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                required
                            >
                                <option value="" disabled>Select a role</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setEditingEmployee(null);
                                setError(null);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                            disabled={loading}
                        >
                            <FiX /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
                            {loading ? "Saving..." : "Save Employee"}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Render active employee management table
    const renderEmployeeTable = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setShowAdminForm(!showAdminForm);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                        <FiPlus /> {showAdminForm ? "Close Form" : "Add Employee"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleted(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                    >
                        View Deleted Employees
                    </motion.button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-gray-700 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                                    {employee.fullname}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {employee.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {employee.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setEditingEmployee(employee);
                                                setIsEditing(true);
                                                setError(null);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                        >
                                            <FiEdit size={14} /> Edit
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => deleteEmployee(employee.id)}
                                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                        >
                                            <FiTrash2 size={14} /> Delete
                                        </motion.button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render deleted employee management table
    const renderDeletedEmployeeTable = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search deleted employees..."
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleted(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                >
                    Back to Active Employees
                </motion.button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-gray-700 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {deletedEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                                    {employee.fullname}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {employee.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {employee.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => restoreEmployee(employee.id)}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                                        >
                                            <FiRefreshCw size={14} /> Restore
                                        </motion.button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiUser />
                    {showDeleted ? "Deleted Employees" : "Employee Management"}
                </h2>
            </div>

            {showDeleted ? (
                loading && deletedEmployees.length === 0 ? (
                    <div className="flex justify-center items-center h-32">
                       

 <FiLoader className="animate-spin text-4xl text-blue-500" />
                    </div>
                ) : error && deletedEmployees.length === 0 ? (
                    <div className="p-8 text-center text-red-500 dark:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        {error}
                    </div>
                ) : deletedEmployees.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        No deleted employees found.
                    </div>
                ) : (
                    renderDeletedEmployeeTable()
                )
            ) : (
                <>
                    {showAdminForm ? (
                        <AdminForm />
                    ) : isEditing ? (
                        renderEmployeeEditForm()
                    ) : null}

                    {loading && employees.length === 0 ? (
                        <div className="flex justify-center items-center h-32">
                            <FiLoader className="animate-spin text-4xl text-blue-500" />
                        </div>
                    ) : error && employees.length === 0 ? (
                        <div className="p-8 text-center text-red-500 dark:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            {error}
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            No employees found.
                        </div>
                    ) : (
                        renderEmployeeTable()
                    )}
                </>
            )}
        </div>
    );
};

export default EmployeeManagement;