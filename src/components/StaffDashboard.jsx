import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        availableCars: 0,
        totalBookings: 0,
        pendingBookings: 0,
        todayBookings: 0
    });

    useEffect(() => {
        // Fetch dashboard statistics
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost/car-dealership/staff_stats.php', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Staff Dashboard</h1>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Available Cars</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.availableCars}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Pending Bookings</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Today's Bookings</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.todayBookings}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/staff/cars" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Car Management</h3>
                        <p className="text-gray-600">Manage car inventory and availability</p>
                    </Link>
                    <Link to="/staff/bookings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Management</h3>
                        <p className="text-gray-600">View and manage bookings</p>
                    </Link>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h2>
                    <div className="space-y-4">
                        {/* Schedule items will be populated here */}
                        <div className="border-b pb-4">
                            <p className="text-gray-600">No bookings scheduled for today</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard; 