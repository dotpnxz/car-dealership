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
        transmission: '',
        condition: '',
        seating: '',
        status: 'available'
    });
    const [images, setImages] = useState([]);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const response = await fetch('http://localhost/car-dealership/api/get_cars.php', {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setCars(data);
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

            const response = await fetch('http://localhost/car-dealership/api/add_car.php', {
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
                    transmission: '',
                    condition: '',
                    seating: '',
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

            const response = await fetch('http://localhost/car-dealership/api/update_car.php', {
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
                const response = await fetch('http://localhost/car-dealership/api/delete_car.php', {
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

            const response = await fetch('http://localhost/car-dealership/api/update_car.php', {
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
            setSuccess('Car status updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    const openEditModal = (car) => {
        console.log('Opening edit modal for car:', car); // Debug log
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
            status: car.status || 'available'
        });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Car Management</h1>
                    <button
                        onClick={() => {
                            setShowAddModal(true);
                            setFormData({
                                title: '',
                                price: '',
                                category: '',
                                brand: '',
                                variant: '',
                                mileage: '',
                                transmission: '',
                                condition: '',
                                seating: '',
                                status: 'available'
                            });
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add New Car
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cars.map((car) => (
                                <tr key={car.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{car.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">₱{typeof car.price === 'string' ? parseFloat(car.price.replace(/[^0-9.]/g, '')).toLocaleString() : car.price.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{car.brand}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm rounded px-2 py-1 ${
                                            car.status === 'available' ? 'bg-green-100 text-green-800' :
                                            car.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {car.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(car)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCar(car.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Car Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
                                        <label className="block text-sm font-medium text-gray-700">Transmission</label>
                                        <input
                                            type="text"
                                        name="transmission"
                                        value={formData.transmission}
                                        onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        />
                                </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                                        <input
                                            type="text"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        />
                                </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Seating</label>
                                    <input
                                        type="text"
                                        name="seating"
                                        value={formData.seating}
                                        onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Images</label>
                                    <input
                                        type="file"
                                            multiple
                                        onChange={handleFileChange}
                                            className="mt-1 block w-full"
                                        accept="image/*"
                                    />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Add Car
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                            <h2 className="text-2xl font-bold mb-4">Edit Car</h2>
                            <form onSubmit={handleEditCar}>
                                <div className="grid grid-cols-2 gap-4">
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
                                        <label className="block text-sm font-medium text-gray-700">Transmission</label>
                                        <input
                                            type="text"
                                            name="transmission"
                                            value={formData.transmission}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                                        <input
                                            type="text"
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Seating</label>
                                        <input
                                            type="text"
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
                                            <option value="acquired">Acquired</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedCar(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarManagement; 