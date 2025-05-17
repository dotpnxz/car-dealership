import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Announcements = () => {
    const { user } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const announcementsPerPage = 5;

    // Add authentication verification
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('http://localhost/car-dealership/api/verify_auth.php', {
                    credentials: 'include'
                });
                const data = await response.json();
                setIsAdmin(data.success && data.accountType === 'admin');
                setAuthChecked(true);
            } catch (error) {
                console.error('Auth verification failed:', error);
                setAuthChecked(true);
            }
        };

        verifyAuth();
    }, [user]); // Re-run when user context changes

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('http://localhost/car-dealership/api/get_announcements.php', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setAnnouncements(data.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('text', newAnnouncement);
            images.forEach((image, index) => {
                formData.append(`images[]`, image);
            });

            const response = await fetch('http://localhost/car-dealership/api/create_announcement.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                // Create notifications after successful announcement
                await fetch('http://localhost/car-dealership/api/create_notifications.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `announcement_id=${data.announcement_id}`
                });
                
                setNewAnnouncement('');
                setImages([]);
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                const response = await fetch(`http://localhost/car-dealership/api/delete_announcement.php?id=${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    fetchAnnouncements();
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
            }
        }
    };

    const startEditing = (announcement) => {
        setEditingId(announcement.id);
        setEditText(announcement.text);
    };

    const handleUpdate = async (id) => {
        try {
            const response = await fetch('http://localhost/car-dealership/api/update_announcement.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    text: editText
                })
            });
            const data = await response.json();
            if (data.success) {
                setEditingId(null);
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Error updating announcement:', error);
        }
    };

    // Get current announcements
    const indexOfLastAnnouncement = currentPage * announcementsPerPage;
    const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
    const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);
    const totalPages = Math.ceil(announcements.length / announcementsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-2 sm:p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Announcements</h1>
            
            {/* Create Announcement Form - Only show for admin */}
            {isAdmin && (
                <form onSubmit={handleSubmit} className="mb-6 sm:mb-8 bg-white p-3 sm:p-4 rounded-lg shadow">
                    <div className="mb-3 sm:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            New Announcement
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg text-base"
                            rows="4"
                            value={newAnnouncement}
                            onChange={(e) => setNewAnnouncement(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3 sm:mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Images (optional)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm sm:text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base"
                    >
                        {isLoading ? 'Posting...' : 'Post Announcement'}
                    </button>
                </form>
            )}

            {/* Display Announcements */}
            <div className="space-y-3 sm:space-y-4">
                {currentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="bg-white p-3 sm:p-4 rounded-lg shadow">
                        {editingId === announcement.id && isAdmin ? (
                            <div className="mb-3 sm:mb-4">
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg text-base"
                                    rows="4"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                />
                                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:space-x-2">
                                    <button
                                        onClick={() => handleUpdate(announcement.id)}
                                        className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{announcement.text}</p>
                                {isAdmin && (
                                    <div className="flex justify-end space-x-4 mb-2">
                                        <button
                                            onClick={() => startEditing(announcement)}
                                            className="text-blue-500 hover:text-blue-700 text-sm sm:text-base py-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="text-red-500 hover:text-red-700 text-sm sm:text-base py-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {announcement.images && announcement.images.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {announcement.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={`http://localhost/car-dealership/${image}`}
                                        alt={`Announcement image ${index + 1}`}
                                        className="w-full h-40 sm:h-48 object-cover rounded"
                                    />
                                ))}
                            </div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-500 mt-2">
                            Posted on: {new Date(announcement.created_at).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {announcements.length > announcementsPerPage && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === index + 1
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Announcements;
