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
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-md w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Login Form</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                            Username:
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4 text-right">
                        <Link to="/forgot-password" className="text-red-500 text-sm hover:underline focus:outline-none">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <Link
                            to="/RegistrationForm"
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        >
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;