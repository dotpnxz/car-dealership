import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const StaffLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Dynamic API base URL for dev/prod
    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get_notifications.php`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setNotificationCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const isActive = (path) => {
        return location.pathname.startsWith(path) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAnnouncementClick = async () => {
        try {
            await fetch(`${API_BASE_URL}/mark_notifications_read.php`, {
                credentials: 'include'
            });
            setNotificationCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-0 left-0 m-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
                <div className="flex items-center justify-center h-16 bg-gray-900">
                    <span className="text-white text-xl font-semibold">Staff Panel</span>
                </div>
                <nav className="mt-5 px-2 flex-1">
                    <Link
                        to="/staff"
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/staff')}`}
                    >
                        <svg className="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link
                        to="/staff/announcements"
                        onClick={handleAnnouncementClick}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/staff/announcements')}`}
                    >
                        <div className="relative">
                            <svg className="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notificationCount > 0 && (
                                <span className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                        Announcements
                    </Link>
                </nav>
                {/* Logout Button */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-0 w-full">
                {/* Top Navigation */}
                <div className="bg-white shadow">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                            {location.pathname === '/staff' && 'Dashboard'}
                            {location.pathname === '/staff/announcements' && 'Announcements'}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="text-sm sm:text-base text-gray-600 hover:text-gray-900">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default StaffLayout;