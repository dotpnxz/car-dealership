import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ReserveNow = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, userId } = React.useContext(AuthContext);
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/LoginForm');
            return;
        }

        const carId = id || location.state?.carId;
        
        if (!carId) {
            setError('Car ID is missing. Please select a car first.');
            setLoading(false);
            return;
        }

        const fetchCarDetails = async () => {
            try {
                const response = await fetch(`http://localhost/car-dealership/api/get_car.php?id=${carId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch car details');
                }

                const data = await response.json();
                setCar(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCarDetails();
    }, [id, location.state, isLoggedIn, navigate]);

    const handleReserve = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost/car-dealership/api/create_reservation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    car_id: id || location.state?.carId,
                    user_id: userId,
                    title: car.title
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create reservation');
            }

            const data = await response.json();
            if (data.success) {
                alert('Reservation created successfully!');
                navigate('/reservationlist');
            } else {
                throw new Error(data.error || 'Failed to create reservation');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    if (!car) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Warning!</strong>
                    <span className="block sm:inline"> Car not found</span>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left side - Message */}
                <div className="w-full md:w-1/2 bg-blue-50 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">Reservation Process</h2>
                    <div className="space-y-4 text-gray-700">
                        <p className="text-lg">
                            Thank you for choosing to reserve this vehicle. Here's what happens next:
                        </p>
                        <ol className="list-decimal pl-6 space-y-3">
                            <li>The admin will review your reservation application</li>
                            <li>Once approved, you'll receive a confirmation email</li>
                            <li>After confirmation, you can proceed with the payment process</li>
                            <li>Payment can be made through our secure payment gateway</li>
                            <li>Upon successful payment, your reservation will be finalized</li>
                        </ol>
                        <p className="text-lg mt-4">
                            Please note that the reservation is not confirmed until the admin approves your application and payment is completed.
                        </p>
                    </div>
                </div>

                {/* Right side - Car Details */}
                <div className="w-full md:w-1/2">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Car Details</h1>
                        <button
                            onClick={handleReserve}
                            disabled={isSubmitting}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'Processing...' : 'Reserve Now'}
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-600">Title</p>
                                <p className="font-semibold text-xl">{car.title}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-600">Price</p>
                                    <p className="font-semibold text-lg">${car.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Category</p>
                                    <p className="font-semibold text-lg">{car.category}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-600">Brand</p>
                                    <p className="font-semibold text-lg">{car.brand}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Variant</p>
                                    <p className="font-semibold text-lg">{car.variant}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-gray-600">Mileage</p>
                                <p className="font-semibold text-lg">{car.mileage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReserveNow;
