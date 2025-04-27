import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ReservationList = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userId, accountType } = React.useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const updateReservationStatus = async (reservationId, newStatus) => {
        try {
            const response = await fetch('http://localhost/car-dealership/api/update_reservation_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    reservation_id: reservationId,
                    status: newStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            const data = await response.json();
            
            if (data.success) {
                // Update the local state
                setReservations(prevReservations => 
                    prevReservations.map(reservation => 
                        reservation.id === reservationId 
                            ? { ...reservation, status: newStatus }
                            : reservation
                    )
                );
            } else {
                throw new Error(data.error || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            console.log('User not logged in, redirecting to login');
            navigate('/LoginForm');
            return;
        }

        const fetchReservations = async () => {
            try {
                console.log('Fetching reservations for user:', userId);
                const response = await fetch('http://localhost/car-dealership/api/get_reservations.php', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Full response data:', data);
                
                if (data.success) {
                    console.log('Setting reservations:', data.data);
                    setReservations(data.data);
                } else {
                    console.error('API returned error:', data.error);
                    throw new Error(data.error || 'Failed to fetch reservations');
                }
            } catch (err) {
                console.error('Error in fetchReservations:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [isLoggedIn, userId, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Reservations</h1>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back to Home
                </button>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                    <p>You have no reservations yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reservations.map((reservation) => (
                        <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-600">Full Name</p>
                                    <p className="font-semibold text-lg">{reservation.fullname}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Title</p>
                                    <p className="font-semibold text-lg">{reservation.title}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <p className="text-gray-600">Reservation Date</p>
                                    <p className="font-semibold">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                        reservation.status === 'reserved' ? 'bg-purple-100 text-purple-800' :
                                        reservation.status === 'acquired' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {accountType === 'admin' && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                        className={`px-3 py-1 rounded text-sm font-semibold ${
                                            reservation.status === 'confirmed' 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        }`}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => updateReservationStatus(reservation.id, 'reserved')}
                                        className={`px-3 py-1 rounded text-sm font-semibold ${
                                            reservation.status === 'reserved' 
                                                ? 'bg-purple-500 text-white' 
                                                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                        }`}
                                    >
                                        Reserve
                                    </button>
                                    <button
                                        onClick={() => updateReservationStatus(reservation.id, 'acquired')}
                                        className={`px-3 py-1 rounded text-sm font-semibold ${
                                            reservation.status === 'acquired' 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                        }`}
                                    >
                                        Acquire
                                    </button>
                                    <button
                                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                        className={`px-3 py-1 rounded text-sm font-semibold ${
                                            reservation.status === 'cancelled' 
                                                ? 'bg-red-500 text-white' 
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReservationList; 