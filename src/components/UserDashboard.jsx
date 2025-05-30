import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('User');
    const [stats, setStats] = useState({
        total_bookings: 0,
        total_reservations: 0,
        pending_bookings: 0,
        approved_reservations: 0,
        today_bookings: 0
    });

    // Dynamic API base URL for dev/prod
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost/car-dealership/api'
      : 'https://mjautolove.site/api';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get_user.php`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success && data.user && data.user.fullName) {
                    setUserName(data.user.fullName.trim() || 'User');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard_stats.php`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setStats({
                        total_bookings: data.data.totalBookings || 0,
                        total_reservations: data.data.totalReservations || 0,
                        pending_bookings: data.data.pendingBookings || 0,
                        approved_reservations: data.data.approvedReservations || 0,
                        today_bookings: data.data.todayBookings || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchUserData();
        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="bg-white overflow-hidden shadow-xl rounded-lg p-4 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {userName}!
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600">
                        We're glad to see you again. Stay updated with our latest announcements and manage your activities from here.
                    </p>
                </div>

                {/* Stats Grid - Mobile optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.total_bookings}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Test Drives</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-xl font-bold text-green-600">{stats.total_reservations}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Reservations</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-xl font-bold text-yellow-600">{stats.pending_bookings}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Pending Test Drives</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.approved_reservations}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Approved Reservations</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-lg sm:text-xl font-bold text-indigo-600">{stats.today_bookings}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Today's Test Drives</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Quick Actions</h2>
                        <ul className="space-y-2 sm:space-y-3">
                            <li 
                                className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                                onClick={() => navigate('/Collection')}
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-sm sm:text-base">Browse Available Cars</span>
                            </li>
                            <li 
                                className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                                onClick={() => navigate('/user/profile')}
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm sm:text-base">Update Profile</span>
                            </li>
                            <li 
                                className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                                onClick={() => navigate('/user/mybookings')}
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm sm:text-base">View Test Drive Schedule</span>
                            </li>
                            <li 
                                className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                                onClick={() => navigate('/user/myreservations')}
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="text-sm sm:text-base">View Reservations</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white overflow-hidden shadow-lg rounded-lg p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Latest Updates</h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Stay informed about our newest car listings and special offers.
                        </p>
                        <div className="flex">
                            <button 
                                onClick={() => navigate('/user/announcements')} 
                                className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm sm:text-base"
                            >
                                View Announcements
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;