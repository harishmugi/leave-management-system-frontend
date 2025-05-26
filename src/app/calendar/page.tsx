'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { option } from 'framer-motion/client';

const localizer = momentLocalizer(moment);

interface LeaveEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  leaveType: string;
  employeeName: string;
  color: string;
  role: string;
}

const leaveColors: Record<string, string> = {
  'Casual Leave': '#3B82F6',
  'Sick Leave': '#EF4444',
  'Earned Leave': '#A78BFA',
  'Compensatory Off': '#6B7280',
  'Unpaid Leave': '#10B981',
  'Maternity/Paternity Leave': '#F59E0B'
};

export default function LeaveCalendar({ role }: { role: 'Manager' | 'HR' | 'Director' }) {
  const [events, setEvents] = useState<LeaveEvent[]>([]);
  const [allData, setAllData] = useState<LeaveEvent[]>([]);
  const [search, setSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchLeaves();
  }, [role]);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://leave-management-system-backend-g9ke.onrender.com/leaveRequests/calendar/${role}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch leave data');
      }

      const data = await res.json();

      const formatted = data.map((leave: any) => ({
        id: leave.id,
        title: `${leave.employee.fullname} (${leave.leaveType.leave_type})`,
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
        leaveType: leave.leaveType.leave_type,
        employeeName: leave.employee.fullname,
        color: leaveColors[leave.leaveType.leave_type] || '#3B82F6',
        role: leave.employee.role,
      }));

      setAllData(formatted);
      setEvents(formatted);
      setError('');
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setError('Unable to fetch leave data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = [...allData];

    if (search) {
      filtered = filtered.filter((e) =>
        e.employeeName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if ((role === 'HR' || role === 'Director') && userRole) {
      filtered = filtered.filter((e) => e.role === userRole);
    }

    if (leaveType) {
      filtered = filtered.filter((e) => e.leaveType === leaveType);
    }

    return filtered;
  }, [search, userRole, leaveType, allData, role]);

  useEffect(() => {
    setEvents(filteredEvents);
  }, [filteredEvents]);

  const handleEventClick = (event: LeaveEvent) => {
    alert(`
Employee: ${event.employeeName}
Role: ${event.role}
Leave Type: ${event.leaveType}
Start Date: ${event.start.toLocaleDateString()}
End Date: ${event.end.toLocaleDateString()}
    `);
  };

  const handleRefresh = () => {
    fetchLeaves();
    setSearch('');
    setUserRole('');
    setLeaveType('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Team Leave Calendar
            </h1>
            <p className="text-gray-400 mt-1">
              View and manage team leave requests
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-end">
            <input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search team members"
            />

            {(role === 'HR' || role === 'Director') && (
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Director">Director</option>
              </select>
            )}

            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by leave type"
            >
              <option value="">All Leave Types</option>
              <option value="Casual Leave">Casual Leave</option>

              <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Compensatory Off">Compensatory Off</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-spin">↻</span>
              ) : (
                <span>↻ Refresh</span>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Calendar */}
        <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-800 shadow-xl">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week']}
            view={currentView}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            onView={(view) => setCurrentView(view as 'month' | 'week')}
            style={{ height: '70vh' }}
            onSelectEvent={handleEventClick}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: `${event.color}20`,
                border: `2px solid ${event.color}`,
                color: event.color,
                borderRadius: '8px',
                padding: '4px 8px',
                fontWeight: 500,
                cursor: 'pointer',
              },
            })}
          />
        </div>
      </div>
    </div>
  );
}
