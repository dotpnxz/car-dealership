import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const AdminLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

            {/* Sidebar with mobile responsiveness */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
                <div className="flex items-center justify-center h-16 bg-gray-900">
                    <span className="text-white text-xl font-semibold">Admin Panel</span>
                </div>
                <nav className="mt-5 px-2 flex-1">
                    <Link to="/admin" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin')}`}>
                        Dashboard
                    </Link>
                    <Link to="/admin/announcements" className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive('/admin/announcements')}`}>
                        Announcements
                    </Link>
                    {/* ...existing links... */}
                </nav>
                {/* Logout Button */}
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
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
                            {location.pathname === '/admin' && 'Admin Dashboard'}
                            {location.pathname === '/admin/announcements' && 'Announcements'}
                            {/* ...existing titles... */}
                        </h1>
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="text-sm sm:text-base text-gray-600 hover:text-gray-900"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-3 sm:p-4">
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

export default AdminLayout;
