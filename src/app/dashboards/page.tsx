"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HrDashboard from './HrDashboard';
import DirectorDashboard from './DirectorDashboard';

const Dashboard = () => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        /*
        const res = await fetch('http://localhost:3000/me', {
          method: 'GET',
          credentials: 'include', // Required to include HttpOnly cookies
        });
        const data = await res.json();
        console.log("User data:", data);

        // Extract role from response
        setRole(data.user?.role || null);
        setToken("fetched-from-cookie-or-token"); // Optional
        */
      } catch (error) {
        console.error('Error fetching user data:', error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, []);

  // Redirect to login if no token and not loading
  useEffect(() => {
    if (!loading && !token) {
      router.push('/');
    }
  }, [loading, token, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {role === "Employee" && <EmployeeDashboard />}
      {role === "Manager" && <ManagerDashboard />}
      {role === "HR" && <HrDashboard />}
      {role === "Director" && <DirectorDashboard />}
    </div>
  );
};

export default Dashboard;
