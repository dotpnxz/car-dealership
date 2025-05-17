import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Seller');
    const [stats, setStats] = useState({
        total_applications: 0,
        pending_applications: 0,
        approved_applications: 0,
        rejected_applications: 0
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost/car-dealership/api/get_user.php', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success && data.user && data.user.fullName) {
                    setUserName(data.user.fullName.trim() || 'Seller');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSellerStats = async () => {
            try {
                const response = await fetch('http://localhost/car-dealership/api/dashboard_stats.php', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                if (data.success) {
                    setStats({
                        total_applications: parseInt(data.data.totalApplications) || 0,
                        pending_applications: parseInt(data.data.pendingApplications) || 0,
                        approved_applications: parseInt(data.data.approvedApplications) || 0,
                        rejected_applications: parseInt(data.data.rejectedApplications) || 0
                    });
                } else {
                    console.error('Failed to fetch stats:', data.message);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats({
                    total_applications: 0,
                    pending_applications: 0,
                    approved_applications: 0,
                    rejected_applications: 0
                });
            }
        };

        fetchUserData();
        fetchSellerStats();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
                {/* Welcome Card - Mobile Optimized */}
                <div className="bg-white overflow-hidden shadow-xl rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                        Welcome back, {userName}!
                    </h1>
                    <p className="text-sm sm:text-lg text-gray-600">
                        Track your car selling applications and updates.
                    </p>
                </div>

                {/* Stats Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-base sm:text-xl font-bold text-blue-600">
                            {stats.total_applications}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Applications</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-base sm:text-xl font-bold text-yellow-600">
                            {stats.pending_applications}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-base sm:text-xl font-bold text-green-600">
                            {stats.approved_applications}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-3 sm:p-4">
                        <div className="text-base sm:text-xl font-bold text-red-600">
                            {stats.rejected_applications}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Rejected</div>
                    </div>
                </div>

                {/* Quick Actions and Updates - Mobile Optimized */}
                <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                    {/* Quick Actions Card */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg p-3 sm:p-6">
                        <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                            Quick Actions
                        </h2>
                        <ul className="space-y-2">
                            <li 
                                className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                                onClick={() => navigate('/seller/profile')}
                            >
                                <svg className="h-4 sm:h-5 w-4 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm sm:text-base">Update Profile</span>
                            </li>
                            <li 
                                className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                                onClick={() => navigate('/Sell')}
                            >
                                <svg className="h-4 sm:h-5 w-4 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-sm sm:text-base">Selling Application</span>
                            </li>
                        </ul>
                    </div>

                    {/* Updates Card */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg p-3 sm:p-6">
                        <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                            Latest Updates
                        </h2>
                        <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-4">
                            Stay informed about your applications and announcements.
                        </p>
                        <div className="flex">
                            <button 
                                onClick={() => navigate('/seller/announcements')} 
                                className="w-full bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm sm:text-base"
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

export default SellerDashboard;
