import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentManagement = () => {
  // Dynamic API base URL for dev/prod
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/get_all_payments.php`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      setPayments(data.payments || []); // Changed from data.data to data.payments
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (paymentId) => {
    if (!confirm('Are you sure you want to approve this refund?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/approve_refund.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId })
      });

      if (!response.ok) throw new Error('Failed to approve refund');
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error approving refund:', error);
      toast.error('Failed to approve refund');
    }
  };

  const handleDenyRefund = async (paymentId) => {
    if (!confirm('Are you sure you want to deny this refund?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/deny_refund.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId })
      });

      if (!response.ok) throw new Error('Failed to deny refund');
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error denying refund:', error);
      toast.error('Failed to deny refund');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
  </div>;

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Payment Management {isAdmin ? '(Admin)' : '(Staff)'}
      </h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment, index) => (
              <tr key={index}>                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {payment.fullname || `${payment.surname || ''}, ${payment.firstName || ''} ${payment.middleName || ''} ${payment.suffix || ''}`}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{payment.car_title || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {payment.amount ? `₱${Number(payment.amount).toLocaleString()}` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {new Date(payment.created_at).toLocaleString()}
                  </span>
                </td>                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      payment.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                      payment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Print Receipt
                    </button>
                    {payment.status === 'refund_requested' && (
                      <>
                        <button
                          onClick={() => handleApproveRefund(payment.id)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRefund(payment.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Deny
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;
