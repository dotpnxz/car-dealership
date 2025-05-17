import React, { useState, useEffect } from 'react';

const MyCars = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalImages, setModalImages] = useState({ carImages: [], idImage: null });
    const [fullSizeImage, setFullSizeImage] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost/car-dealership/api/get_applications.php', {
                credentials: 'include',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Full response:', response);
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(`Server error: ${data.message || response.statusText}`);
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch applications');
            }

            setApplications(data.applications || []);
        } catch (err) {
            console.error('Detailed error:', {
                message: err.message,
                stack: err.stack
            });
            setError(`Error: ${err.message}`);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                const response = await fetch('http://localhost/car-dealership/api/delete_sellingcar.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ car_id: id }) // Changed from id to car_id
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Server response:', text);
                    throw new Error('Server error occurred');
                }

                const data = await response.json();
                
                if (data.success) {
                    // Remove the deleted car from the state
                    setApplications(prev => prev.filter(app => app.id !== id));
                    alert('Car deleted successfully');
                } else {
                    throw new Error(data.message || 'Failed to delete car');
                }
            } catch (err) {
                console.error('Error deleting application:', err);
                alert(err.message || 'Failed to delete car');
            }
        }
    };

    const handleViewDetails = async (application) => {
        setSelectedCar(application);
        setShowModal(true);
        try {
            const response = await fetch(
                `http://localhost/car-dealership/api/get_application_images.php?applicationId=${application.id}`,
                {
                    credentials: 'include',
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            const data = await response.json();
            if (data.success) {
                setModalImages({
                    carImages: data.carImages || [],
                    idImage: data.idImage || null
                });
            }
        } catch (err) {
            console.error('Error fetching images:', err);
        }
    };

    const handleImageClick = (imagePath) => {
        setFullSizeImage(imagePath);
    };

    const closeFullSizeImage = () => {
        setFullSizeImage(null);
    };

    const getImagePath = (image) => {
        const basePath = 'http://localhost/car-dealership';
        if (image.image_type === 'car') {
            return `${basePath}/uploads/selling_car_photos/${image.image_path}`;
        } else if (image.image_type === 'id') {
            return `${basePath}/uploads/valid_ID/${image.image_path}`;
        }
        return null;
    };

    if (loading) return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">My Car Applications</h2>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                    {applications.map(app => (
                        <div key={app.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold">{app.brand} {app.model}</h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                    ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleViewDetails(app)}
                                    className="flex-1 text-blue-600 text-sm px-3 py-1.5 border border-blue-600 rounded-full"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => handleDelete(app.id)}
                                    className="flex-1 text-red-600 text-sm px-3 py-1.5 border border-red-600 rounded-full"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto relative">
                        <div className="min-w-full inline-block align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm">{app.brand}</td>
                                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm">{app.model}</td>
                                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm">
                                                ₱{app.asking_price ? 
                                                    parseFloat(app.asking_price).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }) : 
                                                    '0.00'
                                                }
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(app)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(app.id)}
                                                    className="text-red-600 hover:text-red-900 ml-3"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Updated Modal for better mobile support */}
            {showModal && selectedCar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto p-4">
                    <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl">
                        {/* Modal Header */}
                        <div className="border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">Car Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Car Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Car Information</h3>
                                    <div className="space-y-3">
                                        {Object.entries(selectedCar).map(([key, value]) => {
                                            // Skip certain fields
                                            if (['id', 'image_path', 'status_history'].includes(key)) {
                                                return null;
                                            }

                                            // Format the display value
                                            let displayValue = value;
                                            if (key === 'is_first_owner' || key === 'is_registered_owner' || key === 'has_documents') {
                                                displayValue = value === '1' || value === 1 ? 'Yes' : 'No';
                                            } else if (key === 'asking_price') {
                                                displayValue = `₱${parseFloat(value).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}`;
                                            }

                                            return (
                                                <div key={key} className="flex border-b border-gray-200 pb-2">
                                                    <span className="text-gray-600 uppercase w-1/2">
                                                        {key.replace(/_/g, ' ')}:
                                                    </span>
                                                    <span className="text-gray-900 font-medium">
                                                        {displayValue}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Vehicle Images and Valid ID Section */}
                                <div className="space-y-6">
                                    {/* Vehicle Images */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Vehicle Images</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {modalImages.carImages.map((image, index) => (
                                                <div key={image.id} className="relative">
                                                    <img
                                                        src={getImagePath(image)}
                                                        alt={`View ${index + 1}`}
                                                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                                        onClick={() => handleImageClick(getImagePath(image))}
                                                    />
                                                    <p className="mt-1 text-center text-sm text-gray-600">
                                                        View {index + 1}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Valid ID Section */}
                                    {modalImages.idImage && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Valid ID</h3>
                                            <div className="relative">
                                                <img
                                                    src={getImagePath(modalImages.idImage)}
                                                    alt="Valid ID"
                                                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                                    onClick={() => handleImageClick(getImagePath(modalImages.idImage))}
                                                />
                                                <p className="mt-1 text-center text-sm text-gray-600">
                                                    Valid ID
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Size Image Modal - Updated for mobile */}
            {fullSizeImage && (
                <div 
                    className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-2"
                    onClick={closeFullSizeImage}
                >
                    <img
                        src={fullSizeImage}
                        alt="Full size view"
                        className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={closeFullSizeImage}
                        className="absolute top-4 right-4 text-white p-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyCars;
