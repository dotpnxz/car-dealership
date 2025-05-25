import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        availableCars: 0,
        totalUsers: 0,
        totalBookings: 0,
        pendingBookings: 0,
        todayBookings: 0,
        totalReservations: 0,
        approvedReservations: 0,
        pendingReservations: 0,  // Add this line
        totalRevenue: 0,
    });

    useEffect(() => {
        // Determine API base URL based on environment
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://localhost/car-dealership/api'
            : 'https://mjautolove.site/api';

        // Fetch dashboard statistics
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard_stats.php`, {
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
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Admin Dashboard</h1>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Available Cars</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.availableCars}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Number of Users</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-black-600">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Reservations</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalReservations}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Approved Reservations</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.approvedReservations}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Revenue</h3>
                         <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                            ₱{(stats?.totalRevenue || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Bookings</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Pending Bookings</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Today's Bookings</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.todayBookings}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Pending Reservations</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingReservations}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
                    <Link 
                        to="/admin/cars" 
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow active:bg-gray-50"
                    >
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Car Management</h3>
                        <p className="text-sm sm:text-base text-gray-600">Manage car inventory and availability</p>
                    </Link>
                    <Link 
                        to="/admin/bookings" 
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow active:bg-gray-50"
                    >
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Booking Management</h3>
                        <p className="text-sm sm:text-base text-gray-600">View and manage bookings</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;