import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        availableCars: 0,
        totalUsers: 0,
        totalBookings: 0,
        assignedBookings: 0,
        todayBookings: 0,
        totalReservations: 0,
        approvedReservations: 0,
        totalRevenue: 0,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dynamic API base URL for dev/prod
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost/car-dealership/api'
      : 'https://mjautolove.site/api';

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard_stats.php`, {
                    credentials: 'include'
                });
                const text = await response.text();
                // Debug: log the raw response
                console.log('Raw API response:', text);
                try {
                    const data = JSON.parse(text);
                    // Debug: log the parsed data
                    console.log('Parsed dashboard stats:', data);
                    if (data.success && data.data) {
                        setStats(data.data);
                        setError(null);
                    } else {
                        setError(data.error || 'Failed to fetch stats');
                    }
                } catch (parseError) {
                    console.error('Raw response (parse error):', text);
                    setError('Invalid JSON response from server: ' + text);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setError('Error fetching dashboard stats');
            }
            setLoading(false);
        };

        fetchStats();
    }, [API_BASE_URL]);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Staff Dashboard</h1>
                {loading && (
                    <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
                        Loading dashboard stats...
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {/* If all stats are zero and not loading, show a hint */}
                {!loading && !error && Object.values(stats).every(v => v === 0) && (
                    <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                        All counters are zero. This may indicate a backend/API issue or insufficient staff permissions.<br />
                        Please check the API response in your browser console and verify your backend logic for staff users.
                    </div>
                )}
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
                    <div className="bg-white p-6 rounded-lg shadow-md">
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