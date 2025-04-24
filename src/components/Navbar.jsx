import React, { useContext } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import mjLogo from "../assets/mj-logo.jpg";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const Navbar = () => {
    const { isLoggedIn, accountType, logout, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 128; // 8rem = 128px
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Show loading state
    if (isLoading) {
        return (
            <nav className="sticky top-0 bg-[#800000] text-white w-full z-50">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center h-[8rem]">
                    <div className="flex items-center space-x-2">
                        <img src={mjLogo} alt="MJ Logo" className="h-20 w-20 rounded-full" />
                        <div>
                            <h1 className="text-3xl font-bold">
                                <span className="text-yellow-500">MJ</span>-
                                <span className="text-white">AUTO</span>
                                <span className="text-yellow-500">LOVE</span>
                            </h1>
                            <p className="tex-3xl">VEHICLE TRADING</p>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 bg-[#800000] text-white w-full z-50">
            {/* Logo Section */}
            <div className="max-w-[1440px] mx-auto  flex justify-between items-center h-[8rem]">
                <div className="flex items-center space-x-2">
                    <img src={mjLogo} alt="MJ Logo" className="h-20 w-20 rounded-full" />
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="text-yellow-500">MJ</span>-
                            <span className="text-white">AUTO</span>
                            <span className="text-yellow-500">LOVE</span>
                        </h1>
                        <p className="tex-3xl">VEHICLE TRADING</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center font-semi-bold text-2xl relative left-[6rem]">
                    <ul className="flex space-x-8">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                                onClick={() => scrollToSection('home')}
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/collection"
                                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                                onClick={() => scrollToSection('collection')}
                            >
                                Collection
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/sell"
                                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                                onClick={() => scrollToSection('sell')}
                            >
                                Sell
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/about"
                                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                                onClick={() => scrollToSection('about')}
                            >
                                About Us
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/book-visit"
                                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                            >
                                Book A Visit
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/location"
                                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                                onClick={() => scrollToSection('location')}
                            >
                                Location
                            </NavLink>
                        </li>
                        {isLoggedIn ? (
                            <>
                                {accountType === 'user' && (
                                    <li>
                                        <NavLink to="/dashboard" className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}>Dashboard</NavLink>
                                    </li>
                                )}
                                {accountType === 'admin' && (
                                    <li>
                                        <NavLink to="/admin" className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}>Admin Panel</NavLink>
                                    </li>
                                )}
                                <li>
                                    <button onClick={handleLogout} className="hover:text-yellow-500 transition-colors focus:outline-none">Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink 
                                        to="/RegistrationForm" 
                                        className={({ isActive }) => `bg-yellow-500 text-[#800000] px-3 py-1.5 rounded-md text-lg font-semibold hover:bg-yellow-600 transition-colors ${isActive ? 'bg-yellow-600' : ''}`}
                                    >
                                        Register
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/LoginForm" 
                                        className={({ isActive }) => `bg-white text-[#800000] px-3 py-1.5 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-100' : ''}`}
                                    >
                                        Login
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;