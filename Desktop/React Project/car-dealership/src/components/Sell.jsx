import React, { useState } from 'react';
import deal from "../assets/deal.png";
import sellbg from "../assets/sell-bg.jpg";

const Sell = () => {
  const [fileName, setFileName] = useState("No file chosen");

  return (
    <div className="w-full">
      {/* Banner Section with Text Overlay */}
      <div className="relative w-full h-[500px]">
        <img 
          src={deal} 
          alt="Banner" 
          className="w-full h-full object-cover blur-[.25rem] contrast-55"
        />
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-[5rem] font-bold px-4 py-2 rounded-lg italic text-center">
            SELL YOUR CAR NOW
          </h1>
        </div>
      </div>

      {/* Application Section */}
      <div 
        className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-start py-10 px-4" 
        style={{ backgroundImage: `url(${sellbg})` }}
      >
        {/* Title */}
        <h1 className="text-white bg-red-500 text-[2rem] font-bold px-5 py-2 rounded-lg mb-6 text-center">
          APPLICATION TO SELL YOUR VEHICLE
        </h1>

        {/* Form Container */}
        <div className="w-full max-w-[50rem] max-h-[200vh] overflow-auto bg-white flex flex-col items-center justify-center rounded-lg shadow-lg p-5">
          {/* Name Input */}
          <div className="w-full space-y-4">
            {[ 
              { label: "Name", placeholder: "Enter your full name" },
              { label: "Email", placeholder: "Email" },
              { label: "Brand", placeholder: "Brand" },
              { label: "Variant", placeholder: "Variant" },
              { label: "Mileage", placeholder: "Mileage" },
              { label: "Issues", placeholder: "Issues (if any)" },
              { label: "Asking Price", placeholder: "Asking Price (in Peso)" }
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-black text-lg font-semibold mb-1">{field.label}<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 rounded-lg border text-gray-900 text-lg"
                />
              </div>
            ))}

            {/* File Upload */}
            <div>
              <label className="block text-black text-lg font-semibold mb-1">
                Picture<span className="text-red-500">*</span>
              </label>
              <div className="w-full flex items-center space-x-4">
                <label className="w-[10rem] px-4 py-2 rounded-lg border text-gray-900 text-lg bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center">
                  Choose File
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFileName(e.target.files[0] ? e.target.files[0].name : "No file chosen")}
                  />
                </label>
                <span className="text-gray-700 text-lg">{fileName}</span>
              </div>
            </div>

            {/* Radio Button Questions */}
            {[ 
              { label: "Are you the first owner?", name: "firstOwner" },
              { label: "Are you the registered owner?", name: "registeredOwner" }
            ].map((question, index) => (
              <div key={index} className="mt-2">
                <label className="block text-black text-lg font-semibold mb-1">
                  {question.label}<span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name={question.name} value="yes" className="w-5 h-5" />
                    <span className="text-lg">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name={question.name} value="no" className="w-5 h-5" />
                    <span className="text-lg">No</span>
                  </label>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-center items-center mt-4">
              <button className="w-[20rem] px-4 py-2 font-bold rounded-lg text-2xl bg-[#d33230] hover:bg-gray-300 text-white cursor-pointer">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
