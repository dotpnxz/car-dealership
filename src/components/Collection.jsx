import React, { useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import honeycomb from "../assets/honeycomb.png";
import homecar from "../assets/home-car.png";
import XLEfront from "../assets/Toyota/XLE/XLE_front.JPEG";
import XLE1 from "../assets/Toyota/XLE/XLE1.JPEG";
import XLE2 from "../assets/Toyota/XLE/XLE2.JPEG";
import XLE3 from "../assets/Toyota/XLE/XLE3.JPEG";
import XLE4 from "../assets/Toyota/XLE/XLE4.JPEG";
import XLE5 from "../assets/Toyota/XLE/XLE5.JPEG";
import XLE6 from "../assets/Toyota/XLE/XLE6.JPEG";
import XLE7 from "../assets/Toyota/XLE/XLE7.JPEG";

import { Link } from "react-router-dom";

const images = [
  // Toyota
  { src: XLEfront, title: "2022 Toyota Vios XLE", price: "₱1,200,000.00", category: "SUV", brand: "Toyota", 
  variant: "2.4 G", mileage: "15,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater",
   images: [XLE1, XLE2, XLE3, XLE4, XLE5, XLE6, XLE7] },
  { src: homecar, title: "2021 Toyota Innova E (Automatic)", price: "₱650,000.00", category: "Sedan", brand: "Toyota",
  variant: "1.3 E", mileage: "10,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },
  { src: homecar, title: "2019 Toyota Hiace Commuter", price: "₱950,000.00", category: "MPV", brand: "Toyota",
  variant: "2.8 V", mileage: "20,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },
  
  // Suzuki
  { src: homecar, title: "2024 Suzuki Dzire GL", price: "₱750,000.00", category: "MPV", brand: "Suzuki",
     variant: "1.5 GL", mileage: "12,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },
  { src: homecar, title: "2023 Suzuki Carry", price: "₱1,100,000.00", category: "SUV", brand: "Suzuki", 
    variant: "1.4 GLX", mileage: "18,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },
  { src: homecar, title: "2019 Suzuki Carry", price: "₱1,100,000.00", category: "SUV", brand: "Suzuki", 
    variant: "1.4 GLX", mileage: "18,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },

  // Nissan
  { src: homecar, title: "2024 Nissan Livina VL", price: "₱950,000.00", category: "Truck", brand: "Nissan", 
    variant: "2.5 Calibre", mileage: "25,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },
  { src: homecar, title: "2023 Nissan Livina VE", price: "₱1,300,000.00", category: "SUV", brand: "Nissan", 
    variant: "2.5 VL", mileage: "15,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },
  { src: homecar, title: "2018 Nissan Juke", price: "₱1,300,000.00", category: "SUV", brand: "Nissan", 
    variant: "2.5 VL", mileage: "15,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },

  // Mitsubishi
  { src: homecar, title: "2023 Mitsubishi Mirage GLS", price: "₱1,100,000.00", category: "SUV", brand: "Mitsubishi", variant: "2.4 GLS", mileage: "20,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },

  // Hyundai
  { src: homecar, title: "2023 Hyundai Stargazer GL", price: "₱1,100,000.00", category: "SUV", brand: "Hyundai", 
    variant: "1.6 GL", mileage: "18,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },
  { src: homecar, title: "2023 Hyundai Creta 2.5 GL", price: "₱1,200,000.00", category: "Van", brand: "Hyundai", 
    variant: "2.5 CRDi", mileage: "30,000KM", transmission: "Automatic", condition: "Used", seating: "12 seater", images: [homecar, homecar] },

  // Honda
  { src: homecar, title: "2019 Honda City VX", price: "₱875,000.00", category: "Sedan", brand: "Honda", 
    variant: "1.8 E", mileage: "12,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },
  { src: homecar, title: "2016 Honda CR-V", price: "₱1,400,000.00", category: "SUV", brand: "Honda", 
    variant: "1.6 S", mileage: "15,000KM", transmission: "Automatic", condition: "Used", seating: "5 seater", images: [homecar, homecar] },

  // Ford
  { src: homecar, title: "2019 Ford Ranger XLT", price: "₱1,300,000.00", category: "SUV", brand: "Ford", 
    variant: "2.0 Titanium", mileage: "20,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },
];

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
  const itemsPerPage = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch cars from the database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('http://localhost/car-dealership/api/get_cars.php', {
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
            const imageResponse = await fetch(`http://localhost/car-dealership/api/get_car_images.php?car_id=${car.id}`, {
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
          const response = await fetch(`http://localhost/car-dealership/api/get_car_images.php?car_id=${selectedCar.id}`, {
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

  return (
    <div id="collection" className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center relative bottom-10">
        <div className="w-[70%] max-w-[90rem] h-[40rem] bg-white flex flex-col items-start justify-start rounded-[1rem] shadow-lg p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 relative left-[35rem]">Car Listings</h2>

          <div className="flex flex-wrap items-center gap-4 justify-between w-full px-8 mb-6">
            <div className="flex flex-wrap items-center gap-4 relative left-[3rem]">
              {categories.map(category => (
                <button key={category} onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg text-lg font-semibold transition whitespace-nowrap ${selectedCategory === category ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                  {category}
                </button>
              ))}

              {/* Brand Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition flex items-center space-x-2"
                >
                  <span>{selectedBrand === "All" ? "Brands" : selectedBrand}</span>
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

              {/* Sort Button */}
              <button
                onClick={toggleSortOrder}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg shadow-md transition"
              >
                <span>Sort</span> 
                <span>{sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}</span>
              </button>
            </div>

            {/* Search Bar aligned right */}
            <div className="relative right-[3rem]">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-5 py-2 pl-5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1"
              />
              <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
            </div>
          </div>

          {/* Car Grid */}
          <div className="grid grid-cols-3 gap-6 w-full px-8">
            {currentImages.length > 0 ? (
              currentImages.map((car, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center cursor-pointer" 
                  onClick={() => handleCarClick(car)}
                >
                  <img 
                    src={car.primaryImage || honeycomb} 
                    alt={car.title} 
                    className="w-[80%] h-[10rem] object-cover rounded-lg shadow-md hover:scale-105 transition duration-300" 
                    style={{ objectPosition: 'center 50%' }}
                    onError={(e) => {
                      console.error('Error loading image:', car.primaryImage);
                      e.target.src = honeycomb;
                    }}
                  />
                  <p className="mt-2 text-lg font-semibold">{car.title}</p>
                  <p className="text-red-500 font-bold">{car.price}</p>
                </div>
              ))
            ) : (
              <p className="flex justify-center text-gray-500 text-lg col-span-3 relative top-[10rem]">
                <Link to="/recommendation" className="hover:text-blue-500">Didn't find what you're looking for? We'll let you know once it becomes available! (Click here)</Link>
              </p>
            )}
          </div>

          {/* Car Details Modal */}
          {isModalOpen && selectedCar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedCar.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="font-semibold">{selectedCar.price}</p>
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
                        <p className="text-gray-600">Transmission</p>
                        <p className="font-semibold">{selectedCar.transmission}</p>
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        onClick={handleCloseModal}
                      >
                        Close
                      </button>
                      <Link to="/reservenow" state={{ carId: selectedCar?.id }}>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                          Reserve Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2 relative bottom-[3rem]">
        <button onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition">
          Prev
        </button>
        <span className="text-lg font-semibold">Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition">
          Next
        </button>
      </div>
    </div>
  );
};

export default Collection;
