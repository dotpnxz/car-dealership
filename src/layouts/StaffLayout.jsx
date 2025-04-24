import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const StaffLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const isActive = (path) => {
        return location.pathname.startsWith(path) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 flex flex-col">
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
                        to="/staff/cars"
                        className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/staff/cars')}`}
                    >
                        <svg className="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Car Management
                    </Link>
                    <Link
                        to="/staff/bookings"
                        className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/staff/bookings')}`}
                    >
                        <svg className="mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Booking Management
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
            <div className="pl-64">
                {/* Top Navigation */}
                <div className="bg-white shadow">
                    <div className="px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            {location.pathname === '/staff' && 'Dashboard'}
                            {location.pathname === '/staff/cars' && 'Car Management'}
                            {location.pathname === '/staff/bookings' && 'Booking Management'}
                        </h1>
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout; 