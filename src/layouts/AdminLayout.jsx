import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    // Refined path matching for active links
    const isActive = (path) => {
        return location.pathname.startsWith(path) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    // Handle logout and redirect to home page
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-blue-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 flex flex-col">
                <div className="flex items-center justify-center h-16 bg-gray-900">
                    <span className="text-white text-xl font-semibold">Admin Panel</span>
                </div>
                <nav className="mt-5 px-2 flex-1">
                    <Link to="/admin/users" className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/users')}`}>
                        User Management
                    </Link>
                    <Link to="/admin/cars" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/cars')}`}>
                        Car Management
                    </Link>
                    <Link to="/admin/bookings" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/bookings')}`}>
                        Booking Management
                    </Link>
                    <Link to="/admin/reserved-cars" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/reserved-cars')}`}>
                        Reserved Cars
                    </Link>
                    <Link to="/admin/reservations" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/reservations')}`}>
                        Reservation List
                    </Link>
                    <Link to="/admin/profile" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/profile')}`}>
                        My Profile
                    </Link>
                </nav>
                {/* Logout Button */}
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
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
                            {/* Dynamically display page titles */}
                            {location.pathname === '/admin/users' && 'User Management'}
                            {location.pathname === '/admin/cars' && 'Car Management'}
                            {location.pathname === '/admin/bookings' && 'Booking Management'}
                            {location.pathname === '/admin/reserved-cars' && 'Reserved Cars Management'}
                            {location.pathname === '/admin/reservations' && 'Reservation List Management'}
                            {location.pathname === '/admin/profile' && 'My Profile'}
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

export default AdminLayout;
