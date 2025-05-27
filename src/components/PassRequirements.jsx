import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const requirements = [
  { label: '2 Valid I.D', key: 'valid_id', required: true, multiple: true },
  { label: 'Bank Statement / Gcash Statement', key: 'bank_statement', required: true },
  { label: 'Proof of Billing', key: 'proof_billing', required: true },
  { label: 'COE or Payslip - if Employed', key: 'coe_payslip', required: true },
  { label: 'Business Permit or DTI - if with Business', key: 'business_permit', required: false },
];

const PassRequirements = () => {
  const { reservationId } = useParams();
  const [files, setFiles] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validIdError, setValidIdError] = useState('');
  const [reservation, setReservation] = useState(null);
  const [loadingReservation, setLoadingReservation] = useState(true);
  const [reservationError, setReservationError] = useState('');

  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost/car-dealership/api'
    : 'https://mjautolove.site/api';

  useEffect(() => {
    const fetchReservation = async () => {
      setLoadingReservation(true);
      try {
        const response = await fetch(`${API_BASE_URL}/get_reservations.php?id=${reservationId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Raw reservation data:', data);
        
        // Try to find the reservation by id
        let found = null;
        if (Array.isArray(data.data)) {
          found = data.data.find(r => String(r.id) === String(reservationId));
        } else if (data.data && String(data.data.id) === String(reservationId)) {
          found = data.data;
        }
        
        if (!found) throw new Error('Reservation not found');
        
        // Log the found reservation to check its structure
        console.log('Found reservation:', found);
        
        // Try to find car_id in different possible locations
        const car_id = found.car_id || found.carId || found.car?.id || found.car_id;
        console.log('Attempted to find car_id:', {
          car_id,
          found_car_id: found.car_id,
          found_carId: found.carId,
          found_car: found.car,
          full_reservation: found
        });

        // Create a modified reservation object with the car_id
        const modifiedReservation = {
          ...found,
          car_id: car_id
        };
        
        setReservation(modifiedReservation);
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setReservationError(err.message);
      } finally {
        setLoadingReservation(false);
      }
    };
    fetchReservation();
  }, [API_BASE_URL, reservationId]);

  const handleFileChange = (e, key, multiple = false) => {
    if (key === 'valid_id' && multiple) {
      const fileList = Array.from(e.target.files);
      setFiles({ ...files, [key]: fileList });
      setValidIdError(fileList.length !== 2 ? 'Please upload exactly 2 files.' : '');
    } else {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitted(false);

    try {
      if (!reservation) throw new Error('Reservation details not loaded');
      
      // Log the full reservation object for debugging
      console.log('Full reservation object:', reservation);
      
      // Use the fullname field from the reservation object
      const name = reservation.fullname;
      const car_title = reservation.title;
      const user_id = reservation.user_id;

      // Log all fields for debugging
      console.log('Fields being sent:', {
        reservation_id: reservationId,
        user_id,
        name,
        car_title
      });

      // Check for missing required fields
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!car_title) missingFields.push('car_title');
      if (!user_id) missingFields.push('user_id');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const requirementRes = await fetch(`${API_BASE_URL}/create_requirements.php`, {
        method: 'POST',
        body: JSON.stringify({
          reservation_id: reservationId,
          user_id,
          name,
          car_title
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      const requirementData = await requirementRes.json();
      if (!requirementData.success) throw new Error(requirementData.error || 'Failed to create loan requirement');
      const loan_requirement_id = requirementData.loan_requirement_id;

      // 2. Upload the files
      const formData = new FormData();
      formData.append('loan_requirement_id', loan_requirement_id);
      requirements.forEach(req => {
        if (req.key === 'valid_id' && Array.isArray(files[req.key])) {
          files[req.key].forEach((file, idx) => {
            formData.append(`${req.key}_${idx+1}`, file);
          });
        } else if (files[req.key]) {
          formData.append(req.key, files[req.key]);
        }
      });
      const uploadRes = await fetch(`${API_BASE_URL}/upload_requirements_images.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.error || 'Failed to upload files');

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Only required fields must be filled, and valid_id must have exactly 2 files
  const allFilesSelected = requirements.filter(r => r.required).every(req => {
    if (req.key === 'valid_id') {
      return Array.isArray(files[req.key]) && files[req.key].length === 2;
    }
    return files[req.key];
  });

  if (loadingReservation) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (reservationError) {
    return <div className="text-red-500 text-center mt-10">{reservationError}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-indigo-700">Requirements for Financing</h2>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <div className="text-green-700 text-xl font-semibold text-center">Requirements submitted successfully!</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <ul className="space-y-6">
              {requirements.map((req, idx) => (
                <li key={req.key} className="flex flex-col sm:flex-row sm:items-center text-gray-800">
                  <span className="flex items-center font-medium mb-2 sm:mb-0 w-full sm:w-1/2">
                    <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {req.label}{req.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full sm:w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition mt-2 sm:mt-0"
                    required={req.required}
                    multiple={req.key === 'valid_id'}
                    onChange={e => handleFileChange(e, req.key, req.key === 'valid_id')}
                  />
                  {req.key === 'valid_id' && validIdError && (
                    <span className="text-red-500 text-sm mt-1">{validIdError}</span>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50 text-lg"
              disabled={!allFilesSelected || submitting || !!validIdError}
            >
              {submitting ? 'Submitting...' : 'Submit Requirements'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PassRequirements; 