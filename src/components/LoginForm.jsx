import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjust path if needed

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('Attempting login with:', { username });
            
            const response = await fetch('http://localhost/car-dealership/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();
            console.log('Login response:', data);

            if (data.user) {
                console.log('User data:', data.user);
                console.log('Account type:', data.user.accountType);
                login(data.user.id, data.user.accountType);
                if (data.user.accountType === 'admin') {
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin');
                } else if (data.user.accountType === 'staff') {
                    console.log('Redirecting to staff dashboard');
                    navigate('/staff');
                } else {
                    console.log('Redirecting to home');
                    navigate('/');
                }
            } else {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.message.includes('CORS')) {
                setError('Server connection error. Please try again later.');
            } else {
                setError(err.message || 'An error occurred during login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6 sm:py-12">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Login</h2>

                {error && (
                    <div className="mb-4 sm:mb-6 p-3 rounded border-l-4 bg-red-100 border-red-500 text-red-700 text-sm sm:text-base">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-gray-700 text-base sm:text-lg font-bold mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-gray-700 text-base sm:text-lg font-bold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={handlePasswordChange}
                                className="shadow appearance-none border rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <Link 
                                to="/reset-password" 
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                Forgot Password?
                            </Link>
                            <Link 
                                to="/register" 
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 text-base sm:text-lg rounded focus:outline-none focus:shadow-outline w-full transition-colors"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;