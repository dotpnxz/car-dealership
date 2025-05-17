import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ReservationList = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userId, accountType } = React.useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [reservationsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
                console.log('Fetching reservations. Account type:', accountType);
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
                console.log('API Response:', data);
                
                if (data.success) {
                    // Add check for empty data
                    if (!data.data || data.data.length === 0) {
                        console.log('No reservations found');
                    } else {
                        console.log(`Found ${data.data.length} reservations`);
                    }
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
    }, [isLoggedIn, userId, accountType, navigate]);

    // Pagination calculation
    const indexOfLastReservation = currentPage * reservationsPerPage;
    const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
    const totalPages = Math.ceil(reservations.length / reservationsPerPage);

    // Sort function
    const sortData = (data, key) => {
        if (!key) return data;
        
        return [...data].sort((a, b) => {
            if (key === 'reservation_date') {
                return sortConfig.direction === 'ascending' 
                    ? new Date(a[key]) - new Date(b[key])
                    : new Date(b[key]) - new Date(a[key]);
            }
            
            let aValue = a[key]?.toLowerCase();
            let bValue = b[key]?.toLowerCase();
            
            if (sortConfig.direction === 'ascending') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Sort handler
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filtered and sorted data
    const filteredAndSortedReservations = React.useMemo(() => {
        let filtered = reservations.filter(reservation => 
            reservation.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return sortData(filtered, sortConfig.key);
    }, [reservations, searchTerm, sortConfig]);

    // Current reservations for pagination
    const currentReservations = filteredAndSortedReservations.slice(
        indexOfFirstReservation, 
        indexOfLastReservation
    );

    // Sort indicator
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const Pagination = () => (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 px-4">
            <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                Showing {indexOfFirstReservation + 1} to {Math.min(indexOfLastReservation, reservations.length)} of {reservations.length} entries
            </div>
            <div className="flex space-x-2 order-1 sm:order-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    Previous
                </button>
                <span className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );

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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">Reservations</h1>
                <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
                >
                    Back to Home
                </button>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative text-sm sm:text-base">
                    <p>You have no reservations yet.</p>
                </div>
            ) : (
                <>
                    {/* Search bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search reservations..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => requestSort('fullname')}
                                        >
                                            Full Name {getSortIndicator('fullname')}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => requestSort('title')}
                                        >
                                            Title {getSortIndicator('title')}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => requestSort('reservation_date')}
                                        >
                                            Reservation Date {getSortIndicator('reservation_date')}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => requestSort('status')}
                                        >
                                            Status {getSortIndicator('status')}
                                        </th>
                                        {accountType === 'admin' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentReservations.map((reservation) => (
                                        <tr key={reservation.id}>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                    {reservation.fullname}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-gray-900">
                                                    {reservation.title}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-gray-900">
                                                    {new Date(reservation.reservation_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                </span>
                                            </td>
                                            {accountType === 'admin' && (
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                                                        <button
                                                            onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-900"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => updateReservationStatus(reservation.id, 'reserved')}
                                                            className="text-xs sm:text-sm text-purple-600 hover:text-purple-900"
                                                        >
                                                            Reserve
                                                        </button>
                                                        <button
                                                            onClick={() => updateReservationStatus(reservation.id, 'acquired')}
                                                            className="text-xs sm:text-sm text-green-600 hover:text-green-900"
                                                        >
                                                            Acquire
                                                        </button>
                                                        <button
                                                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                                            className="text-xs sm:text-sm text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination with responsive design */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 px-4">
                        <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                            Showing {indexOfFirstReservation + 1} to {Math.min(indexOfLastReservation, reservations.length)} of {reservations.length} entries
                        </div>
                        <div className="flex space-x-2 order-1 sm:order-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${currentPage === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${currentPage === totalPages 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReservationList;