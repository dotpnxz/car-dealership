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
      className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${mjHome})` }}
    >
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[90rem] px-10 lg:px-20">
        
        {/* 🚗 Text Section */}
        <div className="text-center lg:text-left relative left-20 bottom-20">
          <h1 className="text-black font-bold text-[5rem] leading-none whitespace-nowrap">Buy Your Dream</h1>
          <h1 className="text-red-600 font-bold text-[5rem] leading-none">CAR</h1>
          <h1 className="text-[4rem] font-bold">
            at <span className="text-yellow-500">MJ</span>-
            <span className="text-red-600">AUTO</span>
            <span className="text-yellow-500">LOVE</span>
          </h1>
        </div>

        {/* 🚘 Car Image */}
        <div className="flex justify-center relative left-20 bottom-20">
          <img
            src={homecar}
            alt="Car Image"
            className="w-full max-w-[50rem] h-auto object-contain"
          />
        </div>
      </div>

      {/* 🌟 Logo Container */}
      <div className="w-full flex justify-center relative bottom-20">
        <div className="w-[90%] max-w-[45rem] h-[100px] bg-white flex items-center justify-center rounded-[5.5rem] shadow-lg gap-25">
          <img src={hyundai} alt="Hyundai Logo" className="w-[50px] h-auto object-contain" />
          <img src={mitsubishi} alt="Mitsubishi Logo" className="w-[50px] h-auto object-contain" />
          <img src={nissan} alt="Nissan Logo" className="w-[50px] h-auto object-contain" />
          <img src={toyota} alt="Toyota Logo" className="w-[50px] h-auto object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Home;
