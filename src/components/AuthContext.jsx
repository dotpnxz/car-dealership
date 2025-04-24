import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [accountType, setAccountType] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await fetch('http://localhost/car-dealership/api/verify_session.php', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.isLoggedIn) {
                        setIsLoggedIn(true);
                        setUserId(data.userId);
                        setAccountType(data.accountType);
                        
                        // Fetch user profile data
                        const profileResponse = await fetch('http://localhost/car-dealership/api/get_profile.php', {
                            credentials: 'include'
                        });
                        if (profileResponse.ok) {
                            const profileData = await profileResponse.json();
                            setUser(profileData);
                        }
                    } else {
                        // Clear any stale local storage
                        localStorage.removeItem('userId');
                        localStorage.removeItem('accountType');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                // Clear any stale local storage
                localStorage.removeItem('userId');
                localStorage.removeItem('accountType');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = (newUserId, newAccountType) => {
        setIsLoggedIn(true);
        setUserId(newUserId);
        setAccountType(newAccountType);
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('userId', newUserId);
            localStorage.setItem('accountType', newAccountType);
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserId(null);
        setAccountType(null);
        setUser(null);
        
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
            localStorage.removeItem('accountType');
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            userId, 
            accountType,
            user,
            setUser,
            login,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};