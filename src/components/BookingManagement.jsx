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
    const [sortField, setSortField] = useState('booking_date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);

    // Determine API base URL based on environment
    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';

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
            const response = await fetch(`${API_BASE_URL}/get_bookings.php`, {
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
            const response = await fetch(`${API_BASE_URL}/get_staff.php`, {
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
            const response = await fetch(`${API_BASE_URL}/update_booking_status.php`, {
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
            const response = await fetch(`${API_BASE_URL}/update_booking_status.php`, {
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
            const response = await fetch(`${API_BASE_URL}/get_booking.php?id=${bookingId}`, {
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
            const response = await fetch(`${API_BASE_URL}/assign_booking.php`, {
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

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedBookings = filteredBookings.sort((a, b) => {
        // First apply status priority if sorting by status
        if (sortField === 'status') {
            const statusPriority = {
                'pending': 0,
                'confirmed': 1,
                'completed': 2,
                'cancelled': 3
            };
            const comparison = statusPriority[a.status] - statusPriority[b.status];
            return sortDirection === 'asc' ? comparison : -comparison;
        }

        // Sort by date
        if (sortField === 'booking_date') {
            const dateA = new Date(a.booking_date + ' ' + a.booking_time);
            const dateB = new Date(b.booking_date + ' ' + b.booking_time);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }

        return 0;
    });

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);

    const Pagination = () => (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 px-4">
            <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                Showing {indexOfFirstBooking + 1} to {Math.min(indexOfLastBooking, sortedBookings.length)} of {sortedBookings.length} entries
            </div>
            <div className="flex space-x-2 order-1 sm:order-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );

    if (loading && bookings.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Booking Management</h1>
                    
                    {/* Filter Controls - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border rounded px-3 py-2 pl-10"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:flex gap-2">
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
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Car
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('booking_date')}
                                    >
                                        <div className="flex items-center">
                                            Date & Time
                                            {sortField === 'booking_date' && (
                                                <span className="ml-2">
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notes
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Status
                                            {sortField === 'status' && (
                                                <span className="ml-2">
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.customer_name}
                                            </div>
                                      
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.car_make} {booking.car_model}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.car_year}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(booking.booking_date)} {booking.booking_time}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {booking.notes || 'No notes'}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                                'bg-red-100 text-red-800'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => openDetailsModal(booking)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Details
                                                </button>
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {accountType === 'admin' && !booking.assigned_to && booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => openAssignModal(booking)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                    >
                                                        Assign
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Loading overlay for table operations */}
                {loading && bookings.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Booking Details Modal */}
                {showDetailsModal && selectedBooking && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full p-4">
                        <div className="relative top-20 mx-auto p-4 sm:p-5 border w-full sm:w-96 shadow-lg rounded-md bg-white">
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
                                    <p className="text-sm text-gray-600">
                                        Assigned To: {selectedBooking.staff_name || 'Not Assigned'}
                                    </p>
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
                        <div className="relative top-20 mx-auto p-5 border w-full sm:w-96 shadow-lg rounded-md bg-white">
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
                        <div className="relative top-20 mx-auto p-5 border w-full sm:w-96 shadow-lg rounded-md bg-white">
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

                {/* Pagination with mobile-friendly layout */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 px-4">
                    <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                        Showing {indexOfFirstBooking + 1} to {Math.min(indexOfLastBooking, sortedBookings.length)} of {sortedBookings.length} entries
                    </div>
                    <div className="flex space-x-2 order-1 sm:order-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${currentPage === 1 
                                ? 'bg-gray-100 text-gray-400' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${currentPage === totalPages 
                                ? 'bg-gray-100 text-gray-400' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;