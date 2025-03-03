import React, { useState } from 'react';
import honeycomb from "../assets/honeycomb.png";

const BookVisit = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    purpose: 'Inquiry',
    otherReason: '',
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const handleClear = () => {
    setFormData({
      name: '',
      email: '',
      date: '',
      time: '',
      purpose: 'Inquiry',
      otherReason: '',
      additionalNotes: ''
    });
  };

  return (
    <div id="book-visit" className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center">
        <div className="w-[80%] max-w-[90rem] bg-white rounded-lg shadow-lg p-8 my-12 relative bottom-[3rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side - Instructions */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800">Schedule a Viewing with Us!</h2>
              <p className="text-gray-600 text-lg">
                Interested in seeing unit in person? Fill out the form below to book your preferred time, and we'll get back to you with confirmation as soon as possible!
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
                    <span>Our team will Email you to confirm the schedule.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="font-bold">Step 3:</span>
                    <span>Visit the location and experience it firsthand!</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="bg-gray-100 p-8 rounded-lg shadow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Name<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Email<span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Date<span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Time<span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700">Purpose of Visit<span className="text-red-500">*</span></label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Selling">Selling</option>
                    <option value="Inquiry">Inquiry</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {formData.purpose === 'Others' && (
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Other Reason</label>
                    <input
                      type="text"
                      name="otherReason"
                      value={formData.otherReason}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-lg font-semibold text-gray-700">Additional Notes</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
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
                    className="px-6 py-3 text-lg border border-transparent rounded-lg shadow-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookVisit; 