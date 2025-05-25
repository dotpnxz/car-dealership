import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, reservation }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [qrCode, setQrCode] = useState(null);
    const [paymentLink, setPaymentLink] = useState(null);

    // Determine API base URL based on environment
    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost/car-dealership/api'
        : 'https://mjautolove.site/api';    const RESERVATION_FEE = 10000; // Fixed reservation fee of 10,000 PHP

    const generateQR = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/generate_qr.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: RESERVATION_FEE,
                    reservation_id: reservation.id
                }),
            });

            const data = await response.json();
            
            if (data.success && data.data.qr_image) {
                setQrCode(data.data);
            } else {
                throw new Error(data.message || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const generatePaymentLink = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/generate_payment_link.php`, {
                method: 'POST',                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_reference: reservation.id,
                    amount: RESERVATION_FEE
                })
            });

            // Check if response is ok before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text(); // Get response as text first
            console.log('Raw response:', text); // Debug log

            let data;
            try {
                data = JSON.parse(text); // Parse the text as JSON
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid JSON response from server');
            }

            if (data.success && data.data) {
                setPaymentLink(data.data);
                window.open(data.data.payment_url, '_blank');
            } else {
                throw new Error(data.message || 'Failed to generate payment link');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Failed to generate payment link');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !reservation) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Payment for Reservation</h2>                <div className="space-y-4 mb-6">
                    <div>
                        <p className="text-gray-600">Reservation Fee:</p>
                        <p className="text-2xl font-bold">₱{RESERVATION_FEE.toLocaleString()}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>This is a fixed reservation fee to secure your vehicle.</p>
                        <p>This will be deducted from downpayment once you proceed with the purchase.</p>
                    </div>
                </div>

                {!qrCode && !paymentLink && !loading && (
                    <div className="space-y-2">
                        <button
                            onClick={generateQR}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Pay with QR Code
                        </button>
                        <button
                            onClick={generatePaymentLink}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        >
                            Pay with Link
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-center my-4">
                        {error}
                    </div>
                )}

                {qrCode && (
                    <div className="flex flex-col items-center">
                        <img
                            src={qrCode.qr_image}
                            alt="Payment QR Code"
                            className="mb-4 max-w-full"
                        />
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Scan this QR code with your GCash app to complete the payment
                        </p>
                        <p className="text-xs text-gray-500">Reference: {qrCode.reference}</p>
                    </div>
                )}

                {paymentLink && (
                    <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Click below to proceed with your card payment
                        </p>
                        <a
                            href={paymentLink.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center mb-4"
                        >
                            Proceed to Payment
                        </a>
                        <p className="text-xs text-gray-500">Reference: {paymentLink.reference}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;