import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Profile = () => {
    // Dynamic API base URL for dev/prod
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost/car-dealership/api'
      : 'https://mjautolove.site/api';

    const initialState = {
        surname: '',
        firstName: '',
        middleName: '',
        suffix: '',
        username: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        contactNo: '',
        gender: '',
        streetAddress: '',
        city: '',
        province: '',
        zipCode: '',
        accountType: 'buyer'
    };

    const [profileData, setProfileData] = useState(initialState);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        if (isLoggedIn) {
            fetchProfile();
        }
    }, [isLoggedIn]);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/get_profile.php`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch profile data');
            }
            
            const data = await response.json();
            // Merge fetched data with initial state to ensure all fields exist
            setProfileData(prevState => ({
                ...initialState,
                ...data,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const resetPasswordFields = () => {
        setProfileData(prev => ({
            ...prev,
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        }));
    };

    const handleSaveClick = async () => {
        try {
            const dataToSend = { ...profileData };
            
            if (dataToSend.oldPassword || dataToSend.newPassword || dataToSend.confirmPassword) {
                if (!dataToSend.oldPassword) {
                    throw new Error('Please enter your old password');
                }
                if (!dataToSend.newPassword) {
                    throw new Error('Please enter your new password');
                }
                if (!dataToSend.confirmPassword) {
                    throw new Error('Please confirm your new password');
                }
                if (dataToSend.newPassword !== dataToSend.confirmPassword) {
                    throw new Error('New passwords do not match');
                }
            } else {
                // Remove password fields if no password change
                delete dataToSend.oldPassword;
                delete dataToSend.newPassword;
                delete dataToSend.confirmPassword;
            }

            const response = await fetch(`${API_BASE_URL}/update_profile.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Invalid response from server');
            }
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess(data.message || 'Profile updated successfully');
            setIsEditing(false);
            resetPasswordFields();
            await fetchProfile();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    if (!isLoggedIn) {
        return <div className="p-4 text-center">Please log in to view your profile</div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Profile Information</h2>
                
                {/* Error and Success Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                    {/* Name Section */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Name Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname*</label>
                                <input
                                    type="text"
                                    name="surname"
                                    value={profileData.surname}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    type="text"
                                    name="middleName"
                                    value={profileData.middleName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                                <select
                                    name="suffix"
                                    value={profileData.suffix || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">None</option>
                                    <option value="Jr.">Jr.</option>
                                    <option value="Sr.">Sr.</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                    <option value="IV">IV</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Account Information</h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={profileData.username}
                                    disabled={true}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Change Password</h3>
                        <div className="space-y-3">
                           
                            
                                <>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={profileData.oldPassword}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter old password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={profileData.newPassword}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={profileData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </>
                          
                        </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number*</label>
                                <input
                                    type="text"
                                    name="contactNo"
                                    value={profileData.contactNo}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                                <select
                                    name="gender"
                                    value={profileData.gender || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        name="birthDay"
                                        value={profileData.birthDay}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Day</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                    <select
                                        name="birthMonth"
                                        value={profileData.birthMonth}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Month</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        name="birthYear"
                                        value={profileData.birthYear}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Address Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address*</label>
                                <input
                                    type="text"
                                    name="streetAddress"
                                    value={profileData.streetAddress}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Province*</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={profileData.province}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profileData.city}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code*</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={profileData.zipCode}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:space-x-4">
                    {!isEditing ? (
                        <button
                            onClick={handleEditClick}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchProfile(); // Reset form
                                }}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveClick}
                                className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm sm:text-base"
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;