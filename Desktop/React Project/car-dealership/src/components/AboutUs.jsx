import React from 'react';
import abtusbg from "../assets/AbtUsBG.png";
import shade from "../assets/shade.png";
import mission from "../assets/mission.png"; 
import vision from "../assets/vision.png"; 

const AboutUs = () => {
  return (
    <div className="w-full">
      {/* Banner Section with Text Overlay */}
      <div className="relative w-full h-[400px]">
        <img 
          src={abtusbg} 
          alt="Banner" 
          className="w-full h-full object-cover blur-[.25rem] contrast-55"
        />
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-[5rem] font-sans px-4 py-2 rounded-lg italic text-center">
            LEARN MORE ABOUT{" "}  
            <span className="font-bold not-italic">
              <span className="text-yellow-500">MJ</span>-
              <span className="text-red-600">AUTO</span>
              <span className="text-yellow-500">LOVE</span>
            </span>
          </h1>
        </div>
      </div>

      {/* Mission Section */}
      <div className="w-full bg-[#484444] flex flex-row justify-between items-center text-white py-[6rem] px-[8rem] gap-[3rem]">
        
        {/* Left Section - Mission Title & Text */}
        <div className="relative w-1/2 flex flex-col items-center">
          <h1 className="text-[#e4100e] font-bold italic text-[5rem]">Mission</h1>
          <div className="relative w-full">
            <img
              src={shade}
              alt="text-bg"
              className="w-full max-w-[40rem] h-auto object-contain blur-[.05rem] contrast-25"
            />
            {/* Mission Statement */}
            <ul className="absolute inset-0 flex flex-col justify-center text-lg max-w-lg px-8 space-y-2 pl-[6rem]">
              <li>• To provide customers with reliable, well-maintained vehicles at competitive prices.</li>
              <li>• To ensure a seamless and hassle-free car-buying experience through excellent customer service.</li>
              <li>• To maintain transparency and integrity in every transaction.</li>
              <li>• To continuously improve dealership operations through innovation and efficiency.</li>
              <li>• To build long-term relationships with customers by prioritizing their needs and satisfaction.</li>
            </ul>
          </div>
        </div>

        {/* Right Section - Mission Image */}
        <div className="w-1/2 flex justify-end">
          <img
            src={mission}
            alt="mission"
            className="w-full max-w-[55rem] h-auto object-contain shadow-[15px_15px_30px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Vision Section */}
      <div className="w-full bg-[#484444] flex flex-row-reverse justify-between items-center text-white py-[6rem] px-[8rem] gap-[3rem]">
        
        {/* Right Section - Vision Title & Text */}
        <div className="relative w-1/2 flex flex-col items-center">
          <h1 className="text-[#e4100e] font-bold italic text-[5rem]">Vision</h1>
          <div className="relative w-full">
            <img
              src={shade}
              alt="text-bg"
              className="w-full max-w-[40rem] h-auto object-contain blur-[.05rem] contrast-25"
            />
            {/* Vision Statement */}
            <p className="absolute inset-0 flex items-center text-[1.5rem] max-w-lg px-6 pl-[5rem]">
              To be a trusted and customer-focused car dealership known for quality vehicles, transparency, and excellent service while embracing innovation to enhance the car-buying experience.
            </p>
          </div>
        </div>

        {/* Left Section - Vision Image */}
        <div className="w-1/2 flex justify-end">
          <img
            src={vision}
            alt="vision"
            className="w-full max-w-[55rem] h-auto object-contain shadow-[15px_15px_30px_rgba(0,0,0,0.5)]"
          />
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
