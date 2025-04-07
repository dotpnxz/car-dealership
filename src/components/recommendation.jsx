import React from 'react';

const Recommendation = () => {
  return (
    <div className="bg-gray-100 p-8 rounded-md shadow-md flex">
      {/* Left Side - Text Content */}
      <div className="w-1/2 pr-8">
        <h2 className="text-4xl font-bold text-orange-500 mb-4">Let Us Do the Searching!</h2>
        <p className="text-gray-700 mb-4">
          Please provide us with details about the car you're looking for, including your preferences for brand, model, price, and other specifications.
        </p>
        <p className="text-gray-700 mb-2">
          This will help us find the perfect match for you. Once we identify a car that meets your criteria, we will notify you immediately to ensure you don't miss out on it!
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 bg-white p-4 rounded-md shadow">
        <form>
          <div className="mb-2">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Name*
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email*
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="contact" className="block text-gray-700 text-sm font-bold mb-2">
              Contact#*
            </label>
            <input
              type="number"
              id="contact"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="preferredCarType" className="block text-gray-700 text-sm font-bold mb-2">
              Preferred Car Type*
            </label>
            <div className="relative">
              <select
                id="preferredCarType"
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              >
                <option>SUV</option>
                <option>Sedan</option>
                <option>Hatchback</option>
                {/* Add more options as needed */}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="brand" className="block text-gray-700 text-sm font-bold mb-2">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">
              Model
            </label>
            <input
              type="text"
              id="model"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="yearRange" className="block text-gray-700 text-sm font-bold mb-2">
              Year Range
            </label>
            <input
              type="number"
              id="yearRange"
              placeholder="Example: &quot;2018-2022&quot;"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="priceRange" className="block text-gray-700 text-sm font-bold mb-2">
              Price Range
            </label>
            <input
              type="text"
              id="priceRange"
              placeholder="Price Range in Peso"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Clear
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Recommendation;