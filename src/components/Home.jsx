import React from "react";
import mjHome from "../assets/mj-home.png";
import hyundai from "../assets/hyundai.png";
import mitsubishi from "../assets/mitsubishi.png";
import nissan from "../assets/nissan.png";
import toyota from "../assets/toyota.png";
import homecar from "../assets/home-car.png";

const Home = () => {
  return (
    <div
      id="home"
      className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center relative px-4 sm:px-6"
      style={{ backgroundImage: `url(${mjHome})` }}
    >
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[90rem] py-4 lg:py-8 relative lg:bottom-[4rem]">
        {/* Text Section */}
        <div className="text-center lg:text-left mb-6 lg:mb-0 mt-16 lg:mt-0">
          <h1 className="text-black font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[5rem] leading-tight lg:leading-none mb-2">
            Buy Your Dream
          </h1>
          <h1 className="text-red-600 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[5rem] leading-tight lg:leading-none mb-2">
            CAR
          </h1>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[4rem] font-bold">
            at <span className="text-yellow-500">MJ</span>-
            <span className="text-red-600">AUTO</span>
            <span className="text-yellow-500">LOVE</span>
          </h1>
        </div>

        {/* Car Image */}
        <div className="flex justify-center w-full lg:w-auto px-4 sm:px-0">
          <img
            src={homecar}
            alt="Car Image"
            className="w-full max-w-[20rem] sm:max-w-[25rem] md:max-w-[30rem] lg:max-w-[50rem] h-auto object-contain"
          />
        </div>
      </div>

      {/* Logo Container */}
      <div className="w-full flex justify-center mt-4 lg:mt-0 relative lg:bottom-[4rem]">
        <div className="w-[95%] sm:w-[90%] max-w-[45rem] h-[80px] lg:h-[100px] bg-white flex items-center justify-evenly rounded-[3rem] lg:rounded-[5.5rem] shadow-lg">
          <img src={hyundai} alt="Hyundai Logo" className="w-[30px] sm:w-[35px] lg:w-[50px] h-auto object-contain" />
          <img src={mitsubishi} alt="Mitsubishi Logo" className="w-[30px] sm:w-[35px] lg:w-[50px] h-auto object-contain" />
          <img src={nissan} alt="Nissan Logo" className="w-[30px] sm:w-[35px] lg:w-[50px] h-auto object-contain" />
          <img src={toyota} alt="Toyota Logo" className="w-[30px] sm:w-[35px] lg:w-[50px] h-auto object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Home;
