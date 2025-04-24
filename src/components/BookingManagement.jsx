import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const BookingManagement = () => {
    const { accountType, user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [assignedToFilter, setAssignedToFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [bookingToCancel, setBookingToCancel] = useState(null);

    useEffect(() => {
        fetchBookings();
        if (accountType === 'admin') {
            fetchStaffList();
        }
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost/car-dealership/api/get_bookings.php', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response was not JSON');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffList = async () => {
        try {
            const response = await fetch('http://localhost/car-dealership/api/get_staff.php', {
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch staff list');
            }

            const data = await response.json();
            setStaffList(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        if (newStatus === 'cancelled' && accountType === 'admin') {
            setBookingToCancel(bookingId);
            setShowCancelModal(true);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost/car-dealership/api/update_booking_status.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    status: newStatus
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update booking status');
            }

            setSuccessMessage('Booking status updated successfully');
            setShowSuccess(true);
            fetchBookings();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelWithReason = async () => {
        if (!cancellationReason.trim()) {
            setError('Cancellation reason is required');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost/car-dealership/api/update_booking_status.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: bookingToCancel,
                    status: 'cancelled',
                    cancellation_reason: cancellationReason
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel booking');
            }

            setSuccessMessage('Booking cancelled successfully');
            setShowSuccess(true);
            setShowCancelModal(false);
            setCancellationReason('');
            setBookingToCancel(null);
            fetchBookings();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (bookingId) => {
        try {
            const response = await fetch(`http://localhost/car-dealership/api/get_booking.php?id=${bookingId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch booking details');
            }

            const data = await response.json();
            setSelectedBooking(data);
            setShowDetailsModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAssignBooking = async (bookingId, staffId) => {
        if (accountType !== 'admin') return;

        try {
            const response = await fetch('http://localhost/car-dealership/api/assign_booking.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    booking_id: bookingId,
                    staff_id: staffId
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to assign booking');
            }

            setSuccessMessage('Booking assigned successfully');
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setSuccessMessage('');
            }, 3000);

            fetchBookings();
            setShowAssignModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const openDetailsModal = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const openAssignModal = (booking) => {
        setSelectedBookingForAssignment(booking);
        setShowAssignModal(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Add this function to filter bookings based on search query
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = searchQuery === '' || 
            booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.car_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toString().includes(searchQuery);
        
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        const matchesDate = dateFilter === '' || booking.booking_date === dateFilter;
        const matchesAssigned = assignedToFilter === '' || 
            (assignedToFilter === 'unassigned' && !booking.assigned_to) ||
            (accountType === 'admin' ? true : booking.assigned_to === user.id);

        return matchesSearch && matchesStatus && matchesDate && matchesAssigned;
    });

    if (loading && bookings.length === 0) {
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
                    <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border rounded px-3 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded px-3 py-2"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                        {accountType === 'admin' && (
                            <select
                                value={assignedToFilter}
                                onChange={(e) => setAssignedToFilter(e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">All Staff</option>
                                <option value="unassigned">Unassigned</option>
                                {/* Add staff members dynamically */}
                            </select>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {showSuccess && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{successMessage}</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Car
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Notes
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
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.customer_name}
                                        </div>
                                      
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.car_make} {booking.car_model}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.car_year}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(booking.booking_date)} {booking.booking_time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {booking.notes || 'No notes'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-red-100 text-red-800'}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openDetailsModal(booking)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Details
                                        </button>
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                    className="text-red-600 hover:text-red-900 mr-3"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {accountType === 'admin' && !booking.assigned_to && (
                                            <button
                                                onClick={() => openAssignModal(booking)}
                                                className="text-purple-600 hover:text-purple-900"
                                            >
                                                Assign
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Loading overlay for table operations */}
                {loading && bookings.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Booking Details Modal */}
                {showDetailsModal && selectedBooking && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Booking Details</h3>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-500">
                                    ×
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-700">Customer Information</h4>
                                    <p className="text-sm text-gray-600">Name: {selectedBooking.customer_name}</p>
                                    <p className="text-sm text-gray-600">Phone: {selectedBooking.customer_phone}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700">Car Information</h4>
                                    <p className="text-sm text-gray-600">Model: {selectedBooking.car_model}</p>
                                
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700">Booking Details</h4>
                                    <p className="text-sm text-gray-600">Date: {formatDate(selectedBooking.booking_date)}</p>
                                    <p className="text-sm text-gray-600">Status: {selectedBooking.status}</p>
                                    <p className="text-sm text-gray-600">Reason: {selectedBooking.cancellation_reason}</p>
                                </div>
                                {selectedBooking.notes && (
                                    <div>
                                        <h4 className="font-medium text-gray-700">Notes</h4>
                                        <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Assign Modal */}
                {showAssignModal && selectedBookingForAssignment && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Assign Booking</h3>
                                <button 
                                    onClick={() => setShowAssignModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Assign booking for {selectedBookingForAssignment.car_model} to:
                                </p>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    onChange={(e) => handleAssignBooking(selectedBookingForAssignment.id, e.target.value)}
                                >
                                    <option value="">Select Staff Member</option>
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.fullname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Cancel Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Cancel Booking</h3>
                                <button 
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancellationReason('');
                                        setBookingToCancel(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Please provide a reason for cancelling this booking:
                                </p>
                                <textarea
                                    className="w-full border rounded px-3 py-2"
                                    rows="4"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Enter cancellation reason..."
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            setCancellationReason('');
                                            setBookingToCancel(null);
                                        }}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCancelWithReason}
                                        className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Confirm Cancellation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingManagement; 