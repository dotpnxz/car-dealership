import React, { useState } from 'react';
import deal from "../assets/deal.png";
import sellbg from "../assets/sell-bg.jpg";

const Sell = () => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    variant: '',
    mileage: '',
    transmission: '',
    fuelType: '',
    color: '',
    issues: '',
    askingPrice: '',
    firstOwner: '',
    registeredOwner: '',
    hasDocuments: '',
    carImage: null,
    validId: null
  });

  const [fileNames, setFileNames] = useState({
    carImage: "No file chosen",
    validId: "No file chosen"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
      setFileNames(prev => ({
        ...prev,
        [type]: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form data:', formData);
  };

  return (
    <div id="sell" className="w-full">
      {/* Banner Section with Text Overlay */}
      <div className="relative w-full h-[500px]">
        <img 
          src={deal} 
          alt="Banner" 
          className="w-full h-full object-center blur-[.25rem] contrast-55"
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
        <form onSubmit={handleSubmit} className="w-full max-w-[50rem] max-h-[200vh] overflow-auto bg-white flex flex-col items-center justify-center rounded-lg shadow-lg p-5">
          {/* Vehicle Information Section */}
          <div className="w-full space-y-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Vehicle Information</h2>
            {[ 
              { label: "Brand", name: "brand", placeholder: "Brand" },
              { label: "Model", name: "model", placeholder: "Model" },
              { label: "Year", name: "year", placeholder: "Year", type: "number" },
              { label: "Variant", name: "variant", placeholder: "Variant" },
              { label: "Mileage", name: "mileage", placeholder: "Mileage (in kilometers)" },
              { label: "Transmission", name: "transmission", placeholder: "Automatic/Manual" },
              { label: "Fuel Type", name: "fuelType", placeholder: "Gasoline/Diesel" },
              { label: "Color", name: "color", placeholder: "Color" },
              { label: "Issues", name: "issues", placeholder: "Issues (if any)" },
              { label: "Asking Price", name: "askingPrice", placeholder: "Asking Price (in Peso)" }
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-black text-lg font-semibold mb-1">{field.label}<span className="text-red-500">*</span></label>
                <input 
                  type={field.type || "text"}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 rounded-lg border text-gray-900 text-lg"
                  required
                />
              </div>
            ))}
          </div>

          {/* File Uploads Section */}
          <div className="w-full space-y-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Required Documents</h2>
            
            {/* Car Image Upload */}
            <div>
              <label className="block text-black text-lg font-semibold mb-1">
                Car Photos<span className="text-red-500">*</span>
              </label>
              <div className="w-full flex items-center space-x-4">
                <label className="w-[10rem] px-4 py-2 rounded-lg border text-gray-900 text-lg bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center">
                  Choose File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'carImage')}
                  />
                </label>
                <span className="text-gray-700 text-lg">{fileNames.carImage}</span>
              </div>
            </div>

            {/* Valid ID Upload */}
            <div>
              <label className="block text-black text-lg font-semibold mb-1">
                Valid ID<span className="text-red-500">*</span>
              </label>
              <div className="w-full flex items-center space-x-4">
                <label className="w-[10rem] px-4 py-2 rounded-lg border text-gray-900 text-lg bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center">
                  Choose File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'validId')}
                  />
                </label>
                <span className="text-gray-700 text-lg">{fileNames.validId}</span>
              </div>
            </div>
          </div>

          {/* Radio Button Questions */}
          <div className="w-full space-y-4 mb-6">
            {[ 
              { label: "Are you the first owner?", name: "firstOwner" },
              { label: "Are you the registered owner?", name: "registeredOwner" },
              { label: "Do you have complete car documents? (OR/CR, Insurance, etc.)", name: "hasDocuments" }
            ].map((question, index) => (
              <div key={index} className="mt-2">
                <label className="block text-black text-lg font-semibold mb-1">
                  {question.label}<span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name={question.name} 
                      value="yes" 
                      checked={formData[question.name] === 'yes'}
                      onChange={handleInputChange}
                      className="w-5 h-5" 
                      required
                    />
                    <span className="text-lg">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name={question.name} 
                      value="no" 
                      checked={formData[question.name] === 'no'}
                      onChange={handleInputChange}
                      className="w-5 h-5" 
                      required
                    />
                    <span className="text-lg">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center items-center mt-4">
            <button 
              type="submit"
              className="w-[20rem] px-4 py-2 font-bold rounded-lg text-2xl bg-[#d33230] hover:bg-gray-300 text-white cursor-pointer"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
