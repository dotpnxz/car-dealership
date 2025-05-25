import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import usePhLocations from '../hooks/usePhLocations';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const { isLoggedIn, accountType } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        surname: '',
        firstName: '',
        middleName: '',
        fullname: '',
        contactNo: '',
        gender: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        streetAddress: '',
        city: '',
        province: '',
        zipCode: '',
        address: '', // This will store the combined address
        accountType: 'buyer',
        suffix: ''
    });
    const [success, setSuccess] = useState('');

    const { regions, getProvincesByRegion, getCitiesByProvince } = usePhLocations();
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [availableProvinces, setAvailableProvinces] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);

    // Dynamic API base URL for dev/prod
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://localhost/car-dealership/api'
      : 'https://mjautolove.site/api';

    // Reset location state when modals are closed
    const resetLocationState = () => {
        setSelectedRegion('');
        setSelectedProvince('');
        setAvailableProvinces([]);
        setAvailableCities([]);
    };

    useEffect(() => {
        if (!isLoggedIn || accountType !== 'admin') {
            navigate('/LoginForm');
            return;
        }
        fetchUsers();
    }, [isLoggedIn, accountType, navigate]);

    useEffect(() => {
        if (selectedRegion) {
            const provinces = getProvincesByRegion(selectedRegion);
            setAvailableProvinces(provinces);
            setSelectedProvince('');
            setAvailableCities([]);
        }
    }, [selectedRegion, getProvincesByRegion]);

    useEffect(() => {
        if (selectedProvince) {
            setAvailableCities(getCitiesByProvince(selectedProvince));
        }
    }, [selectedProvince]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_users.php`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/add_user.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            let data;
            try {
                const text = await response.text();
                console.log('Raw response:', text); // Debug log
                data = JSON.parse(text);
            } catch (error) {
                console.error('Parse error:', error);
                throw new Error('Invalid server response');
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to add user');
            }

            setShowAddModal(false);
            resetLocationState();
            setFormData({
                username: '',
                surname: '',
                firstName: '',
                middleName: '',
                fullname: '',
                contactNo: '',
                gender: '',
                birthDay: '',
                birthMonth: '',
                birthYear: '',
                streetAddress: '',
                city: '',
                province: '',
                zipCode: '',
                address: '',
                accountType: 'buyer',
                suffix: ''
            });
            // Replace alert(`User added successfully! Generated password: ${data.password}`);
            toast.success(`User added successfully! Generated password: ${data.password}`);
        } catch (error) {
            console.error('Error adding user:', error);
            // Replace alert(error.message || 'Failed to add user');
            toast.error(error.message || 'Failed to add user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const updateData = {
                id: selectedUser.id,
                ...formData
            };

            const response = await fetch(`${API_BASE_URL}/update_user.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            setSuccess(data.message);
            setShowEditModal(false);
            resetLocationState();
            fetchUsers(); // Refresh the user list
        } catch (error) {
            setError(error.message);
            console.error('Update error:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/delete_user.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Server returned invalid response format');
            }

            if (!response.ok) {
                throw new Error(data.error || `Failed to delete user (${response.status})`);
            }

            // Replace alert('User deleted successfully');
            toast.success('User deleted successfully');
            await fetchUsers();
        } catch (error) {
            console.error('Delete error:', error);
            // Replace alert(error.message || 'Failed to delete user');
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        
        // Safely handle fullname splitting
        const nameParts = (user.fullname || '').split(' ');
        let surname = nameParts[0] || '';
        let firstName = nameParts[1] || '';
        let middleName = '';
        let suffix = '';

        // Handle suffix if present (comma separated)
        const fullnameParts = user.fullname.split(',');
        if (fullnameParts.length > 1) {
            suffix = fullnameParts[1].trim();
            // Re-split the name without suffix
            const nameWithoutSuffix = fullnameParts[0].split(' ');
            surname = nameWithoutSuffix[0] || '';
            firstName = nameWithoutSuffix[1] || '';
            if (nameWithoutSuffix.length > 2) {
                middleName = nameWithoutSuffix.slice(2).join(' ');
            } else if (nameWithoutSuffix.length === 2) {
                middleName = nameWithoutSuffix[1];
            }
        }

        setFormData({
            username: user.username || '',
            surname,
            firstName,
            middleName,
            fullname: user.fullname || '',
            contactNo: user.contactNo || '',
            gender: user.gender || '',
            birthDay: user.birthDay || '',
            birthMonth: user.birthMonth || '',
            birthYear: user.birthYear || '',
            streetAddress: user.streetAddress || '',
            city: user.city || '',
            province: user.province || '',
            zipCode: user.zipCode || '',
            address: user.address || '',
            accountType: user.accountType || 'buyer',
            suffix
        });
        
        // Find and set region based on province
        const matchingRegion = regions.find(region => {
            const provincesList = getProvincesByRegion(region);
            return provincesList.includes(user.province);
        });

        if (matchingRegion) {
            setSelectedRegion(matchingRegion);
            setAvailableProvinces(getProvincesByRegion(matchingRegion));
            setSelectedProvince(user.province);
            setAvailableCities(getCitiesByProvince(user.province));
        }

        setShowEditModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        resetLocationState();
        setFormData({
            username: '',
            surname: '',
            firstName: '',
            middleName: '',
            fullname: '',
            contactNo: '',
            gender: '',
            birthDay: '',
            birthMonth: '',
            birthYear: '',
            streetAddress: '',
            city: '',
            province: '',
            zipCode: '',
            address: '',
            accountType: 'buyer',
            suffix: ''
        });
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        resetLocationState();
        setSelectedUser(null);
    };

    // Add search filter function
    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.username.toLowerCase().includes(searchLower) ||
            user.fullname.toLowerCase().includes(searchLower) ||
            user.contactNo?.toLowerCase().includes(searchLower) ||
            user.gender?.toLowerCase().includes(searchLower) ||
            user.address?.toLowerCase().includes(searchLower) ||
            user.accountType.toLowerCase().includes(searchLower)
        );
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    // Calculate pagination values
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const Pagination = () => (
        <div className="flex justify-between items-center mt-4 px-4">
            <div className="text-sm text-gray-700">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
            </div>
            <div className="flex space-x-2">
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
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add New User
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search users..."
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
                                    <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Full Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Password
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Birth Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Type
                                    </th>
                                    <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.fullname}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.username}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.password || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.contactNo || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.gender || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.birthDay && user.birthMonth && user.birthYear 
                                                    ? `${user.birthMonth}/${user.birthDay}/${user.birthYear}`
                                                    : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {user.address || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.accountType === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                                user.accountType === 'staff' ? 'bg-blue-100 text-blue-800' : 
                                                'bg-green-100 text-green-800'}`}>
                                                {user.accountType}
                                            </span>
                                        </td>
                                        <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <Pagination />
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-8xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
                            <form onSubmit={handleAddUser} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="surname"
                                            placeholder="Surname"
                                            value={formData.surname}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = formData.suffix ? `, ${formData.suffix}` : '';
                                                const updatedFullname = `${e.target.value} ${formData.firstName || ''} ${formData.middleName || ''}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = formData.suffix ? `, ${formData.suffix}` : '';
                                                const updatedFullname = `${formData.surname || ''} ${e.target.value} ${formData.middleName || ''}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <input
                                            type="text"
                                            name="middleName"
                                            placeholder="Middle Name (Optional)"
                                            value={formData.middleName}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = formData.suffix ? `, ${formData.suffix}` : '';
                                                const updatedFullname = `${formData.surname || ''} ${formData.firstName || ''} ${e.target.value}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                                            Suffix (Optional)
                                        </label>
                                        <select
                                            id="suffix"
                                            name="suffix"
                                            value={formData.suffix}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = e.target.value ? `, ${e.target.value}` : '';
                                                const updatedFullname = `${formData.surname || ''} ${formData.firstName || ''} ${formData.middleName || ''}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contactNo"
                                        value={formData.contactNo}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Birth Day <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="birthDay"
                                            value={formData.birthDay}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="31"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Birth Month <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="birthMonth"
                                            value={formData.birthMonth}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Month</option>
                                            <option value="1">January</option>
                                            <option value="2">February</option>
                                            <option value="3">March</option>
                                            <option value="4">April</option>
                                            <option value="5">May</option>
                                            <option value="6">June</option>
                                            <option value="7">July</option>
                                            <option value="8">August</option>
                                            <option value="9">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Birth Year <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="birthYear"
                                            value={formData.birthYear}
                                            onChange={handleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="streetAddress"
                                        value={formData.streetAddress}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            // Combine address fields into address
                                            const updatedAddress = `${e.target.value}, ${formData.city || ''}, ${formData.province || ''}, ${formData.zipCode || ''}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Region <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="region"
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Province <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setSelectedProvince(e.target.value);
                                            const updatedAddress = `${formData.streetAddress || ''}, ${formData.city || ''}, ${e.target.value}, ${formData.zipCode || ''}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Province</option>
                                        {availableProvinces.map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            const updatedAddress = `${formData.streetAddress || ''}, ${e.target.value}, ${formData.province || ''}, ${formData.zipCode || ''}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {availableCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Zip Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            // Combine address fields into address
                                            const updatedAddress = `${formData.streetAddress || ''}, ${formData.city || ''}, ${formData.province || ''}, ${e.target.value}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Type</label>
                                    <select
                                        name="accountType"
                                        value={formData.accountType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseAddModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-8xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                            <form onSubmit={handleUpdateUser} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Leave empty to keep current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="surname"
                                            placeholder="Surname"
                                            value={formData.surname}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = formData.suffix ? `, ${formData.suffix}` : '';
                                                const updatedFullname = `${e.target.value} ${formData.firstName || ''} ${formData.middleName || ''}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = formData.suffix ? `, ${formData.suffix}` : '';
                                                const updatedFullname = `${formData.surname || ''} ${e.target.value} ${formData.middleName || ''}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <input
                                            type="text"
                                            name="middleName"
                                            placeholder="Middle Name (Optional)"
                                            value={formData.middleName}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = formData.suffix ? `, ${formData.suffix}` : '';
                                                const updatedFullname = `${formData.surname || ''} ${formData.firstName || ''} ${e.target.value}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="suffix-edit" className="block text-sm font-medium text-gray-700">
                                            Suffix (Optional)
                                        </label>
                                        <select
                                            id="suffix-edit"
                                            name="suffix"
                                            value={formData.suffix}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                const suffixText = e.target.value ? `, ${e.target.value}` : '';
                                                const updatedFullname = `${formData.surname || ''} ${formData.firstName || ''} ${formData.middleName || ''}${suffixText}`.trim();
                                                setFormData(prev => ({ ...prev, fullname: updatedFullname }));
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contactNo"
                                        value={formData.contactNo}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Birth Day <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="birthDay"
                                            value={formData.birthDay}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="31"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Birth Month <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="birthMonth"
                                            value={formData.birthMonth}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Month</option>
                                            <option value="1">January</option>
                                            <option value="2">February</option>
                                            <option value="3">March</option>
                                            <option value="4">April</option>
                                            <option value="5">May</option>
                                            <option value="6">June</option>
                                            <option value="7">July</option>
                                            <option value="8">August</option>
                                            <option value="9">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Birth Year <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="birthYear"
                                            value={formData.birthYear}
                                            onChange={handleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="streetAddress"
                                        value={formData.streetAddress}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            const updatedAddress = `${e.target.value}, ${formData.city || ''}, ${formData.province || ''}, ${formData.zipCode || ''}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Region <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="region"
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Province <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setSelectedProvince(e.target.value);
                                            const updatedAddress = `${formData.streetAddress || ''}, ${formData.city || ''}, ${e.target.value}, ${formData.zipCode || ''}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Province</option>
                                        {availableProvinces.map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            const updatedAddress = `${formData.streetAddress || ''}, ${e.target.value}, ${formData.province || ''}, ${formData.zipCode || ''}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {availableCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Zip Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            const updatedAddress = `${formData.streetAddress || ''}, ${formData.city || ''}, ${formData.province || ''}, ${e.target.value}`.trim();
                                            setFormData(prev => ({ ...prev, address: updatedAddress }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Type</label>
                                    <select
                                        name="accountType"
                                        value={formData.accountType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                    >
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;