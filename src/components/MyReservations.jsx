import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost/car-dealership/api/get_reservations.php', {
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch reservations');
            }
            const data = await response.json();
            setReservations(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = (reservation) => {
        setSelectedReservation({
            ...reservation,
            amount: 10000 // Replace with actual reservation amount from your database
        });
        setIsPaymentModalOpen(true);
    };

    const handlePaymentModalClose = (success) => {
        if (success) {
            fetchReservations();
        }
        setIsPaymentModalOpen(false);
        setSelectedReservation(null);
    };

    const handleViewReservation = (reservationId) => {
        navigate(`/reservation/${reservationId}`);
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch('http://localhost/car-dealership/api/cancel_user_reservation.php', {
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
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">{reservation.title}</td>
                                    <td className="py-3 px-4 border-b">
                                        {new Date(reservation.reservation_date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        {reservation.status === 'confirmed' && (
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
                                        {reservation.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm mr-2"
                                            >
                                                Cancel
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
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={handlePaymentModalClose}
                    reservation={selectedReservation}
                />
            </div>
        </div>
    );
};

export default MyReservations;
