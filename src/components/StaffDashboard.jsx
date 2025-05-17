import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        availableCars: 0,
        totalUsers: 0,
        totalBookings: 0,
        assignedBookings: 0,    // Changed from pendingBookings
        todayBookings: 0,
        totalReservations: 0,
        approvedReservations: 0,
        totalRevenue: 0,
        totalSellingApplications: 0,    // Add this
        pendingSellingApplications: 0   // Add this
    });

    useEffect(() => {
        // Fetch dashboard statistics
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost/car-dealership/api/dashboard_stats.php', {
                    credentials: 'include'
                });
                
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    if (data.success) {
                        setStats(data.data);
                    } else {
                        throw new Error(data.error || 'Failed to fetch stats');
                    }
                } catch (parseError) {
                    console.error('Raw response:', text);
                    throw new Error('Invalid JSON response from server');
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
                        <h3 className="text-lg font-semibold text-gray-700">Number of Users</h3>
                        <p className="text-3xl font-bold text-black-600">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Total Reservations</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalReservations}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Approved Reservations</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.approvedReservations}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg sh dow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                        <p className="text-3xl font-bold text-indigo-600">
                            ₱{(stats?.totalRevenue || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Assigned Bookings</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.assignedBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Today's Bookings</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.todayBookings}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/staff/manage-cars" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Car Management</h3>
                        <p className="text-gray-600">Manage car inventory and availability</p>
                    </Link>
                    <Link to="/staff/manage-bookings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Management</h3>
                        <p className="text-gray-600">View and manage bookings</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;