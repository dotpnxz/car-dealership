import React, { useState } from "react";
import mjLogo from "../assets/mj-logo.jpg"; // Adjust the path if needed

const Navbar = () => {

  return (
    <div className="sticky top-0 bg-[#d33230] text-white h-25 flex justify-between items-center px-6 shadow-lg z-50">
      {/* Logo + Text */}
      <div className="flex items-center space-x-3 pl-50">
      <img src={mjLogo} alt="MJ Logo" className="h-20 w-20 rounded-full" />
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-yellow-500">MJ</span>-
            <span className="text-white">AUTO</span>
            <span className="text-yellow-500">LOVE</span>
          </h1>
          <div className="w-full flex justify-end">
            <h2 className="text-white text-lg font-semibold">VEHICLE TRADING</h2>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white">
      <ul className="hidden md:flex ml-100 font-poppins text-[1.1rem]">
        <li className="p-4">Home</li>
        <li className="p-4">About Us</li>
        <li className="p-4">Sell</li>
        <li className="p-4">Book A Visit</li>
        <li className="p-4">Location</li>
        <li className="p-4">Contact Us</li>
      </ul>
      </div>
    </div>
  );
};

export default Navbar;
