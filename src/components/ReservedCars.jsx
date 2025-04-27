import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ReservedCars = () => {
    const { isLoggedIn, accountType } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reservedCars, setReservedCars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isLoggedIn || accountType !== 'admin') {
            navigate('/LoginForm');
            return;
        }
        // fetchReservedCars(); // Will be implemented when we create the PHP endpoint
    }, [isLoggedIn, accountType, navigate]);

    // Add search filter function
    const filteredReservedCars = reservedCars.filter(reservation => {
        const searchLower = searchTerm.toLowerCase();
        return (
            reservation.fullname.toLowerCase().includes(searchLower) ||
            reservation.username.toLowerCase().includes(searchLower) ||
            reservation.contactNo?.toLowerCase().includes(searchLower) ||
            reservation.car_title.toLowerCase().includes(searchLower) ||
            reservation.status.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
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
                    <h1 className="text-3xl font-bold text-gray-800">Reserved Cars Management</h1>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search reservations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reservation ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Car Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reservation Date
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
                                {filteredReservedCars.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No reserved cars found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservedCars.map((reservation) => (
                                        <tr key={reservation.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {reservation.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {reservation.car_title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {reservation.brand} - {reservation.variant}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {reservation.fullname}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {reservation.contactNo}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(reservation.reservation_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${reservation.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' : 
                                                      reservation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                      'bg-red-100 text-red-800'}`}>
                                                    {reservation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {/* Will be implemented */}}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => {/* Will be implemented */}}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => {/* Will be implemented */}}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservedCars; 