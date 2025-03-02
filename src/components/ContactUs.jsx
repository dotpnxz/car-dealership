import React from 'react';
import contact from "../assets/contact.png";

const ContactUs = () => {
  return (
    <div className="w-full">
      {/* Banner Section */}
      <div className="relative w-full h-[350px]">
        <img 
          src={contact} 
          alt="Banner" 
          className="w-full h-full object-center contrast-55"
        />
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-[3.5rem] font-bold px-4 py-2 rounded-lg italic text-center">
            WE'D LOVE TO HEAR FROM YOU
          </h1>
          
        </div>
      </div>

      {/* White Background Section */}
      <div className="max-w-[1240px] mx-auto bg-white flex flex-col lg:flex-row justify-between items-start lg:items-center text-gray-800 py-16 px-8 gap-8">
  {/* Left Section: Heading & Description */}
  <div className="lg:w-1/2 relative bottom-[5rem]">
    <h1 className="text-4xl font-bold mb-[5rem]">SEND US A MESSAGE!</h1>
    <p className="text-lg">
      Got questions? Let’s talk! Whether it’s about our latest car models, pricing, or scheduling a test drive, we’re just a message away.
    </p>
  </div>

  {/* Right Section: Contact Form */}
  <div className="lg:w-1/2 bg-gray-100 p-6 rounded-lg shadow-md">
    <form className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Name"
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="email"
        placeholder="Email"
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Message"
        rows="4"
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        Send Message
      </button>
    </form>
  </div>
</div>

    </div>
  );
}

export default ContactUs;
