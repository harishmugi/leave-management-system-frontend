"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogIn, FiLogOut, FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Cookies from "js-cookie";

// Import your dashboards
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
  const [notification, setNotification] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = Cookies.get("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification.text) {
      const timer = setTimeout(() => setNotification({ text: "", type: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNotification({ text: "", type: "" });
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login",
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
        setNotification({ text: data?.error || "Login failed", type: "error" });
        return;
      }

      const { token, role: userRole } = data;

      if (!userRole) {
        setNotification({ text: "Invalid response: role not found", type: "error" });
        return;
      }

      Cookies.set("role", userRole, { expires: 1 });
      setRole(userRole);
      setNotification({ text: "Login successful!", type: "success" });
    } catch (err) {
      setNotification({ 
        text: "Something went wrong. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("role");
    setRole(null);
    setFormData({ email: "", password: "" });
    setNotification({ text: "Logged out successfully", type: "success" });
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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

      {!role ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to your account
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn />
                  Sign In
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Don't have an account?{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contact HR
                </a>
              </p>
            </div>
          </motion.form>
        </motion.div>
      ) : (
        <div className="w-full max-w-7xl">
          <div className="flex justify-end mb-6">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
            >
              <FiLogOut />
              Logout
            </motion.button>
          </div>
          {renderDashboard()}
        </div>
      )}
    </div>
  );
};

export default LoginForm;