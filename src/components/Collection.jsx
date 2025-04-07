import React, { useState, useCallback } from "react";
import { Search } from "lucide-react";
import honeycomb from "../assets/honeycomb.png";
import homecar from "../assets/home-car.png";
import { Link } from "react-router-dom";

const images = [
  { src: homecar, title: "Mitsubishi 2015", price: "₱865,000.00", category: "SUV", brand: "Mitsubishi", variant: "1.5 GLS", mileage: "20,000KM", transmission: "Automatic", condition: "Used", seating: "7 seater", images: [homecar, homecar] },
  { src: homecar, title: "Toyota Fortuner", price: "₱1,200,000.00", category: "SUV", brand: "Toyota" },
  { src: homecar, title: "Nissan Navara", price: "₱950,000.00", category: "Truck", brand: "Nissan" },
  { src: homecar, title: "Hyundai Tucson", price: "₱1,100,000.00", category: "SUV", brand: "Hyundai" },
  { src: homecar, title: "Honda Civic", price: "₱875,000.00", category: "Cars & Minivan", brand: "Honda" },
  { src: homecar, title: "Ford Everest", price: "₱1,300,000.00", category: "SUV", brand: "Ford" },
  { src: homecar, title: "Mazda CX-5", price: "₱1,250,000.00", category: "SUV", brand: "Mazda" }
];

const Collection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(null);
  const itemsPerPage = 6;

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
    images.filter(car =>
      (selectedCategory === "All" || car.category === selectedCategory) &&
      (selectedBrand === "All" || car.brand === selectedBrand) &&
      car.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

  return (
    <div id="collection" className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center relative bottom-10">
      <div className="w-[70%] max-w-[90rem] h-[40rem] bg-white flex flex-col items-start justify-start rounded-[1rem] shadow-lg p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 relative left-[35rem]">Car Listings</h2>

          <div className="flex flex-wrap items-center gap-4 justify-between w-full px-8 mb-6">
            <div className="flex flex-wrap items-center gap-4 relative left-[3rem]">
              {["All", "SUV", "Truck", "Cars & Minivan"].map(category => (
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
                    {["All", "Toyota", "Mitsubishi", "Nissan", "Hyundai", "Honda", "Ford", "Mazda"].map((brand) => (
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
                <div key={index} className="flex flex-col items-center cursor-pointer" onClick={() => setSelectedCar(car)}>
                  <img src={car.src} alt={car.title} className="w-[80%] h-[10rem] object-cover rounded-lg shadow-md hover:scale-105 transition duration-300" />
                  <p className="mt-2 text-lg font-semibold">{car.title}</p>
                  <p className="text-red-500 font-bold">{car.price}</p>
                </div>
              ))
            ) : (
              <p className="flex justify-center text-gray-500 text-lg col-span-3 relative top-[10rem]">
                 <Link to="/recommendation" className="hover:text-blue-500">Didn’t find what you’re looking for? We’ll let you know once it becomes available! (Click here)</Link></p>
            )}
          </div>

          {/* Car Modal */}
          {selectedCar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[1000px] h-[500px] flex">
                <div className="grid grid-cols-2 gap-4 p-2 max-h-[300px] overflow-y-auto">
                  {selectedCar.images.map((image, index) => (
                    <div key={index} className="flex justify-center items-center">
                      <img src={image} alt={`Car Image ${index + 1}`} className="w-[200px] h-[150px] object-cover rounded-lg shadow-md" />
                    </div>
                  ))}
                </div>

                <div className="flex-1 flex flex-col justify-center items-start text-right relative bottom-[5rem] left-[5rem]">
                  <h2 className="text-2xl font-bold">{selectedCar.title}</h2>
                  <p>{selectedCar.price}</p>
                  <p>Variant: {selectedCar.variant}</p>
                  <p>Mileage: {selectedCar.mileage}</p>
                  <p>Transmission: {selectedCar.transmission}</p>
                  <p>Condition: {selectedCar.condition}</p>
                  <p>Seating Capacity: {selectedCar.seating}</p>

                  <div className="flex gap-2 mt-4 relative top-[9rem]">
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => setSelectedCar(null)}>
                      Close
                    </button>
                    <Link to="/reservenow" state={{ carTitle: selectedCar?.title }}>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
                        Reserve Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2 relative bottom-[3rem]">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition">
          Prev
        </button>
        <span className="text-lg font-semibold">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition">
          Next
        </button>
      </div>
    </div>
  );
};

export default Collection;
