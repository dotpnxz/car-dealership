import React, { useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import honeycomb from "../assets/honeycomb.png";
import { Link } from "react-router-dom";

const Collection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10; // Changed from 6 to 10 to show two complete rows of 5 cars
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('1'); // Add this for plan selection
  const [isReserveTypeModalOpen, setIsReserveTypeModalOpen] = useState(false);
  const [reserveType, setReserveType] = useState(null);

  const formatPrice = (price) => {
    const numericPrice = price.replace(/[₱,]/g, '');
    return `₱${parseFloat(numericPrice).toLocaleString()}`;
  };

  // Determine API base URL based on environment
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  // Fetch cars from the database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_cars.php`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch cars');
        }
        
        const data = await response.json();
        console.log('Fetched cars:', data);
        
        // Fetch primary images for each car
        const carsWithImages = await Promise.all(data.map(async (car) => {
          try {
            const imageResponse = await fetch(`${API_BASE_URL}/get_car_images.php?car_id=${car.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (imageResponse.ok) {
              const images = await imageResponse.json();
              console.log(`Images for car ${car.id}:`, images);
              
              // Use the URL directly as it's already formatted in the API
              const primaryImage = images.find(img => img.is_primary)?.url || images[0]?.url;
              console.log(`Primary image for car ${car.id}:`, primaryImage);
              
              return {
                ...car,
                primaryImage: primaryImage || null
              };
            }
            return car;
          } catch (err) {
            console.error('Error fetching car images:', err);
            return car;
          }
        }));
        
        setCars(carsWithImages);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Fetch car images when a car is selected
  useEffect(() => {
    const fetchCarImages = async () => {
      if (selectedCar && !selectedCar.images) {  // Only fetch if we don't have images yet
        try {
          const response = await fetch(`${API_BASE_URL}/get_car_images.php?car_id=${selectedCar.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch car images');
          }
          
          const images = await response.json();
          console.log('Selected car images:', images);
          
          // Update the selected car with images
          setSelectedCar(prev => ({
            ...prev,
            images: images,
            primaryImage: images.find(img => img.is_primary)?.url || images[0]?.url || null
          }));
        } catch (err) {
          console.error('Error fetching car images:', err);
        }
      }
    };

    fetchCarImages();
  }, [selectedCar?.id]); // Only depend on the car ID

  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);

  const parsePrice = (priceStr) => {
    return parseFloat(priceStr.replace(/[₱,]/g, ""));
  };

  const sortImages = (carList) => {
    if (sortOrder === "asc") {
      return [...carList].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortOrder === "desc") {
      return [...carList].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    return carList;
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredImages = sortImages(
    cars.filter(car =>
      (selectedCategory === "All" || car.category === selectedCategory) &&
      (selectedBrand === "All" || car.brand === selectedBrand) &&
      car.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCarClick = useCallback((car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Small delay before clearing selectedCar to ensure smooth transition
    setTimeout(() => {
      setSelectedCar(null);
    }, 300);
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
    setSelectedImage(null);
  };

  const calculateInstallment = (price, years) => {
    const plans = {
      '1': { monthly: 0.0126, annual: 0.1584 },
      '2': { monthly: 0.0152, annual: 0.1824 },
      '3': { monthly: 0.0136, annual: 0.1632 },
      '4': { monthly: 0.0131, annual: 0.1572 },
      '5': { monthly: 0.0132, annual: 0.1584 }
    };

    const downPayment = price * 0.20;
    const loanAmount = price - downPayment;
    const monthlyRate = plans[years].monthly;
    const numberOfMonths = years * 12;

    // Calculate monthly principal payment (without interest)
    const monthlyPrincipal = loanAmount / numberOfMonths;
    
    // Calculate first month's interest
    const firstMonthInterest = loanAmount * monthlyRate;
    
    // Total monthly payment is principal plus interest
    const monthlyPayment = monthlyPrincipal + firstMonthInterest;

    // Calculate total payment over the loan term
    const totalInterest = (monthlyRate * loanAmount * numberOfMonths);
    const totalPayment = loanAmount + totalInterest + downPayment;

    return {
      downPayment: downPayment.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
      monthlyPrincipal: monthlyPrincipal.toFixed(2),
      monthlyInterest: firstMonthInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      loanAmount: loanAmount.toFixed(2)
    };
  };

  const brands = ["All", ...new Set(cars.map(car => car.brand))];
  const categories = ["All", ...new Set(cars.map(car => car.category))];

  if (loading) {
    return (
      <div className="w-full h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Cars</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Reservation modal handlers (must be defined before return)
  const handleReserveClick = (e) => {
    e.preventDefault();
    if (!selectedCar) return;
    setIsReserveTypeModalOpen(true);
  };

  const handleCloseReserveTypeModal = () => {
    setIsReserveTypeModalOpen(false);
  };

  return (
    <div id="collection" className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-2 sm:p-0" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center">
        <div className="w-[95%] sm:w-[90%] max-w-[120rem] h-auto bg-white flex flex-col rounded-[1rem] shadow-lg p-3 sm:p-6 overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Car Listings</h2>

          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full px-2 sm:px-8 mb-4 sm:mb-6">
            {/* Categories Container */}
            <div className="w-full sm:w-auto overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
              <div className="flex items-center gap-2 sm:gap-4">
                {categories.map(category => (
                  <button key={category} onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition flex-shrink-0
                    ${selectedCategory === category ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters Row - Updated positioning */}
            <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
              {/* Brand Dropdown */}
              <div className="relative w-1/3 sm:w-auto">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full px-3 sm:px-6 py-1.5 sm:py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition flex items-center justify-between"
                >
                  <span className="truncate mr-2">{selectedBrand === "All" ? "Brands" : selectedBrand}</span>
                  <span>▼</span>
                </button>

                {isOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 transition"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Bar - Updated positioning */}
              <div className="relative w-2/3 sm:w-auto">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-3 sm:px-5 py-1.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>
          </div>

          {/* Car Grid - Updated for better sizing */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 w-full px-2 sm:px-8">
              {currentImages.length > 0 ? (
                currentImages.map((car, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center cursor-pointer bg-white rounded-lg p-2 hover:shadow-lg transition duration-300" 
                    onClick={() => handleCarClick(car)}
                  >
                    <div className="w-full aspect-[4/3] relative">
                      <img 
                        src={car.primaryImage || honeycomb} 
                        alt={car.title} 
                        className="w-full h-full object-cover rounded-lg" 
                        style={{ objectPosition: 'center 50%' }}
                        onError={(e) => {
                          e.target.src = honeycomb;
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm sm:text-base font-semibold text-center line-clamp-2">{car.title}</p>
                    <p className="text-red-500 font-bold text-sm sm:text-base">{formatPrice(car.price)}</p>
                  </div>
                ))
              ) : (
                <p className="flex justify-center text-gray-500 text-lg col-span-3 relative top-[10rem]">
                  <Link to="/recommendation" className="hover:text-blue-500">Didn't find what you're looking for? We'll let you know once it becomes available! (Click here)</Link>
                </p>
              )}
            </div>
          </div>

          {/* Car Details Modal */}
          {isModalOpen && selectedCar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-6">
              <div className="bg-white rounded-lg p-3 sm:p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">{selectedCar.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Car Images */}
                  <div className="space-y-4">
                    {selectedCar.images && selectedCar.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCar.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`${selectedCar.title} - Image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(image)}
                            onError={(e) => {
                              e.target.src = honeycomb;
                              console.error('Error loading image:', image.url);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-200 h-48 flex items-center justify-center rounded-lg">
                        <p className="text-gray-500">No images available</p>
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-semibold">{formatPrice(selectedCar.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Brand</p>
                        <p className="font-semibold">{selectedCar.brand}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Category</p>
                        <p className="font-semibold">{selectedCar.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Variant</p>
                        <p className="font-semibold">{selectedCar.variant}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mileage</p>
                        <p className="font-semibold">{selectedCar.mileage}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Chassis Number</p>
                        <p className="font-semibold">{selectedCar.chassis}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Transmission</p>
                        <p className="font-semibold">{selectedCar.transmission}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fuel Type</p>
                        <p className="font-semibold capitalize">{selectedCar.fuel_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Condition</p>
                        <p className="font-semibold">{selectedCar.condition}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Seating</p>
                        <p className="font-semibold">{selectedCar.seating}</p>
                      </div>
                    </div>

                    {/* Issues Section */}
                    {selectedCar.issues && (
                      <div className="mt-4">
                        <p className="text-gray-600">Issues</p>
                        <p className="font-semibold whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-1">
                          {selectedCar.issues || 'No reported issues'}
                        </p>
                      </div>
                    )}

                    {/* Installment Calculator */}
                    <div className="mt-4 border-t pt-4">
                      <h3 className="text-xl font-bold mb-4">Installment Calculator</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="font-medium">Select Plan:</label>
                          <select
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2"
                          >
                            <option value="1">1 Year</option>
                            <option value="2">2 Years</option>
                            <option value="3">3 Years</option>
                            <option value="4">4 Years</option>
                            <option value="5">5 Years</option>
                          </select>
                        </div>

                        {selectedCar && (
                          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            {(() => {
                              const calculation = calculateInstallment(
                                parseFloat(selectedCar.price.replace(/[₱,]/g, '')),
                                parseInt(selectedPlan)
                              );
                              return (
                                <>
                                  <div>
                                    <p className="text-gray-600">Down Payment (20%)</p>
                                    <p className="font-semibold">{formatPrice(calculation.downPayment)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Loan Amount</p>
                                    <p className="font-semibold">{formatPrice(calculation.loanAmount)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-gray-600">Monthly Payment</p>
                                    <p className="font-semibold">{formatPrice(calculation.monthlyPayment)}</p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        onClick={handleCloseModal}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className={`bg-red-500 text-white px-4 py-2 rounded-lg transition ${
                          selectedCar?.status === 'reserved' 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-red-600'
                        }`}
                        disabled={selectedCar?.status === 'reserved'}
                        onClick={selectedCar?.status === 'reserved' ? undefined : handleReserveClick}
                      >
                        {selectedCar?.status === 'reserved' ? 'Reserved' : 'Reserve Now'}
                      </button>
                      <Link
                        to="/buynow"
                        state={{ car: selectedCar }}
                        className={`${
                          selectedCar?.status === 'reserved'
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                          disabled={selectedCar?.status === 'reserved'}
                        >
                          Buy Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Full-size Image Viewer Modal */}
                {isImageViewerOpen && selectedImage && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
                    onClick={handleCloseImageViewer}
                  >
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                      <img
                        src={selectedImage.url}
                        alt="Full size car image"
                        className="max-w-full max-h-[90vh] object-contain"
                      />
                      <button
                        onClick={handleCloseImageViewer}
                        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reserve Type Modal */}
          {isReserveTypeModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-center">Choose Reservation Type</h3>
                    <div className="flex flex-col gap-4">
                        <Link
                            to={`/reservenow`}
                            state={{ 
                                carId: selectedCar?.id, 
                                type: 'full',
                                car: selectedCar // Pass the full car object
                            }}
                            className={`${
                                selectedCar?.status === 'reserved'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }`}
                        >
                            <button
                                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                disabled={selectedCar?.status === 'reserved'}
                            >
                                Reservation Now, Full Price Later
                            </button>
                        </Link>
                        
                        <Link
                            to={`/reservenow`}
                            state={{ 
                                carId: selectedCar?.id, 
                                type: 'loan',
                                car: selectedCar // Pass the full car object
                            }}
                            className={`${
                                selectedCar?.status === 'reserved'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }`}
                        >
                            <button
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                disabled={selectedCar?.status === 'reserved'}
                            >
                                Reservation for Car Loan
                            </button>
                        </Link>

                        <button
                            className="mt-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                            onClick={() => setIsReserveTypeModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Pagination - Updated positioning */}
          <div className="flex justify-center items-center mt-4 py-4">
            <button 
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} 
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition text-sm sm:text-base"
            >
              Prev
            </button>
            <span className="text-base sm:text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* ... existing modals ... */}
    </div>
  );
};

export default Collection;