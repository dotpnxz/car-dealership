import React, { useContext, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import mjLogo from "../assets/mj-logo.jpg";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const Navbar = () => {
    const { isLoggedIn, accountType, logout, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <div className="max-w-[1440px] mx-auto flex justify-between items-center h-[8rem] px-4">
                    <div className="flex items-center space-x-2">
                        <img src={mjLogo} alt="MJ Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-full" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                <span className="text-yellow-500">MJ</span>-
                                <span className="text-white">AUTO</span>
                                <span className="text-yellow-500">LOVE</span>
                            </h1>
                            <p className="text-sm md:text-base">VEHICLE TRADING</p>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 bg-[#800000] text-white w-full z-50">
            <div className="max-w-[1440px] mx-auto flex justify-between items-center h-[8rem] px-4">
                {/* Logo Section */}
                <div className="flex items-center space-x-2">
                    <img src={mjLogo} alt="MJ Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-full" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            <span className="text-yellow-500">MJ</span>-
                            <span className="text-white">AUTO</span>
                            <span className="text-yellow-500">LOVE</span>
                        </h1>
                        <p className="text-sm md:text-base">VEHICLE TRADING</p>
                    </div>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className="lg:hidden p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-white"></div>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center font-semi-bold text-2xl relative left-[6rem]">
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
                        {/* Removed Sell link */}
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
                                Test Drive
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
                                {accountType === 'buyer' && (
                                    <li>
                                        <NavLink to="/buyer" className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}>Dashboard</NavLink>
                                    </li>
                                )}
                                 {accountType === 'seller' && (
                                    <li>
                                        <NavLink to="/seller" className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}>Dashboard</NavLink>
                                    </li>
                                )}

                                {accountType === 'admin' && (
                                    <li>
                                        <NavLink to="/admin" className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}>Admin Panel</NavLink>
                                    </li>
                                )}
                                {accountType === 'staff' && (
                                    <li>
                                        <NavLink to="/staff" className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}>Staff Panel</NavLink>
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

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-[#800000] z-50 lg:hidden">
                        <div className="flex justify-end p-4">
                            <button
                                className="text-white text-4xl"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <ul className="flex flex-col items-center space-y-4 pt-8">
                            <li><NavLink to="/" className="text-xl" onClick={() => { setIsMenuOpen(false); scrollToSection('home'); }}>Home</NavLink></li>
                            <li><NavLink to="/collection" className="text-xl" onClick={() => { setIsMenuOpen(false); scrollToSection('collection'); }}>Collection</NavLink></li>
                            {/* Removed Sell link */}
                            <li><NavLink to="/about" className="text-xl" onClick={() => { setIsMenuOpen(false); scrollToSection('about'); }}>About Us</NavLink></li>
                            <li><NavLink to="/book-visit" className="text-xl" onClick={() => setIsMenuOpen(false)}>Book A Visit</NavLink></li>
                            <li><NavLink to="/location" className="text-xl" onClick={() => { setIsMenuOpen(false); scrollToSection('location'); }}>Location</NavLink></li>
                            
                            {isLoggedIn ? (
                                <>
                                    {accountType === 'buyer' && (
                                        <li><NavLink to="/buyer" className="text-xl" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink></li>
                                    )}
                                    {accountType === 'seller' && (
                                        <li><NavLink to="/seller" className="text-xl" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink></li>
                                    )}
                                    {accountType === 'admin' && (
                                        <li><NavLink to="/admin" className="text-xl" onClick={() => setIsMenuOpen(false)}>Admin Panel</NavLink></li>
                                    )}
                                    {accountType === 'staff' && (
                                        <li><NavLink to="/staff" className="text-xl" onClick={() => setIsMenuOpen(false)}>Staff Panel</NavLink></li>
                                    )}
                                    <li><button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-xl">Logout</button></li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <NavLink to="/RegistrationForm" className="bg-yellow-500 text-[#800000] px-4 py-2 rounded-md text-lg" onClick={() => setIsMenuOpen(false)}>
                                            Register
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/LoginForm" className="bg-white text-[#800000] px-4 py-2 rounded-md text-lg" onClick={() => setIsMenuOpen(false)}>
                                            Login
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;