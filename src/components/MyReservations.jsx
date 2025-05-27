import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './Paymentmodal';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const navigate = useNavigate();

    // Determine API base URL based on environment
    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';

    // Define the reservation fee
    const RESERVATION_FEE = 10000; // Fixed reservation fee of 10,000 PHP

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/get_reservations.php`, {
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch reservations');
            }
            const data = await response.json();
            console.log('Reservations data:', data.data);
            data.data?.forEach(reservation => {
                console.log('Reservation date:', {
                    raw: reservation.reservation_date,
                    parsed: new Date(reservation.reservation_date)
                });
            });
            setReservations(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReservation = (reservationId) => {
        navigate(`/buyer/car-loan-status/${reservationId}`);
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cancel_user_reservation.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reservation_id: reservationId
                }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to cancel reservation');
            }

            fetchReservations();
        } catch (error) {
            setError(error.message);
        }
    };

    const handlePayment = (reservation) => {
        setSelectedReservation({
            id: reservation.id,
            title: reservation.title,
            amount: RESERVATION_FEE // Pass reservation fee for initial payment
        });
        setShowPayment(true);
    };

    const handlePassRequirements = (reservationId) => {
        navigate(`/requirements/${reservationId}`);
    };

    // Handler for Pay Remaining button
    const handlePayRemaining = (reservation) => {
        const remainingAmount = reservation.car_price - RESERVATION_FEE; // Use defined constant
        setSelectedReservation({
            id: reservation.id,
            title: reservation.title,
            amount: remainingAmount // Pass remaining amount
        });
        setShowPayment(true);
    };

    if (loading) return <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">My Reservations</h2>
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left">Car</th>
                                <th className="py-3 px-4 text-left">Date</th>
                                <th className="py-3 px-4 text-left">Type</th>
                                <th className="py-3 px-4 text-left">Payment Status</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">{reservation.title}</td>
                                    <td className="py-3 px-4 border-b">
                                        {reservation.reservation_date ? new Date(reservation.reservation_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            reservation.reservation_type === 'loan' ? 'bg-purple-100 text-purple-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {reservation.reservation_type ? reservation.reservation_type.charAt(0).toUpperCase() + reservation.reservation_type.slice(1) : 'Full'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            reservation.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            reservation.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {reservation.payment_status ? reservation.payment_status.charAt(0).toUpperCase() + reservation.payment_status.slice(1) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        {reservation.payment_status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handlePayment(reservation)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm mr-2"
                                                >
                                                    Pay Now
                                                </button>
                                                <button
                                                    onClick={() => handleCancelReservation(reservation.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm mr-2"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {reservation.reservation_type === 'loan' && reservation.payment_status === 'paid' && !reservation.requirements_submitted && (
                                            <button
                                                onClick={() => handlePassRequirements(reservation.id)}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm mr-2"
                                            >
                                                Pass Requirements
                                            </button>
                                        )}
                                        {reservation.reservation_type === 'full' && reservation.payment_status === 'paid' && (
                                            <button
                                                onClick={() => handlePayRemaining(reservation)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm mr-2"
                                            >
                                                Pay Remaining
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleViewReservation(reservation.id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Payment Modal */}
            {showPayment && selectedReservation && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => {
                        setShowPayment(false);
                        setSelectedReservation(null);
                        // Refresh the reservations list after modal is closed
                        fetchReservations();
                    }}
                    reservation={selectedReservation}
                />
            )}
        </div>
    );
};

export default MyReservations;
