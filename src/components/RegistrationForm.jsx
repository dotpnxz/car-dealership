import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePhLocations from '../hooks/usePhLocations';
import { securityQuestions } from '../utils/securityQuestions';

const RequiredIndicator = () => <span className="text-red-500">*</span>;

const AlertMessage = ({ type, messages }) => {
  if (!messages || messages.length === 0) return null;
  
  const bgColor = type === 'success' 
      ? 'bg-green-100 border-green-500 text-green-700' 
      : 'bg-red-100 border-red-500 text-red-700';
  
  const icon = type === 'success' 
      ? '✓' 
      : '⚠';
  
  return (
      <div className={`${bgColor} border-l-4 p-4 mb-6 rounded flex items-start`}>
          <span className="mr-2">{icon}</span>
          {Array.isArray(messages) ? (
              <ul className="list-disc list-inside">
                  {messages.map((message, index) => (
                      <li key={index}>{message}</li>
                  ))}
              </ul>
          ) : (
              <p>{messages}</p>
          )}
      </div>
  );
};

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { regions, getProvincesByRegion, getCitiesByProvince } = usePhLocations();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    surname: '',
    firstName: '',
    middleName: '',
    suffix: '',
    email: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    contactNo: '+63',
    gender: '',
    streetAddress: '',
    city: '',
    province: '',
    zipCode: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [registrationStatus, setRegistrationStatus] = useState(null); // To display success/error messages
  const [errors, setErrors] = useState({}); // To display validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // To manage submit button state
  const [showPrivacyModal, setShowPrivacyModal] = useState(true); // Add this at the top with other states

  useEffect(() => {
    if (selectedRegion) {
      const provinces = getProvincesByRegion(selectedRegion);
      setAvailableProvinces(provinces);
      setSelectedProvince('');
      setFormData(prev => ({ ...prev, province: '', city: '' }));
      setAvailableCities([]);
    }
  }, [selectedRegion, getProvincesByRegion]);

  useEffect(() => {
    if (selectedProvince) {
      const cities = getCitiesByProvince(selectedProvince);
      setAvailableCities(cities);
    }
  }, [selectedProvince, getCitiesByProvince]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'province') {
      setSelectedProvince(value);
    }
  };

  const handleGenderChange = (e) => {
    setFormData({ ...formData, gender: e.target.value });
  };

  // Add this function before handleSubmit
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }

    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.password = 'Passwords do not match';
    }

    // Name validation
    if (!formData.surname?.trim()) {
      errors.surname = 'Surname is required';
    }
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    // Contact validation
    if (!formData.contactNo || formData.contactNo === '+63') {
      errors.contactNo = 'Contact number is required';
    }

    // Gender validation
    if (!formData.gender) {
      errors.gender = 'Please select your gender';
    }

    // Birthday validation
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      errors.birthday = 'Complete birthday is required';
    } else {
      const birthDate = new Date(formData.birthYear, formData.birthMonth - 1, formData.birthDay);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.birthday = 'You must be at least 18 years old to register';
      }
    }

    // Address validation
    if (!formData.streetAddress?.trim()) {
      errors.streetAddress = 'Street address is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (!formData.province) {
      errors.province = 'Province is required';
    }
    if (!formData.zipCode?.trim()) {
      errors.zipCode = 'ZIP code is required';
    }

    // Security Question validations
    if (!formData.securityQuestion) {
        errors.securityQuestion = 'Security question is required';
    }
    if (!formData.securityAnswer?.trim()) {
        errors.securityAnswer = 'Security answer is required';
    }

    return errors;
  };

  // Add this utility function before handleSubmit
  const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    // Handle PHP errors that return HTML
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      // If response contains PHP error, extract relevant info
      if (text.includes('<?php')) {
        throw new Error('Server configuration error: PHP is not properly configured');
      }
      // Try to parse as JSON even if content-type is HTML
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid response format from server');
      }
    }
    
    // Handle JSON responses
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    // Handle plain text responses
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Server error: ${text}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setRegistrationStatus({
        type: 'error',
        messages: Object.values(validationErrors)
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/car-dealership/api/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ...formData, accountType: 'buyer' })
      });

      const data = await parseResponse(response);
      console.log('Registration response:', data);

      if (data.success) {
        setRegistrationStatus({
          type: 'success',
          messages: [data.message || 'Registration successful!']
        });
        
        // Show success message and redirect after 2 seconds
        setTimeout(() => {
          navigate('/LoginForm', { 
            state: { 
              message: 'Registration successful! Please log in.',
              type: 'success'
            }
          });
        }, 2000);

        handleClear();
      } else {
        setRegistrationStatus({
          type: 'error',
          messages: data.errors || [data.message || 'Registration failed']
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationStatus({
        type: 'error',
        messages: [
          err.message || 
          'Server error: Please make sure the registration service is running properly.'
        ]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      surname: '',
      firstName: '',
      middleName: '',
      suffix: '',
      email: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      contactNo: '+63',
      gender: '',
      streetAddress: '',
      city: '',
      province: '',
      zipCode: '',
      securityQuestion: '',
      securityAnswer: '',
    });
    setRegistrationStatus(null);
  };

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-6xl w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Registration</h2>
        
        {registrationStatus && (
          <AlertMessage 
            type={registrationStatus.type}
            messages={registrationStatus.messages}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name, Gender, Contact, Birthday Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="surname" className="block text-gray-700 text-sm font-bold mb-2">
                Surname<RequiredIndicator />
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                First Name<RequiredIndicator />
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label htmlFor="middleName" className="block text-gray-700 text-sm font-bold mb-2">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="suffix" className="block text-gray-700 text-sm font-bold mb-2">
                Suffix (Optional)
              </label>
              <select
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">None</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Gender<RequiredIndicator />
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleGenderChange}
                    className="form-radio h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-700">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleGenderChange}
                    className="form-radio h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-700">Female</span>
                </label>
              </div>
              {errors.gender && <p className="text-red-500 text-xs italic">{errors.gender}</p>}
            </div>
            <div>
              <label htmlFor="contactNo" className="block text-gray-700 text-sm font-bold mb-2">
                Contact No<RequiredIndicator />
              </label>
              <input
                type="tel"
                id="contactNo"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="+63-000-000-0000"
              />
              {errors.contactNo && <p className="text-red-500 text-xs italic">{errors.contactNo}</p>}
            </div>
            <div className="col-span-1 lg:col-span-2">
              <label htmlFor="birthday" className="block text-gray-700 text-sm font-bold mb-2">
                Birthday<RequiredIndicator />
              </label>
              <div className="flex space-x-2">
                <select
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleChange}
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
                <select
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {errors.birthday && <p className="text-red-500 text-xs italic">{errors.birthday}</p>}
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Username<RequiredIndicator />
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email Address<RequiredIndicator />
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password<RequiredIndicator />
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password<RequiredIndicator />
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-4">
            <label htmlFor="streetAddress" className="block text-gray-700 text-sm font-bold mb-2">
              Street Address<RequiredIndicator />
            </label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label htmlFor="region" className="block text-gray-700 text-sm font-bold mb-2">
                Region<RequiredIndicator />
              </label>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="province" className="block text-gray-700 text-sm font-bold mb-2">
                Province<RequiredIndicator />
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Province</option>
                {availableProvinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                City<RequiredIndicator />
              </label>
              <select
                id="city"
                value={formData.city}
                onChange={handleChange}
                name="city"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select City</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-gray-700 text-sm font-bold mb-2">
                ZIP Code<RequiredIndicator />
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* Security Question & Answer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="securityQuestion" className="block text-gray-700 text-sm font-bold mb-2">
                Security Question<RequiredIndicator />
              </label>
              <select
                id="securityQuestion"
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Security Question</option>
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
              {errors.securityQuestion && (
                <p className="text-red-500 text-xs italic">{errors.securityQuestion}</p>
              )}
            </div>
            <div>
              <label htmlFor="securityAnswer" className="block text-gray-700 text-sm font-bold mb-2">
                Security Answer<RequiredIndicator />
              </label>
              <input
                type="text"
                id="securityAnswer"
                name="securityAnswer"
                value={formData.securityAnswer}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              {errors.securityAnswer && (
                <p className="text-red-500 text-xs italic">{errors.securityAnswer}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Privacy Notice</h2>
                
                <div className="prose prose-sm text-gray-600 space-y-4">
                  <p className="font-semibold">
                    In compliance with the Data Privacy Act of 2012 (RA 10173)
                  </p>
                  
                  <div className="space-y-2">
                    <p>We value and protect your personal information. When you register with us, we collect and process your data for the following purposes:</p>
                    
                    <ul className="list-disc pl-5 space-y-1">
                      <li>To create and manage your account</li>
                      <li>To process your car buying or selling transactions</li>
                      <li>To communicate with you about your transactions</li>
                      <li>To provide customer support</li>
                      <li>To comply with legal requirements</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold">Information We Collect:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Personal identification details</li>
                      <li>Contact information</li>
                      <li>Address and location data</li>
                      <li>Account credentials</li>
                      <li>Transaction records</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold">We ensure that:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your data is securely stored and protected</li>
                      <li>Your information is only used for stated purposes</li>
                      <li>Your data is only retained as long as necessary</li>
                      <li>Your rights as a data subject are respected</li>
                    </ul>
                  </div>

                  <p>
                    By proceeding with registration, you acknowledge that you have read this privacy notice and consent to the collection and processing of your personal information.
                  </p>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;