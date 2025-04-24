import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import honeycomb from "../assets/honeycomb.png";

const BookVisit = () => {
  const { user, isLoggedIn, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    car_model: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0; // 0 is Sunday
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    if (isSunday(date)) {
      setError('Sorry, we are closed on Sundays. Please select another day.');
      setFormData(prevState => ({
        ...prevState,
        booking_date: ''
      }));
    } else {
      setError('');
      handleChange(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost/car-dealership/api/create_booking.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Clear form and show success message
      setFormData({
        car_model: '',
        booking_date: '',
        booking_time: '',
        notes: ''
      });
      setSuccessMessage('Booking created successfully! We will contact you shortly to confirm your appointment.');
      setShowSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      car_model: '',
      booking_date: '',
      booking_time: '',
      notes: ''
    });
  };

  const handleLogin = () => {
    navigate('/loginform');
  };

  const handleRegister = () => {
    navigate('/registrationform');
  };

  return (
    <div id="book-visit" className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center">
        <div className="w-[80%] max-w-[90rem] bg-white rounded-lg shadow-lg p-8 my-12 relative bottom-[3rem]">
          {!isLoggedIn ? (
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-gray-800">Please Log In to Book a Visit</h2>
              <p className="text-gray-600 text-lg">
                You need to be logged in to schedule a viewing. Please log in or create an account to continue.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 text-lg border border-transparent rounded-lg shadow-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Login Now
                </button>
                <button
                  onClick={handleRegister}
                  className="px-6 py-3 text-lg border border-gray-300 rounded-lg shadow-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Make an Account
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Instructions */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-800">Schedule a Viewing with Us!</h2>
                <p className="text-gray-600 text-lg">
                  Interested in seeing a car in person? Fill out the form below to book your preferred time, and we'll get back to you with confirmation as soon as possible!
                </p>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-700">A simple 3-step guide on what happens after booking:</h3>
                  <ul className="space-y-4 text-lg">
                    <li className="flex items-start space-x-3">
                      <span className="font-bold">Step 1:</span>
                      <span>Fill out the form with your details and preferred time</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="font-bold">Step 2:</span>
                      <span>Our team will confirm your schedule.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="font-bold">Step 3:</span>
                      <span>Visit the location and experience the car firsthand!</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="bg-gray-100 p-8 rounded-lg shadow-md">
                {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {showSuccess && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{successMessage}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Car<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="car_model"
                      value={formData.car_model}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                      placeholder="Enter car model or ID"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700">Date<span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="booking_date"
                        value={formData.booking_date}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        We are closed on Sundays. Please select another day.
                      </p>
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700">Time<span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        name="booking_time"
                        value={formData.booking_time}
                        onChange={handleChange}
                        min="08:00"
                        max="17:00"
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Store hours: 8:00 AM - 5:00 PM. For custom time requests, please specify in the notes below.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-6 py-3 text-lg border border-gray-300 rounded-lg shadow-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-lg border border-transparent rounded-lg shadow-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                      {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      ) : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookVisit; 