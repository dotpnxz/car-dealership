import React from 'react';
import mjLogo from "../assets/mj-logo.jpg"; 
import {
  FaFacebookSquare,
  FaInstagram,
  FaTwitterSquare,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Footer = () => {
  return (
    <div className='bg-[#1E1E1E] text-white py-10 px-6'>
      <div className='max-w-[1240px] mx-auto grid lg:grid-cols-3 gap-8'>
        
        {/* Logo Section */}
        <div className='flex justify-center'>
          <img src={mjLogo} alt="MJ Logo" className="h-40 w-40 rounded-full" />
        </div>

        {/* Contact and Social Media Section */}
        <div className='lg:col-span-2 flex flex-col lg:flex-row justify-between mt-1 gap-6'>

          {/* Contact Us */}
          <div>
            <h1 className='font-medium text-2xl'>Contact Us</h1>
            <ul className="space-y-2 mt-2 text-sm">
              <li className='flex items-center gap-2'> 
                <FaPhone size={18} /> +63 962 123 4321
              </li>
              <li className='flex items-center gap-2'>
                <FaEnvelope size={18} /> mjautolove@gmail.com
              </li>
              <li className='flex items-center gap-2'>
                <FaMapMarkerAlt size={18} /> W-19 Ramos St, West Bajac Bajac, Olongapo, Philippines, 2201
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h6 className='font-medium text-2xl'>Follow Us</h6>
            <ul className="space-y-2 mt-2 text-sm">
              <li className='flex items-center gap-2'> 
                <FaFacebookSquare size={18} /> facebook.com/MJAutoLove
              </li>
              <li className='flex items-center gap-2'> 
                <FaTwitterSquare size={18} /> @mj.autolove
              </li>
              <li className='flex items-center gap-2'>
                <FaInstagram size={18} /> @MJAutoLove
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h6 className='font-medium text-2xl'>Great Deals Await – Stop By Today!</h6>
            <ul className="space-y-1 mt-2 text-sm">
              <li>Mon - Sat: 8:00 AM - 5:00 PM</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Footer;
