"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Cookies from "js-cookie";

import EmployeeDashboard from "../dashboards/EmployeeDashboard";
import HrDashboard from "../dashboards/HrDashboard";
import ManagerDashboard from "../dashboards/ManagerDashboard";
import DirectorDashboard from "../dashboards/DirectorDashboard";

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Check for role in cookie on mount
  useEffect(() => {
    const storedRole = Cookies.get("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://leave-management-system-backend-g9ke.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      const { token } = data;
      const userRole = token.role;

      // Save role in cookie
      Cookies.set("role", userRole, { expires: 1 }); // expires in 1 day

      // Set state to show dashboard
      setRole(userRole);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("role");
    setRole(null);
    setFormData({ email: "", password: "" });
  };

  const renderDashboard = () => {
    switch (role) {
      case "Employee":
        return <EmployeeDashboard />;
      case "HR":
        return <HrDashboard />;
      case "Manager":
        return <ManagerDashboard />;
      case "Director":
        return <DirectorDashboard />;
      default:
        return null;
    }
  };

  return (
    <>
      {!role ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Login</h2>

          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <label className="block text-gray-700 dark:text-gray-200">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <div className="mt-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
          {renderDashboard()}
        </div>
      )}
    </>
  );
};

export default LoginForm;
