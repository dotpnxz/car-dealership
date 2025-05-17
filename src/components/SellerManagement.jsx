import React, { useState, useEffect } from 'react';

const SellerManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalImages, setModalImages] = useState({ carImages: [], idImage: null });
    const [fullSizeImage, setFullSizeImage] = useState(null);

    useEffect(() => {
        fetchAllApplications();
    }, []);

    const fetchAllApplications = async () => {
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
            console.log('Response data:', data); // For debugging

            if (!response.ok) {
                throw new Error(`Server error: ${data.message || response.statusText}`);
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch applications');
            }

            // Make sure the applications data is in the expected format
            setApplications(data.applications || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus} this application?`)) {
            try {
                const response = await fetch('http://localhost/car-dealership/api/update_application_status.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        applicationId: id,
                        status: newStatus 
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update status');
                }
                
                if (data.success) {
                    setApplications(prev => prev.map(app => 
                        app.id === id ? { ...app, status: newStatus } : app
                    ));
                    // Show success message
                    alert('Status updated successfully');
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                console.error('Error updating status:', err);
                alert(err.message || 'Failed to update status');
            }
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
                    body: JSON.stringify({ car_id: id })
                });

                // First check if response is ok
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Server response:', text);
                    throw new Error('Server error occurred');
                }

                const data = await response.json();

                if (data.success) {
                    setApplications(prev => prev.filter(app => app.id !== id));
                    alert('Car deleted successfully');
                } else {
                    throw new Error(data.message || 'Failed to delete car');
                }
            } catch (err) {
                console.error('Error details:', err);
                alert('Failed to delete car. Please check console for details.');
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

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    // First, update the table view to use a card layout on mobile
    return (
        <div className="min-h-screen bg-gray-100 p-2 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Seller Applications</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Mobile Card View */}
                <div className="block lg:hidden">
                    {applications.map(app => (
                        <div key={app.id} className="bg-white rounded-lg shadow-md mb-4 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold">{app.seller_name}</h3>
                                    <p className="text-sm text-gray-600">{app.brand} {app.model}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                    ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                                    {app.status}
                                </span>
                            </div>
                            
                            <div className="text-sm mb-3">
                                <p className="text-gray-600">
                                    Date: {new Date(app.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 border-t pt-3">
                                <button
                                    onClick={() => handleViewDetails(app)}
                                    className="text-blue-600 text-sm px-3 py-1 border border-blue-600 rounded-full"
                                >
                                    View Details
                                </button>
                                {app.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(app.id, 'approved')}
                                            className="text-green-600 text-sm px-3 py-1 border border-green-600 rounded-full"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(app.id, 'rejected')}
                                            className="text-red-600 text-sm px-3 py-1 border border-red-600 rounded-full"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(app.id)}
                                    className="text-red-600 text-sm px-3 py-1 border border-red-600 rounded-full"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app.seller_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app.brand}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app.model}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            ₱{app.asking_price ? 
                                                parseFloat(app.asking_price).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }) : 
                                                '0.00'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full
                                                ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(app)}
                                                className="text-blue-600 hover:text-blue-900 px-2"
                                            >
                                                View
                                            </button>
                                            {app.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(app.id, 'approved')}
                                                        className="text-green-600 hover:text-green-900 px-2"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(app.id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900 px-2"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(app.id)}
                                                className="text-red-600 hover:text-red-900 px-2"
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

            {/* Modal for car details */}
            {showModal && selectedCar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-2 sm:p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-6xl max-h-full overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-start border-b pb-4">
                                <h3 className="text-lg sm:text-xl font-bold">Car Details</h3>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mt-4">
                                {/* Car Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg border-b pb-2">Car Information</h4>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">USER ID:</span>
                                            <span>{selectedCar.user_id}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">BRAND:</span>
                                            <span>{selectedCar.brand}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">MODEL:</span>
                                            <span>{selectedCar.model}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">YEAR:</span>
                                            <span>{selectedCar.year}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">VARIANT:</span>
                                            <span>{selectedCar.variant}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">MILEAGE:</span>
                                            <span>{selectedCar.mileage}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">CHASSIS:</span>
                                            <span>{selectedCar.chassis}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">TRANSMISSION:</span>
                                            <span>{selectedCar.transmission}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">FUEL TYPE:</span>
                                            <span>{selectedCar.fuel_type}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">COLOR:</span>
                                            <span>{selectedCar.color}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">ISSUES:</span>
                                            <span>{selectedCar.issues}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">ASKING PRICE:</span>
                                            <span>
                                                ₱{selectedCar.asking_price ? 
                                                    parseFloat(selectedCar.asking_price).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }) : 
                                                    '0.00'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">IS FIRST OWNER:</span>
                                            <span>{selectedCar.is_first_owner === '1' || selectedCar.is_first_owner === 1 ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">IS REGISTERED OWNER:</span>
                                            <span>{selectedCar.is_registered_owner === '1' || selectedCar.is_registered_owner === 1 ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">HAS DOCUMENTS:</span>
                                            <span>{selectedCar.has_documents === '1' || selectedCar.has_documents === 1 ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">STATUS:</span>
                                            <span>{selectedCar.status}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">CREATED AT:</span>
                                            <span>{new Date(selectedCar.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">SELLER NAME:</span>
                                            <span>{selectedCar.seller_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">SELLER EMAIL:</span>
                                            <span>{selectedCar.seller_email}</span>
                                        </div>
                                        <div className="flex justify-between border-b py-2">
                                            <span className="text-gray-600">SELLER FULL NAME:</span>
                                            <span>{selectedCar.seller_full_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Images */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg border-b pb-2">Vehicle Images</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {modalImages.carImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={`http://localhost/car-dealership/uploads/selling_car_photos/${image.image_path}`}
                                                    alt={`View ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded cursor-pointer"
                                                    onClick={() => setFullSizeImage(`http://localhost/car-dealership/uploads/selling_car_photos/${image.image_path}`)}
                                                />
                                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                                    View {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full size image modal */}
            {fullSizeImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center p-2 z-50 cursor-pointer"
                    onClick={() => setFullSizeImage(null)}
                >
                    <img
                        src={fullSizeImage}
                        alt="Full size view"
                        className="max-w-full max-h-[90vh] object-contain"
                    />
                </div>
            )}
        </div>
    );
};

export default SellerManagement;