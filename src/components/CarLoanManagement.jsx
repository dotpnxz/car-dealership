import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed html2canvas and jspdf imports
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// Import the utility function
import { handleDownloadPdf } from '../utils/pdfGenerator';

const CarLoanManagement = () => {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [requirementImages, setRequirementImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [imageError, setImageError] = useState(null);

    // Ref for the modal content is no longer needed for this PDF generation method
    // const modalContentRef = useRef();

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';

    const ASSETS_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership'
        : 'https://mjautolove.site';

    useEffect(() => {
        fetchRequirements();
    }, []);

    const fetchRequirements = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/get_loan_requirements.php`, {
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch requirements');
            }
            const data = await response.json();
            setRequirements(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = async (requirementId) => {
        setLoadingImages(true);
        setImageError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/get_requirements_images.php?loan_requirement_id=${requirementId}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch images');
            }
            const data = await response.json();
            console.log('Image API response data:', data);

            if (data.success && Array.isArray(data.images)) {
                setRequirementImages(data.images);
            } else {
                throw new Error(data.error || 'Invalid image data format received');
            }

        } catch (err) {
            setImageError(err.message);
        } finally {
            setLoadingImages(false);
        }
    };

    const handleViewDetails = (requirement) => {
        setSelectedRequirement(requirement);
        fetchImages(requirement.id); // Fetch images for the selected requirement
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequirement(null);
        setRequirementImages([]);
        setImageError(null);
    };

    // Call the imported utility function with the necessary data
    const handleDownloadPdfClick = () => {
        if (selectedRequirement) {
             // Pass selectedRequirement, requirementImages, and ASSETS_BASE_URL
            handleDownloadPdf(selectedRequirement, requirementImages, ASSETS_BASE_URL);
        } else {
            console.error('No requirement selected for PDF download.');
        }
    };

    const handleApprove = async (requirementId) => {
        console.log('Approve requirement:', requirementId);
        try {
            const response = await fetch(`${API_BASE_URL}/update_loan_status.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    requirement_id: requirementId,
                    status: 'approved'
                })
            });
    
            const data = await response.json();
    
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to approve requirement');
            }
    
            setRequirements(prevRequirements => 
                prevRequirements.map(req => 
                    req.id === requirementId 
                        ? { ...req, car_loan_status: 'approved' }
                        : req
                )
            );
            if(selectedRequirement && selectedRequirement.id === requirementId) {
                setSelectedRequirement(prev => ({ ...prev, car_loan_status: 'approved' }));
            }
            alert('Requirement approved successfully!');
        } catch (err) {
            console.error('Error approving requirement:', err);
            alert(err.message || 'Failed to approve requirement.');
        }
    };
    
    const handleReject = async (requirementId) => {
        console.log('Reject requirement:', requirementId);
        try {
            const response = await fetch(`${API_BASE_URL}/update_loan_status.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    requirement_id: requirementId,
                    status: 'rejected'
                })
            });
    
            const data = await response.json();
    
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to reject requirement');
            }
    
            setRequirements(prevRequirements => 
                prevRequirements.map(req => 
                    req.id === requirementId 
                        ? { ...req, car_loan_status: 'rejected' }
                        : req
                )
            );
             if(selectedRequirement && selectedRequirement.id === requirementId) {
                setSelectedRequirement(prev => ({ ...prev, car_loan_status: 'rejected' }));
            }
            alert('Requirement rejected successfully!');
        } catch (err) {
            console.error('Error rejecting requirement:', err);
            alert(err.message || 'Failed to reject requirement.');
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">All Submitted Car Loan Requirements</h2>
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Car Title</th>
                                <th className="py-3 px-4 text-left">Date Submitted</th>
                                <th className="py-3 px-4 text-left">Car Loan Status</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">No requirements submitted yet.</td>
                                </tr>
                            ) : (
                                requirements.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 border-b">{req.name}</td>
                                        <td className="py-3 px-4 border-b">{req.car_title}</td>
                                        <td className="py-3 px-4 border-b">{req.date_submitted ? new Date(req.date_submitted).toLocaleDateString() : 'N/A'}</td>
                                        <td className="py-3 px-4 border-b">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                req.car_loan_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                req.car_loan_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {req.car_loan_status ? req.car_loan_status.charAt(0).toUpperCase() + req.car_loan_status.slice(1) : 'Under Review'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                            <button 
                                                onClick={() => handleViewDetails(req)}
                                                className="text-blue-600 hover:text-blue-800 mr-2"
                                            >
                                                View Details
                                            </button>
                                            {req.car_loan_status === 'under review' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(req.id)}
                                                        className="text-green-600 hover:text-green-800 mr-2"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(req.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {isModalOpen && selectedRequirement && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="my-modal">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center"> {/* Removed ref here */}
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Requirement Details</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500 text-left"><strong>Name:</strong> {selectedRequirement.name}</p>
                                <p className="text-sm text-gray-500 text-left"><strong>Car Title:</strong> {selectedRequirement.car_title}</p>
                                <p className="text-sm text-gray-500 text-left"><strong>Date Submitted:</strong> {selectedRequirement.date_submitted ? new Date(selectedRequirement.date_submitted).toLocaleDateString() : 'N/A'}</p>
                                <p className="text-sm text-gray-500 text-left"><strong>Status:</strong> {selectedRequirement.car_loan_status ? selectedRequirement.car_loan_status.charAt(0).toUpperCase() + selectedRequirement.car_loan_status.slice(1) : 'Under Review'}</p>
                                
                                <h4 className="base font-medium text-gray-900 mt-4">Uploaded Images:</h4>
                                {loadingImages ? (
                                    <div className="flex justify-center items-center mt-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : imageError ? (
                                    <p className="text-red-500 text-sm mt-4">{imageError}</p>
                                ) : requirementImages.length === 0 ? (
                                    <p className="text-gray-500 text-sm mt-4">No images uploaded.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        {requirementImages.map((image, index) => {
                                            // Construct the full image URL using the assets base URL
                                            const imageUrl = `${ASSETS_BASE_URL}/${image.file_path}`;
                                            console.log('Attempting to load image from URL:', imageUrl);
                                            return (
                                                <div key={image.id || index} className="relative w-full h-32 overflow-hidden rounded-lg shadow-md">
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={`Requirement Image ${index + 1}`} 
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                            </div>
                            <div className="items-center px-4 py-3">
                                {/* Download PDF Button */}
                                <button
                                    className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                                    onClick={handleDownloadPdfClick}
                                >
                                    Download as PDF
                                </button>
                                <button
                                    id="ok-btn"
                                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarLoanManagement; 