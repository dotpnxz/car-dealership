import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import deal from "../assets/deal.png";
import sellbg from "../assets/sell-bg.jpg";

const Sell = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    variant: '',
    mileage: '',
    chassis: '', // Add chassis number field
    transmission: '',
    fuelType: '',
    color: '',
    issues: '',
    askingPrice: '',
    firstOwner: '',
    registeredOwner: '',
    hasDocuments: '',
    carImages: [], // Change from carImage to carImages array
    validId: null
  });

  const [fileNames, setFileNames] = useState({
    carImages: [], // Change to array for multiple file names
    validId: "No file chosen"
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'mileage' || name === 'askingPrice') {
      // Remove non-numeric characters except decimal point for price
      const numericValue = name === 'askingPrice' 
        ? value.replace(/[^\d.]/g, '')
        : value.replace(/\D/g, '');
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    if (type === 'carImages') {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        [type]: [...prev.carImages, ...files]
      }));
      setFileNames(prev => ({
        ...prev,
        [type]: [...prev.carImages, ...files.map(file => file.name)]
      }));
    } else {
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
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add application data as JSON string
      const applicationData = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        variant: formData.variant,
        mileage: formData.mileage,
        chassis: formData.chassis,
        transmission: formData.transmission,
        fuel_type: formData.fuelType, // Match database column name
        color: formData.color,
        issues: formData.issues,
        asking_price: formData.askingPrice, // Match database column name
        is_first_owner: formData.firstOwner === 'yes' ? 1 : 0, // Match database column name
        is_registered_owner: formData.registeredOwner === 'yes' ? 1 : 0, // Match database column name
        has_documents: formData.hasDocuments === 'yes' ? 1 : 0 // Match database column name
      };

      formDataToSend.append('applicationData', JSON.stringify(applicationData));
      
      // Add valid ID
      if (formData.validId) {
        formDataToSend.append('validId', formData.validId);
      }

      // Add car photos
      formData.carImages.forEach((file) => {
        formDataToSend.append('carPhotos[]', file);
      });

      const applicationResponse = await fetch('http://localhost/car-dealership/api/create_application.php', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const responseText = await applicationResponse.text();
      console.log('Raw server response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Server response:', responseData);
      } catch (err) {
        console.error('Parse error:', err);
        throw new Error('Invalid JSON response from server: ' + responseText);
      }

      if (!applicationResponse.ok || !responseData.success) {
        throw new Error(responseData.message || 'Application creation failed');
      }

      // If everything is successful
      alert('Application submitted successfully!');
      // Removed navigation to '/seller/mycars'

    } catch (error) {
      console.error('Error details:', error);
      alert(`Error submitting application: ${error.message}`);
    }
  };

  // Format peso for display
  const formatPeso = (value) => {
    if (!value) return '';
    return `₱ ${parseFloat(value).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === step ? 'bg-red-500 text-white' : 'bg-gray-300'
          }`}>
            {step}
          </div>
          {step < 3 && <div className="w-10 h-1 bg-gray-300 mx-2" />}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Vehicle Information</h2>
            {['brand', 'model', 'year', 'variant', 'mileage', 'chassis'].map((field) => (
              <div key={field}>
                <label className="block text-black text-lg font-semibold mb-1">
                  {field === 'chassis' ? 'Chassis Number' : 
                   field === 'mileage' ? 'Mileage (km)' :
                   field.charAt(0).toUpperCase() + field.slice(1)}
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  type={field === 'year' || field === 'mileage' ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  placeholder={field === 'chassis' ? 'Enter Chassis Number' : 
                             field === 'mileage' ? 'Enter mileage in kilometers' :
                             field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full px-4 py-2 rounded-lg border text-gray-900 text-lg"
                  required
                  min={field === 'mileage' ? "0" : undefined}
                />
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Details</h2>
            {['transmission', 'fuelType', 'color', 'issues', 'askingPrice'].map((field) => (
              <div key={field}>
                <label className="block text-black text-lg font-semibold mb-1">
                  {field === 'askingPrice' ? 'Asking Price (₱)' :
                   field.charAt(0).toUpperCase() + field.slice(1)}
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  type={field === 'askingPrice' ? 'number' : 'text'}
                  name={field}
                  value={field === 'askingPrice' ? formData[field] : formData[field]}
                  onChange={handleInputChange}
                  placeholder={field === 'askingPrice' ? 'Enter amount in peso' : 
                             field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full px-4 py-2 rounded-lg border text-gray-900 text-lg"
                  required
                  min={field === 'askingPrice' ? "0" : undefined}
                  step={field === 'askingPrice' ? "0.01" : undefined}
                />
                {field === 'askingPrice' && formData[field] && (
                  <div className="text-sm text-gray-600 mt-1">
                    {formatPeso(formData[field])}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Documents & Verification</h2>
            {/* File uploads */}
            <div className="mb-4">
              <div className="mb-4">
                <label className="block text-black text-lg font-semibold mb-1">
                  Car Photos<span className="text-red-500">*</span>
                </label>
                <div className="w-full flex items-center space-x-4">
                  <label className="w-[10rem] px-4 py-2 rounded-lg border text-gray-900 text-lg bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center">
                    Choose Files
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'carImages')}
                    />
                  </label>
                  <div className="flex-1">
                    {fileNames.carImages.length > 0 ? (
                      <ul className="text-gray-700 text-sm">
                        {fileNames.carImages.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-700 text-lg">No files chosen</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">
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
            {/* Ownership Questions */}
            {['firstOwner', 'registeredOwner', 'hasDocuments'].map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-black text-lg font-semibold mb-1">
                  {field === 'firstOwner' ? 'Are you the first owner?' :
                   field === 'registeredOwner' ? 'Are you the registered owner?' :
                   'Do you have complete car documents?'}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  {['yes', 'no'].map((value) => (
                    <label key={value} className="flex items-center space-x-2">
                      <input 
                        type="radio"
                        name={field}
                        value={value}
                        checked={formData[field] === value}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                        required
                      />
                      <span className="text-lg">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="sell" className="w-full">
      <div className="relative w-full h-[300px]">
        <img 
          src={deal} 
          alt="Banner" 
          className="w-full h-full object-center blur-[.25rem] contrast-55"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-4xl sm:text-5xl font-bold px-4 py-2 rounded-lg italic text-center">
            SELL YOUR CAR NOW
          </h1>
        </div>
      </div>

      <div 
        className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-start py-10 px-4" 
        style={{ backgroundImage: `url(${sellbg})` }}
      >
        <h1 className="text-white bg-red-500 text-xl sm:text-2xl font-bold px-5 py-2 rounded-lg mb-6 text-center">
          APPLICATION TO SELL YOUR VEHICLE
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-[50rem] bg-white rounded-lg shadow-lg p-5">
          {renderStepIndicator()}
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 font-bold rounded-lg text-lg bg-gray-500 text-white hover:bg-gray-600"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 font-bold rounded-lg text-lg bg-[#d33230] text-white hover:bg-red-600 ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 font-bold rounded-lg text-lg bg-[#d33230] text-white hover:bg-red-600 ml-auto"
              >
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
