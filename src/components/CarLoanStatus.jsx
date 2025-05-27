import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CarLoanStatus = () => {
    const { reservationId } = useParams(); // Get reservationId from URL
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';

    useEffect(() => {
        fetchRequirements();
    }, [reservationId]); // Rerun effect when reservationId changes

    const fetchRequirements = async () => {
        setLoading(true);
        try {
            // Include reservationId in the API call if it exists
            const url = reservationId 
                ? `${API_BASE_URL}/get_loan_requirements.php?reservation_id=${reservationId}`
                : `${API_BASE_URL}/get_loan_requirements.php`; // Fallback for displaying all for a user

            const response = await fetch(url, {
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch requirements');
            }
            const data = await response.json();
            setRequirements(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Car Loan Requirement Status{reservationId && ` for Reservation ${reservationId}`}</h2>
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
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 text-gray-500">No requirements submitted yet for this reservation.</td>
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
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CarLoanStatus; 