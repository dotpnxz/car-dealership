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
        pendingReservations: 0,
        totalRevenue: 0,
    });
    const [restoreMessage, setRestoreMessage] = useState(null);

    // Determine API base URL based on environment
    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';

    useEffect(() => {
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

    const handleBackup = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/backup_database.php`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Backup failed');
            }

            // Get the filename from the Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : 'backup.sql';

            // Create a blob from the response
            const blob = await response.blob();
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error creating backup:', error);
            alert('Failed to create backup. Please try again.');
        }
    };

    const handleRestore = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('sqlfile', file);

        try {
            const response = await fetch(`${API_BASE_URL}/restore_database.php`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                setRestoreMessage({ type: 'success', text: data.message });
            } else {
                setRestoreMessage({ type: 'error', text: data.error || 'Restore failed' });
            }
        } catch (error) {
            console.error('Error restoring database:', error);
            setRestoreMessage({ type: 'error', text: 'Failed to restore database. Please try again.' });
        }

        // Clear the file input
        event.target.value = '';
    };

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
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Test Drives</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Pending Test Drives</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Today's Test Drives</h3>
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
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Test Drive Schedule</h3>
                        <p className="text-sm sm:text-base text-gray-600">View and manage test drive schedules</p>
                    </Link>
                    <button 
                        onClick={handleBackup}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow active:bg-gray-50 text-left"
                    >
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Database Backup</h3>
                        <p className="text-sm sm:text-base text-gray-600">Create a backup of the entire database</p>
                    </button>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow active:bg-gray-50">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Database Restore</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">Restore database from a backup file</p>
                        <input
                            type="file"
                            accept=".sql"
                            onChange={handleRestore}
                            className="hidden"
                            id="restore-file"
                        />
                        <label
                            htmlFor="restore-file"
                            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                        >
                            Choose File
                        </label>
                        {restoreMessage && (
                            <div className={`mt-2 p-2 rounded ${
                                restoreMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {restoreMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;