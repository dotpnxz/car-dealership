import React from 'react';
import mjLogo from "../assets/mj-logo.jpg"; 
import {
  FaFacebookSquare,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Footer = () => {
  return (
    <div className='bg-[#1E1E1E] text-white py-4 sm:py-6 px-4 sm:px-6'>
      <div className='max-w-[1240px] mx-auto grid lg:grid-cols-3 gap-6 sm:gap-8'>
        
        {/* Logo Section */}
        <div className='flex justify-center lg:justify-start'>
          <img src={mjLogo} alt="MJ Logo" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
        </div>

        {/* Contact and Social Media Section */}
        <div className='lg:col-span-2 flex flex-col lg:flex-row justify-between gap-6 sm:gap-8'>

          {/* Contact Us */}
          <div className='text-center lg:text-left'>
            <h1 className='font-medium text-base sm:text-lg mb-2 text-yellow-500'>Contact Us</h1>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className='flex items-center gap-2 justify-center lg:justify-start'> 
                <FaPhone size={16} /> +63 962 123 4321
              </li>
              <li className='flex items-center gap-2 justify-center lg:justify-start'>
                <FaEnvelope size={16} /> mjautolove@gmail.com
              </li>
              <li className='flex items-center gap-2 justify-center lg:justify-start'>
                <FaMapMarkerAlt size={16} className="flex-shrink-0" />
                <span className="text-left">W-19 Ramos St, West Bajac Bajac, Olongapo, Philippines, 2201</span>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className='text-center lg:text-left'>
            <h6 className='font-medium text-base sm:text-lg mb-2 text-yellow-500'>Follow Us</h6>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className='flex items-center gap-2 justify-center lg:justify-start'> 
                <FaFacebookSquare size={16} />
                <a 
                  href="https://www.facebook.com/mjautolove" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-yellow-500 transition-colors"
                >
                  facebook.com/MJAutoLove
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className='text-center lg:text-left'>
            <h6 className='font-medium text-base sm:text-lg mb-2 text-yellow-500'>Great Deals Await – Stop By Today!</h6>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>Mon - Sat: 8:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
