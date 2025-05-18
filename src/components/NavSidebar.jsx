import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Menu, X, Home, Car, BookOpen, UserCircle, LogOut, 
         Settings, Users, ClipboardList, ShoppingCart, Calendar, CreditCard } from 'lucide-react';

const NavSidebar = ({ isLoggedIn, accountType: propAccountType, isCollapsed, setIsCollapsed }) => {
  const [verifiedAccountType, setVerifiedAccountType] = useState(propAccountType);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login on error to ensure user can log in again
      navigate('/login');
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('http://localhost/car-dealership/api/login.php', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setVerifiedAccountType(data.user.accountType);
          }
        }
      } catch (error) {
        console.error('Session verification error:', error);
      }
    };

    if (isLoggedIn) {
      verifySession();
    }
  }, [isLoggedIn]);

  // Hide sidebar on admin & staff routes
  if (!isLoggedIn || location.pathname === ('/admin')) return null;
    if (!isLoggedIn || location.pathname === ('/admin/announcements')) return null;
  if (!isLoggedIn || location.pathname === ('/staff')) return null;
  if (!isLoggedIn || location.pathname === ('/staff/announcements')) return null;
  if (!isLoggedIn || location.pathname === ('/buyer')) return null;
  if (!isLoggedIn || location.pathname === ('/buyer/announcements')) return null;
  if (!isLoggedIn || location.pathname === ('/seller')) return null;
  if (!isLoggedIn || location.pathname === ('/seller/announcements')) return null;

  const getMenuItems = () => {
    const commonItems = [
      { to: '/', icon: <Home size={20} />, label: 'Home' },
    ];

    const roleSpecificItems = {
      admin: [
        { to: '/admin/users', icon: <Users size={20} />, label: 'User Management' },
        { to: '/admin/cars', icon: <Car size={20} />, label: 'Car Management' },
        { to: '/admin/seller-applications', icon: <ClipboardList size={20} />, label: 'Seller Management' },
        { to: '/admin/bookings', icon: <Calendar size={20} />, label: 'Booking Management' },
        { to: '/admin/reservations', icon: <ClipboardList size={20} />, label: 'Reservation Management' },
        { to: '/admin/payment-management', icon: <CreditCard size={20} />, label: 'Payment Management' },
      ],
      staff: [
        { to: '/staff/manage-profile', icon: <UserCircle size={20} />, label: 'Staff Profile' },
        { to: '/staff/manage-cars', icon: <Car size={20} />, label: 'Manage Cars' },
        { to: '/staff/seller-applications', icon: <ClipboardList size={20} />, label: 'Seller Management' },
        { to: '/staff/manage-bookings', icon: <Calendar size={20} />, label: 'Manage Bookings' },
        { to: '/staff/manage-reservations', icon: <ClipboardList size={20} />, label: 'Reservation Management' },
        { to: '/staff/payment-management', icon: <CreditCard size={20} />, label: 'Payment Management' },
      ],
      buyer: [
        { to: '/buyer/profile', icon: <UserCircle size={20} />, label: 'Profile' },
        { to: '/buyer/mybookings', icon: <Calendar size={20} />, label: 'My Bookings' },
        { to: '/buyer/myreservations', icon: <ClipboardList size={20} />, label: 'My Reservations' },
        { to: '/buyer/payment-history', icon: <CreditCard size={20} />, label: 'Payment History' },
      ],
      seller: [
        { to: '/seller/profile', icon: <UserCircle size={20} />, label: 'Profile' },
        { to: '/seller/mycars', icon: <Car size={20} />, label: 'My Cars' },
        
      
      ]
    };

    // Use verifiedAccountType instead of propAccountType
    return [...commonItems, ...(roleSpecificItems[verifiedAccountType] || roleSpecificItems['buyer'])];
  };

  return (
    <div className={`fixed left-0 ${
      ['/', '/sell', '/book-visit', '/avail-process', '/collection', '/about', '/location','/loan-requirements','/reservenow'].includes(location.pathname) 
      ? 'top-32 h-[calc(100vh-8rem)]' 
      : 'top-0 h-screen'
    } 
      bg-white shadow-lg transition-all duration-300 z-50 
      ${isCollapsed ? 'w-12 sm:w-16' : 'w-48 sm:w-64'}`}>
      
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 bg-white rounded-full p-1 sm:p-1.5 shadow-lg hover:bg-gray-100 z-50"
      >
        {isCollapsed ? <Menu size={16} className="sm:w-5 sm:h-5" /> : <X size={16} className="sm:w-5 sm:h-5" />}
      </button>

      <div className="flex flex-col h-full p-2 sm:p-4">
        <nav className="flex-1">
          {getMenuItems().map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="flex items-center p-2 sm:p-3 mb-1 sm:mb-2 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-red-600"
            >
              <span className="w-5 h-5 sm:w-auto sm:h-auto">{item.icon}</span>
              {!isCollapsed && 
                <span className="ml-3 text-sm sm:text-base whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              }
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg mt-auto"
        >
          <LogOut size={16} className="sm:w-5 sm:h-5" />
          {!isCollapsed && <span className="ml-3 text-sm sm:text-base">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default NavSidebar;
