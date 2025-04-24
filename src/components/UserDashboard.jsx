import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [cars, setCars] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserData();
    }, [activeTab]);

    const fetchUserData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'profile') {
                const response = await fetch('http://localhost/car-dealership/api/get_profile.php', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch profile');
                }
                const data = await response.json();
                setUser(data);
            } else if (activeTab === 'bookings') {
                const response = await fetch('http://localhost/car-dealership/api/get_bookings.php', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch bookings');
                }
                const data = await response.json();
                setBookings(data);
            } else if (activeTab === 'cars') {
                const response = await fetch('http://localhost/car-dealership/api/get_user_cars.php', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch cars');
                }
                const data = await response.json();
                setCars(data);
            } else if (activeTab === 'reservations') {
                const response = await fetch('http://localhost/car-dealership/api/get_user_reservations.php', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch reservations');
                }
                const data = await response.json();
                setReservations(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const response = await fetch('http://localhost/car-dealership/api/update_booking_status.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    status: 'cancelled'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel booking');
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to cancel booking');
            }

            // Refresh the bookings list
            fetchUserData();
        } catch (error) {
            setError(error.message);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">My Profile</h2>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700">Personal Information</h3>
                                    <div className="mt-2 space-y-2">
                                        <p><span className="font-medium">Full Name:</span> {user?.fullname || 'Not set'}</p>
                                        <p><span className="font-medium">Username:</span> {user?.username || 'Not set'}</p>
                                        <p><span className="font-medium">Contact Number:</span> {user?.contactNo || 'Not set'}</p>
                                        <p><span className="font-medium">Gender:</span> {user?.gender || 'Not set'}</p>
                                        <p><span className="font-medium">Date of Birth:</span> {
                                            user?.birthDay && user?.birthMonth && user?.birthYear 
                                                ? `${user.birthMonth}/${user.birthDay}/${user.birthYear}`
                                                : 'Not set'
                                        }</p>
                                        <p><span className="font-medium">Address:</span> {user?.address || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'bookings':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">My Bookings</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-3 px-4 border-b text-left">Car Model</th>
                                        <th className="py-3 px-4 border-b text-center">Date</th>
                                        <th className="py-3 px-4 border-b text-center">Time</th>
                                        <th className="py-3 px-4 border-b text-center">Status</th>
                                        <th className="py-3 px-4 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b text-left">{booking.car_model}</td>
                                            <td className="py-3 px-4 border-b text-center">{new Date(booking.booking_date).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 border-b text-center">
                                                {booking.booking_time}
                                            </td>
                                            <td className="py-3 px-4 border-b text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    {booking.status === 'cancelled' && booking.cancellation_reason && (
                                                        <div className="mt-1 text-xs text-gray-600">
                                                            Reason: {booking.cancellation_reason}
                                                        </div>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b text-center">
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'cars':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">My Cars for Sale</h2>
                        <div className="grid gap-4">
                            {cars.map(car => (
                                <div key={car.id} className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{car.make} {car.model}</h3>
                                            <p className="text-gray-600">Year: {car.year}</p>
                                            <p className="text-gray-600">Price: ${car.price}</p>
                                            <p className="text-gray-600">Status: {car.status}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            car.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            car.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {car.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'reservations':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">My Reservations</h2>
                        <div className="grid gap-4">
                            {reservations.map(reservation => (
                                <div key={reservation.id} className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{reservation.car_model}</h3>
                                            <p className="text-gray-600">Date: {reservation.reservation_date}</p>
                                            <p className="text-gray-600">Status: {reservation.status}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {reservation.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-md">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${
                                    activeTab === 'profile' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                                }`}
                            >
                                My Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${
                                    activeTab === 'bookings' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                                }`}
                            >
                                My Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('cars')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${
                                    activeTab === 'cars' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                                }`}
                            >
                                My Cars
                            </button>
                            <button
                                onClick={() => setActiveTab('reservations')}
                                className={`w-full text-left px-4 py-2 rounded-lg ${
                                    activeTab === 'reservations' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                                }`}
                            >
                                My Reservations
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard; 