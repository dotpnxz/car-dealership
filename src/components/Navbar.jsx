import React from "react";
import { NavLink } from "react-router-dom";
import mjLogo from "../assets/mj-logo.jpg";

const Navbar = () => {
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

  return (
    <nav className="sticky top-0 bg-[#800000] text-white w-full z-50">
      <div className="max-w-[1440px] mx-auto  flex justify-between items-center h-[8rem]">
        {/* Logo Section */}
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
                to="/about" 
                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                onClick={() => scrollToSection('about')}
              >
                About Us
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
                to="/book-visit" 
                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
              >
                Book A Visit
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
                to="/location" 
                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                onClick={() => scrollToSection('location')}
              >
                Location
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                onClick={() => scrollToSection('contact')}
              >
                Contact Us
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/RegistrationForm" 
                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                onClick={() => scrollToSection('RegistrationForm')}
              >
                Register
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/LoginForm"
                className={({ isActive }) => `hover:text-yellow-500 transition-colors ${isActive ? 'text-yellow-500' : ''}`}
                onClick={() => scrollToSection('contact')}
              >
                Login
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
