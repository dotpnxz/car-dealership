import React, { useState } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    contactNo: '+63',
    gender: '',
    address: '',
  });
  const [registrationStatus, setRegistrationStatus] = useState(null); // To display success/error messages
  const [errors, setErrors] = useState({}); // To display validation errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderChange = (e) => {
    setFormData({ ...formData, gender: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setRegistrationStatus({ 
        success: false, 
        message: 'Passwords do not match.' 
      });
      return;
    }

    // Prepare data for submission (remove confirmPassword)
    const submitData = {
      ...formData,
      confirmPassword: undefined // Remove confirmPassword from submission
    };

    console.log('Submitting data:', submitData);

    try {
      const response = await fetch('http://localhost/car-dealership/api/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new TypeError("Response was not JSON");
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setRegistrationStatus({ success: true, message: data.message });
        setErrors({});
        // Clear the form on successful registration
        setFormData({
          fullname: '',
          username: '',
          password: '',
          confirmPassword: '',
          birthDay: '',
          birthMonth: '',
          birthYear: '',
          contactNo: '+63',
          gender: '',
          address: '',
        });
      } else {
        setRegistrationStatus({ success: false, message: data.message });
        setErrors(data.errors || {});
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus({ 
        success: false, 
        message: 'An error occurred during registration. Please try again.' 
      });
      setErrors({});
    }
  };

  const handleClear = () => {
    setFormData({
      fullname: '',
      username: '',
      password: '',
      confirmPassword: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      contactNo: '+63',
      gender: '',
      address: '',
    });
    setRegistrationStatus(null); // Clear any previous status messages
    setErrors({}); // Clear any previous errors
  };

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Registration Form</h2>
        <p className="text-sm text-gray-500 mb-4">Fill out the form carefully for registration</p>
        {registrationStatus && (
          <div className={`mb-4 p-3 rounded ${registrationStatus.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {registrationStatus.message}
            {Object.keys(errors).length > 0 && (
              <ul className="list-disc pl-5 mt-2">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullname" className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.fullname && <p className="text-red-500 text-xs italic">{errors.fullname}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="birthday" className="block text-gray-700 text-sm font-bold mb-2">
              Birthday
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
          <div className="mb-4">
            <label htmlFor="contactNo" className="block text-gray-700 text-sm font-bold mb-2">
              Contact No
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Gender
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
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.address && <p className="text-red-500 text-xs italic">{errors.address}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;