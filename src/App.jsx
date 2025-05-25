import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Collection from './components/Collection';
import AboutUs from './components/AboutUs';
import BookVisit from './components/BookVisit';
import Location from './components/Location';
import Footer from './components/Footer';
import ReserveNow from './components/reservenow';
import PaymentHistory from './components/PaymentHistory';

import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Profile from './components/profile';
import { AuthProvider, AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserManagement from './components/UserManagement';
import CarManagement from './components/CarManagement';
import BookingManagement from './components/BookingManagement';
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './components/StaffDashboard';
import UserDashboard from './components/UserDashboard';
import ReservationList from './components/ReservationList';
import NavSidebar from './components/NavSidebar';
import MyBookings from './components/MyBookings';
import MyReservations from './components/MyReservations';
import AdminDashboard from './components/AdminDashboard';
import Announcements from './components/Announcements'; // Import Announcements
import UserLayout from './layouts/UserLayout';
import Guide from './components/Guide';
import ResetPassword from './components/ResetPassword';
import LoanRequirements from './components/LoanRequirements';
import AvailProcess from './components/AvailProcess';
import PaymentManagement from './components/PaymentManagement';

const MainContent = () => {
    const location = useLocation();
    const { user, isLoggedIn, handleLogout } = React.useContext(AuthContext);
    const isAdminOrStaff = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/staff') ||
                          location.pathname.startsWith('/buyer');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    React.useEffect(() => {
        const section = location.pathname.slice(1) || 'home';
        const element = document.getElementById(section);
        if (element) {
            const navbarHeight = 128; // 8rem = 128px
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, [location]);

    return (
        <>
            {!isAdminOrStaff && <Navbar />}
            <div className="relative min-h-screen bg-gray-100">
                <NavSidebar 
                    isLoggedIn={isLoggedIn} 
                    accountType={user?.accountType || 'buyer'} 
                    onLogout={handleLogout} 
                    isCollapsed={sidebarCollapsed}
                    setIsCollapsed={setSidebarCollapsed}
                />
                <div className={`transition-all duration-300 ${isLoggedIn ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/home" element={<Home />} />
                            <Route path="/book-visit" element={<BookVisit />} />
                            <Route path="/reservenow/:id?" element={<ReserveNow />} />
                            <Route path="/RegistrationForm" element={<RegistrationForm />} />
                            <Route path="/LoginForm" element={<LoginForm />} />  
                            <Route path="/Collection" element={ <Collection />} />  
                           
                         
                            <Route path="*" element={
                                <>
                                    <Home />
                                    <AboutUs />
                                    <Location />
                                    <Guide />
                                </> 
                            } />
                            
                            {/* Admin Routes */}
                            <Route path="/admin" element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminLayout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<AdminDashboard />} />
                                <Route path="announcements" element={<Announcements />} /> {/* Add Announcements route */}
                            </Route>

                            {/* Independent Admin Routes */}
                            <Route path="/admin/users" element={
                                <ProtectedRoute requiredRole="admin">
                                    <UserManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/cars" element={
                                <ProtectedRoute requiredRole="admin">
                                    <CarManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/bookings" element={
                                <ProtectedRoute requiredRole="admin">
                                    <BookingManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/reservations" element={
                                <ProtectedRoute requiredRole="admin">
                                    <ReservationList />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/payment-management" element={
                                <ProtectedRoute requiredRole="admin">
                                    <PaymentManagement />
                                </ProtectedRoute>
                            } />

                            {/* Staff Routes */}
                            <Route path="/staff" element={
                                <ProtectedRoute requiredRole="staff">
                                    <StaffLayout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<StaffDashboard />} />
                                <Route path="announcements" element={<Announcements />} />
                            </Route>

                             {/* Independent Staff Routes */}
                              <Route path="staff/manage-profile" element={
                                <ProtectedRoute requiredRole="staff">
                                    <Profile />
                                </ProtectedRoute>
                            } />
                             <Route path="/staff/manage-cars" element={
                                <ProtectedRoute requiredRole="staff">
                                    <CarManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="/staff/manage-bookings" element={
                                <ProtectedRoute requiredRole="staff">
                                    <BookingManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="/staff/manage-reservations" element={
                                <ProtectedRoute requiredRole="staff">
                                    <ReservationList />
                                </ProtectedRoute>
                            } />
                            <Route path="/staff/payment-management" element={
                                <ProtectedRoute requiredRole="staff">
                                    <PaymentManagement />
                                </ProtectedRoute>
                            } />

                             {/* Buyer Routes */}
                            <Route path="/buyer" element={
                                <ProtectedRoute requiredRole="buyer">
                                    <UserLayout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<UserDashboard />} />
                                <Route path="announcements" element={<Announcements />} />
                            </Route>

                            {/* User specific routes */}
                            <Route path="/buyer/profile" element={
                                <ProtectedRoute requiredRole="buyer">
                                    <Profile />
                                </ProtectedRoute>
                            } />
                            <Route path="/buyer/mybookings" element={
                                <ProtectedRoute requiredRole="buyer">
                                    <MyBookings />
                                </ProtectedRoute>
                            } />
                            <Route path="/buyer/myreservations" element={
                                <ProtectedRoute requiredRole="buyer">
                                    <MyReservations />
                                </ProtectedRoute>
                            } />
                            <Route path="/buyer/payment-history" element={
                                <ProtectedRoute requiredRole="buyer">
                                    <PaymentHistory />
                                </ProtectedRoute>
                            } />

                            {/* Auth Routes */}
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegistrationForm />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/loan-requirements" element={<LoanRequirements />} />
                            <Route path="/avail-process" element={<AvailProcess />} />
                        </Routes>
                    </main>
                </div>
            </div>
            {!isAdminOrStaff && <Footer />}
        </>
    );      
};      

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen flex flex-col">
                    <div className="flex-grow">
                        <MainContent />
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;