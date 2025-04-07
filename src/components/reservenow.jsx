import React from 'react';
import { useLocation } from "react-router-dom";

const ReserveNow = () => {
  // Get the passed state from the Link
  const location = useLocation();
  const carTitle = location.state?.carTitle || "Car Title not available"; // Default value if no title is passed

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 flex flex-col md:flex-row max-w-5xl w-full">
        {/* LEFT SIDE - Instructions & Terms */}
        <div className="md:w-1/2 p-4">
          <h2 className="text-2xl font-bold text-black mb-4">Reserve Your Car Now!</h2>
          <h3 className="text-lg font-semibold text-red-600">How to Pay?</h3>
          <ol className="list-decimal list-inside text-gray-700 mb-4">
            <li>Fill out the form with your Personal Information.</li>
            <li>Use your preferred payment method.</li>
            <li>Upload your proof of payment.</li>
            <li>Press the confirm button.</li>
          </ol>

          <h3 className="text-lg font-semibold text-red-600 mt-4">Reservation Terms & Conditions</h3>
          <ul className="list-disc list-inside text-gray-700">
            <li>The reservation fee is non-refundable once confirmed.</li>
            <li>The vehicle will be held for 7 days; failure to complete payment cancels the reservation.</li>
            <li>A payment screenshot is required for verification.</li>
            <li>A confirmation email will be sent after processing.</li>
          </ul>
        </div>

        {/* RIGHT SIDE - Reservation Form */}
        <div className="md:w-1/2 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-black mb-2">Personal Information</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full p-2 border border-gray-300 rounded" />
            <input type="email" placeholder="Email Address" className="w-full p-2 border border-gray-300 rounded" />
            <input type="text" placeholder="Contact No." className="w-full p-2 border border-gray-300 rounded" />

            <h3 className="text-lg font-semibold text-black mt-4">Car Details</h3>
            {/* Auto-filled car title */}
            <input
              type="text"
              value={carTitle}  // Auto-filled with car title
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-200"
            />

            <h3 className="text-lg font-semibold text-black-600 mt-4">Available Payment Method</h3>
            <p>Bank Transfer</p>
            <li>Acount Name</li>
            <li>Acount Number</li>
            <li>Bank Name</li>

            <p>GCASH</p>
            <li>Gcash Number</li>

            <h3 className="text-lg font-semibold text-black mt-4">Upload Payment</h3>
            <input type="file" className="w-full p-2 border border-gray-300 rounded bg-white" />

            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
              Confirm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReserveNow;
