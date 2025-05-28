import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import honeycomb from "../assets/honeycomb.png";
import PaymentModal from './PaymentModal';

const BuyNow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { car } = location.state || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [purchase, setPurchase] = useState(null);

  // Determine API base URL based on environment
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  useEffect(() => {
    if (!car) {
      navigate('/collection');
    }
  }, [car, navigate]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create_purchase.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: car.id,
          purchase_type: 'full'
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Set up purchase data for payment
        setPurchase({
          id: data.purchase_id,
          amount: car.price,
          title: car.title,
          purchase_type: 'full'
        });
        setShowPayment(true);
        toast.success('Purchase created! Please complete your payment.');
      } else {
        toast.error(data.message || 'Failed to submit purchase request');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your purchase request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!car) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
        {/* Left side - Message */}
        <div className="w-full md:w-1/2 bg-blue-50 p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">Purchase Process</h2>
          <div className="space-y-3 sm:space-y-4 text-gray-700">
            <p className="text-base sm:text-lg">
              Thank you for choosing to purchase this vehicle. Here's what happens next:
            </p>
            <ol className="list-decimal pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-base sm:text-lg">
              <li>You can proceed with the payment for your purchase through our secure payment gateway.</li>
              <li>Upon successful payment, the car will be marked as sold and reserved for you.</li>
              <li>Our team will contact you to arrange the delivery or pickup of your vehicle.</li>
              <li>You'll need to provide the necessary documents for the transfer of ownership.</li>
              <li>Once all documentation is complete, you can take possession of your vehicle.</li>
              <li>Our team will assist you with any post-purchase support you may need.</li>
            </ol>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice:</h3>
              <ul className="list-disc pl-4 space-y-2 text-base text-yellow-800">
                <li>Please ensure all your contact information is up to date</li>
                <li>Have your valid identification ready for the purchase process</li>
                <li>Review all vehicle documentation before finalizing the purchase</li>
              </ul>
            </div>

            <p className="text-base sm:text-lg mt-3 sm:mt-4">
              Please note that the purchase is not confirmed until the payment is completed and verified.
            </p>
          </div>
        </div>

        {/* Right side - Car Details */}
        <div className="w-full md:w-1/2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Car Details</h1>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline text-base sm:text-lg ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">Title</p>
                <p className="font-semibold text-lg sm:text-xl">{car.title}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Price</p>
                  <p className="font-semibold text-base sm:text-lg">
                    ₱{parseFloat(car.price).toLocaleString('en-PH', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      useGrouping: true
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Category</p>
                  <p className="font-semibold text-base sm:text-lg">{car.category}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Brand</p>
                  <p className="font-semibold text-base sm:text-lg">{car.brand}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Variant</p>
                  <p className="font-semibold text-base sm:text-lg">{car.variant}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Mileage</p>
                  <p className="font-semibold text-base sm:text-lg">{car.mileage}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Chassis Number</p>
                  <p className="font-semibold text-base sm:text-lg">{car.chassis}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Transmission</p>
                  <p className="font-semibold text-base sm:text-lg">{car.transmission}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Fuel Type</p>
                  <p className="font-semibold text-base sm:text-lg capitalize">{car.fuel_type}</p>
                </div>
              </div>

              {car.issues && (
                <div>
                  <p className="text-gray-600 text-sm sm:text-base">Issues</p>
                  <p className="font-semibold text-base sm:text-lg whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {car.issues || 'No reported issues'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && purchase && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setPurchase(null);
          }}
          purchase={purchase}
        />
      )}
    </div>
  );
};

export default BuyNow;