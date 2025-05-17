import React from 'react';
import abtusbg from "../assets/AbtUsBG.png";
import shade from "../assets/shade.png";
import mission from "../assets/mission.png"; 
import vision from "../assets/vision.png"; 

const AboutUs = () => {
  return (
    <div id="about" className="w-full">
      {/* Banner Section with Text Overlay */}
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px]">
        <img 
          src={abtusbg} 
          alt="Banner" 
          className="w-full h-full object-cover blur-[.25rem] contrast-55"
        />
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[5rem] font-sans px-4 py-2 rounded-lg italic text-center">
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
      <div className="w-full bg-[#484444] flex flex-col lg:flex-row justify-between items-center text-white py-8 sm:py-12 lg:py-[6rem] px-4 sm:px-8 lg:px-[8rem] gap-8 lg:gap-[3rem]">
        {/* Left Section - Mission Title & Text */}
        <div className="relative w-full lg:w-1/2 flex flex-col items-center">
          <h1 className="text-[#e4100e] font-bold italic text-4xl sm:text-5xl lg:text-[5rem] mb-4 lg:mb-8">Mission</h1>
          <div className="relative w-full min-h-[300px] lg:min-h-[400px] flex items-center">
            <img
              src={shade}
              alt="text-bg"
              className="absolute w-full max-w-[40rem] h-auto object-contain blur-[.05rem] contrast-25"
            />
            {/* Mission Statement */}
            <ul className="relative z-10 flex flex-col justify-center text-base sm:text-lg max-w-lg mx-auto px-6 lg:px-12 space-y-2">
              <li>• To provide customers with reliable, well-maintained vehicles at competitive prices.</li>
              <li>• To ensure a seamless and hassle-free car-buying experience through excellent customer service.</li>
              <li>• To maintain transparency and integrity in every transaction.</li>
              <li>• To continuously improve dealership operations through innovation and efficiency.</li>
              <li>• To build long-term relationships with customers by prioritizing their needs and satisfaction.</li>
            </ul>
          </div>
        </div>

        {/* Right Section - Mission Image */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <img
            src={mission}
            alt="mission"
            className="w-full max-w-[40rem] lg:max-w-[55rem] h-auto object-contain shadow-[15px_15px_30px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Vision Section */}
      <div className="w-full bg-[#484444] flex flex-col lg:flex-row-reverse justify-between items-center text-white py-8 sm:py-12 lg:py-[6rem] px-4 sm:px-8 lg:px-[8rem] gap-8 lg:gap-[3rem]">
        
        {/* Right Section - Vision Title & Text */}
        <div className="relative w-full lg:w-1/2 flex flex-col items-center">
          <h1 className="text-[#e4100e] font-bold italic text-4xl sm:text-5xl lg:text-[5rem] mb-4 lg:mb-8">Vision</h1>
          <div className="relative w-full min-h-[300px] lg:min-h-[400px] flex items-center">
            <img
              src={shade}
              alt="text-bg"
              className="absolute w-full max-w-[40rem] h-auto object-contain blur-[.05rem] contrast-25"
            />
            {/* Vision Statement */}
            <p className="relative z-10 text-base sm:text-lg lg:text-[1.5rem] max-w-lg mx-auto px-6 lg:px-12">
              To be a trusted and customer-focused car dealership known for quality vehicles, transparency, and excellent service while embracing innovation to enhance the car-buying experience.
            </p>
          </div>
        </div>

        {/* Left Section - Vision Image */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <img
            src={vision}
            alt="vision"
            className="w-full max-w-[40rem] lg:max-w-[55rem] h-auto object-contain shadow-[15px_15px_30px_rgba(0,0,0,0.5)]"
          />
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
