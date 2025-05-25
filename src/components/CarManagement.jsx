import React, { useState, useEffect } from 'react';

const CarManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    brand: '',
    variant: '',
    mileage: '',
    chassis: '', // Added
    transmission: '',
    fuel_type: '', // Added
    condition: '',
    seating: '',
    issues: '', // Added
    status: 'available'
  });
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(10);

  // Add new state for details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);

  // Determine API base URL based on environment
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_cars.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setCars(data);
        setSearchResults(data); // Initialize search results with all cars
      } else {
        setError(data.message || 'Failed to fetch cars');
      }
    } catch (error) {
      setError('An error occurred while fetching cars');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add images
      images.forEach((file, index) => {
        formDataToSend.append(`images[${index}]`, file);
      });

      const response = await fetch(`${API_BASE_URL}/add_car.php`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add car');
      }

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          title: '',
          price: '',
          category: '',
          brand: '',
          variant: '',
          mileage: '',
          chassis: '', // Added
          transmission: '',
          fuel_type: '', // Added
          condition: '',
          seating: '',
          issues: '', // Added
          status: 'available'
        });
        setImages([]);
        setSuccess('Car added successfully');
        fetchCars();
      } else {
        throw new Error(data.error || 'Failed to add car');
      }
    } catch (error) {
      console.error('Error adding car:', error);
      setError(error.message || 'An error occurred while adding car');
    }
  };

  const handleEditCar = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('carId', selectedCar.id);
      formDataToSend.append('title', formData.title);
      const price = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
      if (isNaN(price)) {
        setError('Price must be a valid number');
        return;
      }
      formDataToSend.append('price', price.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('variant', formData.variant);
      formDataToSend.append('mileage', formData.mileage);
      formDataToSend.append('transmission', formData.transmission);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('seating', formData.seating);
      formDataToSend.append('status', formData.status);

      const response = await fetch(`${API_BASE_URL}/update_car.php`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid response from server');
      }

      if (data.success) {
        setShowEditModal(false);
        setSelectedCar(null);
        fetchCars();
      } else {
        setError(data.error || 'Failed to update car');
      }
    } catch (err) {
      console.error('Error updating car:', err);
      setError(err.message || 'Error updating car');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete_car.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ carId })
        });

        const data = await response.json();
        if (response.ok) {
          fetchCars();
        } else {
          setError(data.message || 'Failed to delete car');
        }
      } catch (error) {
        setError('An error occurred while deleting car');
      }
    }
  };

  const handleStatusChange = async (carId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('carId', carId);
      formData.append('status', newStatus);

      const response = await fetch(`${API_BASE_URL}/update_car.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update car status');
      }

      // Update the local state
      setCars(cars.map(car =>
        car.id === carId ? { ...car, status: newStatus } : car
      ));
      setSearchResults(searchResults.map(car =>
        car.id === carId ? { ...car, status: newStatus } : car
      ));
      setSuccess('Car status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditModal = (car) => {
    setSelectedCar(car);
    setFormData({
      title: car.title || '',
      price: car.price ? car.price.replace(/[^0-9.]/g, '') : '',
      category: car.category || '',
      brand: car.brand || '',
      variant: car.variant || '',
      mileage: car.mileage || '',
      transmission: car.transmission || '',
      condition: car.condition || '',
      seating: car.seating || '',
      chassis: car.chassis || '',
      fuel_type: car.fuel_type || '',
      issues: car.issues || '',
      status: car.status || 'available'
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (car) => {
    setSelectedCarDetails(car);
    setShowDetailsModal(true);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm) {
      const results = cars.filter(car =>
        car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase()) || // Assuming there's a 'model' field
        car.variant.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(cars); // If search term is empty, show all cars
    }
  };

  const sortData = (data, key) => {
    if (!key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle price specially since it's stored as a string with currency symbol
      if (key === 'price') {
        aValue = parseFloat(a[key].replace(/[^0-9.]/g, ''));
        bValue = parseFloat(b[key].replace(/[^0-9.]/g, ''));
      } else {
        // Convert to lowercase for string comparison
        aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
        bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const sortedCars = React.useMemo(() => {
    return sortData(searchResults, sortConfig.key);
  }, [searchResults, sortConfig]);

  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = sortedCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(sortedCars.length / carsPerPage);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 sm:gap-0 px-4">
      <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
        Showing {indexOfFirstCar + 1} to {Math.min(indexOfLastCar, sortedCars.length)} of {sortedCars.length} entries
      </div>
      <div className="flex space-x-2 order-1 sm:order-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Next
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Car Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            Add New Car
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            placeholder="Search by title, brand, model, variant"
            className="flex-1 w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base"
            >
              Search
            </button>
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setSearchResults(cars); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm sm:text-base"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('title')}
                  >
                    Title {getSortIndicator('title')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('price')}
                  >
                    Price {getSortIndicator('price')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('brand')}
                  >
                    Brand {getSortIndicator('brand')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('status')}
                  >
                    Status {getSortIndicator('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{car.title}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₱{typeof car.price === 'string' ? parseFloat(car.price.replace(/[^0-9.]/g, '')).toLocaleString() : car.price.toLocaleString()}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{car.brand}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`text-sm rounded px-2 py-1 ${
                        car.status === 'available' ? 'bg-green-100 text-green-800' :
                          car.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => openDetailsModal(car)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => openEditModal(car)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Car Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-bold mb-4">Add New Car</h2>
                <form onSubmit={handleAddCar}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Variant</label>
                      <input
                        type="text"
                        name="variant"
                        value={formData.variant}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mileage</label>
                      <input
                        type="text"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Chassis Number</label>
                      <input
                        type="text"
                        name="chassis"
                        value={formData.chassis}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transmission</label>
                      <select
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Transmission</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                      <select
                        name="fuel_type"
                        value={formData.fuel_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="gasoline">Gasoline</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Condition</label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Seating Capacity</label>
                      <input
                        type="number"
                        name="seating"
                        value={formData.seating}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Issues</label>
                      <textarea
                        name="issues"
                        value={formData.issues}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                        placeholder="Describe any issues or problems with the car"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Images</label>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        accept="image/*"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 mr-2"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Add Car
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Car Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-bold mb-4">Edit Car</h2>
                <form onSubmit={handleEditCar}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Variant</label>
                      <input
                        type="text"
                        name="variant"
                        value={formData.variant}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mileage</label>
                      <input
                        type="text"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Chassis Number</label>
                      <input
                        type="text"
                        name="chassis"
                        value={formData.chassis}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transmission</label>
                      <select
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Transmission</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                      <select
                        name="fuel_type"
                        value={formData.fuel_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="gasoline">Gasoline</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Condition</label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Seating Capacity</label>
                      <input
                        type="number"
                        name="seating"
                        value={formData.seating}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 mr-2"
                        onClick={() => setShowEditModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedCarDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Car Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Title</p>
                  <p className="text-gray-600">{selectedCarDetails.title}</p>
                </div>
                <div>
                  <p className="font-semibold">Price</p>
                  <p className="text-gray-600">₱{typeof selectedCarDetails.price === 'string' ? 
                    parseFloat(selectedCarDetails.price.replace(/[^0-9.]/g, '')).toLocaleString() : 
                    selectedCarDetails.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Category</p>
                  <p className="text-gray-600">{selectedCarDetails.category}</p>
                </div>
                <div>
                  <p className="font-semibold">Brand</p>
                  <p className="text-gray-600">{selectedCarDetails.brand}</p>
                </div>
                <div>
                  <p className="font-semibold">Variant</p>
                  <p className="text-gray-600">{selectedCarDetails.variant}</p>
                </div>
                <div>
                  <p className="font-semibold">Mileage</p>
                  <p className="text-gray-600">{selectedCarDetails.mileage}</p>
                </div>
                <div>
                  <p className="font-semibold">Transmission</p>
                  <p className="text-gray-600 capitalize">{selectedCarDetails.transmission}</p>
                </div>
                <div>
                  <p className="font-semibold">Condition</p>
                  <p className="text-gray-600 capitalize">{selectedCarDetails.condition}</p>
                </div>
                <div>
                  <p className="font-semibold">Seating Capacity</p>
                  <p className="text-gray-600">{selectedCarDetails.seating}</p>
                </div>
                <div>
                  <p className="font-semibold">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    selectedCarDetails.status === 'available' ? 'bg-green-100 text-green-800' :
                    selectedCarDetails.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedCarDetails.status}
                  </span>
                </div>
                {/* Details Modal content - add these inside the grid grid-cols-2 gap-4 div */}
                <div>
                  <p className="font-semibold">Chassis Number</p>
                  <p className="text-gray-600">{selectedCarDetails.chassis}</p>
                </div>
                <div>
                  <p className="font-semibold">Fuel Type</p>
                  <p className="text-gray-600 capitalize">{selectedCarDetails.fuel_type}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">Issues</p>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedCarDetails.issues || 'No issues reported'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Component */}
        <Pagination />
      </div>
    </div>
  );
};

export default CarManagement;