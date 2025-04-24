import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Collection from './components/Collection';
import Sell from './components/Sell';
import AboutUs from './components/AboutUs';
import BookVisit from './components/BookVisit';
import Location from './components/Location';
import Footer from './components/Footer';
import ReserveNow from './components/reservenow';
import Recommendation from './components/recommendation';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Profile from './components/profile';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserManagement from './components/UserManagement';
import CarManagement from './components/CarManagement';
import BookingManagement from './components/BookingManagement';
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './components/StaffDashboard';
import UserProfile from './components/UserProfile';
import UserDashboard from './components/UserDashboard';

const MainContent = () => {
    const location = useLocation();
    const isAdminOrStaff = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

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
            <main className="flex-grow">
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/book-visit" element={<BookVisit />} />
                    <Route path="/reservenow" element={<ReserveNow />} />
                    <Route path="/recommendation" element={<Recommendation />} />
                    <Route path="/RegistrationForm" element={<RegistrationForm />} />
                    <Route path="/LoginForm" element={<LoginForm />} />   
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={
                        <>
                            <Home />
                            <Collection />
                            <Sell />
                            <AboutUs />
                            <Location />
                        </>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="users" replace />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="cars" element={<CarManagement />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Staff Routes */}
                    <Route path="/staff" element={
                        <ProtectedRoute requiredRole="staff">
                            <StaffLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<StaffDashboard />} />
                        <Route path="cars" element={<CarManagement />} />
                        <Route path="bookings" element={<BookingManagement />} />
                    </Route>

                    <Route 
                        path="/profile" 
                        element={
                            <ProtectedRoute>
                                <UserProfile />
                            </ProtectedRoute>
                        } 
                    />

                    <Route path="/dashboard" element={<UserDashboard />} />
                </Routes>
            </main>
            {!isAdminOrStaff && <Footer />}
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <MainContent />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;