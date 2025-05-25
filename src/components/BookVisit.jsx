import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import honeycomb from "../assets/honeycomb.png";

const BookVisit = () => {
  const { user, isLoggedIn, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [availableCars, setAvailableCars] = useState([]);
  const [formData, setFormData] = useState({
    car_id: '',
    car_model: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine API base URL based on environment
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  useEffect(() => {
    const checkAuthAndFetchCars = async () => {
      try {
        const authCheck = await fetch(`${API_BASE_URL}/check_session.php`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const authData = await authCheck.json();
        console.log('Auth check response:', authData);

        if (authData.status !== 'authenticated') {
          navigate('/loginform');
          return;
        }

        // Only fetch cars if authenticated
        const response = await fetch(`${API_BASE_URL}/get_cars.php`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const availableCars = data.filter(car => car.status === 'available');
          setAvailableCars(availableCars);
        }
      } catch (err) {
        console.error('Auth or fetch error:', err);
        setError('Failed to authenticate or fetch cars');
      }
    };

    if (!isLoggedIn) {
      navigate('/loginform');
    } else {
      checkAuthAndFetchCars();
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'car_id') {
      const selectedCar = availableCars.find(car => car.id.toString() === value); // Convert to string for comparison
      setFormData(prevState => ({
        ...prevState,
        car_id: value,
        car_model: selectedCar ? `${selectedCar.brand} ${selectedCar.title}` : ''
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
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

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authCheck = await fetch(`${API_BASE_URL}/check_session.php`, {
        credentials: 'include'
      });
      const authData = await authCheck.json();

      if (authData.status !== 'authenticated') {
        throw new Error('Please log in to schedule a test drive');
      }

      const selectedCar = availableCars.find(car => car.id.toString() === formData.car_id);
      if (!selectedCar) {
        setError('Please select a car');
        setLoading(false);
        return;
      }

      console.log('Selected car:', selectedCar); // Debug log
      console.log('Form data:', formData); // Debug log

      const bookingData = {
        ...formData,
        user_id: authData.user_id,
        car_id: selectedCar.id,
        car_model: `${selectedCar.brand} ${selectedCar.title}`,
        status: 'pending'
      };

      console.log('Sending booking data:', bookingData); // Debug log

      const response = await fetch(`${API_BASE_URL}/create_booking.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule test drive');
      }

      setFormData({
        car_id: '',
        car_model: '',
        booking_date: '',
        booking_time: '',
        notes: ''
      });
      setSuccessMessage('Test drive scheduled successfully! We will contact you shortly to confirm your appointment.');
      setShowSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      car_id: '',
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
    <div id="book-visit" className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center">
        <div className="w-full sm:w-[90%] max-w-[90rem] bg-white rounded-lg shadow-lg p-4 sm:p-8 my-6 sm:my-12">
          {!isLoggedIn ? (
            <div className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">Please Log In to Schedule a Test Drive</h2>
              <p className="text-base sm:text-lg text-gray-600">
                You need to be logged in to schedule a test drive. Please log in or create an account to continue.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4">
                <button
                  onClick={handleLogin}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-lg shadow-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                >
                  Login Now
                </button>
                <button
                  onClick={handleRegister}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-lg shadow-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                >
                  Make an Account
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">Schedule a Test Drive with Us!</h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Interested in experiencing a car firsthand? Fill out the form below to schedule your preferred test drive time, and we'll get back to you with confirmation as soon as possible!
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-700">A simple 3-step guide on what happens after scheduling:</h3>
                  <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg">
                    <li className="flex items-start space-x-3">
                      <span className="font-bold">Step 1:</span>
                      <span>Fill out the form with your details and preferred time for your test drive</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="font-bold">Step 2:</span>
                      <span>Our team will confirm your test drive schedule.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="font-bold">Step 3:</span>
                      <span>Visit the location and enjoy your test drive!</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-100 p-4 sm:p-8 rounded-lg shadow-md">
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

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Car<span className="text-red-500">*</span></label>
                    <select
                      name="car_id"
                      value={formData.car_id}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                      required
                    >
                      <option value="">Select a car</option>
                      {availableCars.map((car) => (
                        <option key={car.id} value={car.id.toString()}> {/* Ensure value is string */}
                          {car.brand} {car.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      <select
                        name="booking_time"
                        value={formData.booking_time}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                        required
                      >
                        <option value="">Select a time</option>
                        {getTimeSlots().map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Store hours: 8:00 AM - 5:00 PM.
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

                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-lg shadow-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-lg shadow-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                      {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
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