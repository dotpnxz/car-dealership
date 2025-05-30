import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import PaymentModal from './PaymentModal';

const MyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const navigate = useNavigate();

  // Determine API base URL based on environment
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  useEffect(() => {
    fetchPurchases();
    fetchCompletedReservations();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_purchases.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setPurchases(data.purchases);
      } else {
        toast.error(data.message || 'Failed to fetch purchases');
      }
    } catch (error) {
      toast.error('An error occurred while fetching your purchases');
    }
  };

  const fetchCompletedReservations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_completed_reservations.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setReservations(data.reservations);
      } else {
        toast.error(data.message || 'Failed to fetch completed reservations');
      }
    } catch (error) {
      toast.error('An error occurred while fetching completed reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPurchase = async (purchaseId) => {
    if (!window.confirm('Are you sure you want to cancel this purchase?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cancel_purchase.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purchaseId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Purchase cancelled successfully');
        fetchPurchases();
      } else {
        toast.error(data.message || 'Failed to cancel purchase');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the purchase');
    }
  };

  const handlePayment = async (purchase) => {
    try {
      console.log('Purchase object:', purchase);
      const requestBody = {
        payment_reference: purchase.id,
        amount: purchase.payment_amount || purchase.amount
      };
      console.log('Request body being sent:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/generate_payment_link.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (data.success) {
        setSelectedPurchase({
          id: purchase.id,
          amount: purchase.payment_amount || purchase.amount,
          purchase_type: purchase.purchase_type,
          title: purchase.title,
          payment_reference: data.data.payment_reference,
          payment_url: data.data.payment_url
        });
        setShowPayment(true);
      } else {
        toast.error(data.error || 'Failed to generate payment reference');
      }
    } catch (error) {
      console.error('Error in handlePayment:', error);
      toast.error('An error occurred while preparing payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600';
      case 'paid':
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-2xl">Loading...</div>
      </div>
    );
  }

  const allTransactions = [
    ...purchases.map(p => ({ ...p, type: 'purchase' })),
    ...reservations.map(r => ({ 
      ...r, 
      type: 'reservation',
      title: r.title,
      payment_amount: r.car_price,
      purchase_date: r.reservation_date,
      payment_status: r.payment_status
    }))
  ].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8">My Transactions</h1>

          {allTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">You haven't made any transactions yet.</p>
              <button
                onClick={() => navigate('/collection')}
                className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allTransactions.map((transaction) => (
                    <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.purchase_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₱{Number(transaction.payment_amount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {transaction.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.payment_status)}`}>
                          {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.type === 'purchase' && transaction.payment_status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePayment(transaction)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Pay Now
                            </button>
                            <button
                              onClick={() => handleCancelPurchase(transaction.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPayment && selectedPurchase && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedPurchase(null);
          }}
          reservation={selectedPurchase}
        />
      )}
    </div>
  );
};

export default MyPurchases; 