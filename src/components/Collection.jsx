import React, { useState } from "react";
import { Search } from "lucide-react";
import honeycomb from "../assets/honeycomb.png";
import homecar from "../assets/home-car.png";

const images = [
  { src: homecar, title: "Mitsubishi 2015", price: "₱865,000.00", category: "SUV", brand: "Mitsubishi" },
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredImages = images.filter(car => 
    (selectedCategory === "All" || car.category === selectedCategory) &&
    (selectedBrand === "All" || car.brand === selectedBrand) &&
    car.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

  return (
    <div id="collection" className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-center" style={{ backgroundImage: `url(${honeycomb})` }}>
      <div className="w-full flex justify-center relative bottom-10">
        <div className="w-[70%] max-w-[90rem] h-auto bg-white flex flex-col items-center justify-center rounded-[1rem] shadow-lg p-6">

          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Collection</h2>

          <div className="flex items-center space-x-4 mb-6 w-full pl-[5rem]">
            {["All", "SUV", "Truck", "Cars & Minivan"].map(category => (
                <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg text-lg font-semibold transition whitespace-nowrap ${
                    selectedCategory === category 
                    ? "bg-red-500 text-white" 
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                     }`}
                >
                {category}
                </button>
            ))}
            
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition flex items-center space-x-2"
                >
                    <span>{selectedBrand}</span>
                    <span>▼</span>
                </button>
                
                {isOpen && (
                    <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {["All", "Toyota", "Mitsubishi", "Nissan", "Hyundai", "Honda", "Ford", "Mazda"].map(brand => (
                        <button 
                        key={brand}
                        onClick={() => { setSelectedBrand(brand); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 transition"
                        >
                        {brand}
                        </button>
                    ))}
                    </div>
                )}
                </div>

                {/* Search bar */}
            <div className="flex justify-end w-full pr-[4.5rem]">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-5 py-2 pl-5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 "
                />
                <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full px-8">
            {currentImages.length > 0 ? (
              currentImages.map((car, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img src={car.src} alt={car.title} className="w-[80%] h-[10rem] object-cover rounded-lg shadow-md hover:scale-105 transition duration-300" />
                  <p className="mt-2 text-lg font-semibold">{car.title}</p>
                  <p className="text-red-500 font-bold">{car.price}</p>
                </div>
              ))
            ) : (
              <p className="flex justify-center text-gray-500 text-lg col-span-3">No cars available.</p>
            )}
          </div>

          <div className="flex justify-center items-center mt-6 space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition"
            >
              Prev
            </button>
            <span className="text-lg font-semibold">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collection;
