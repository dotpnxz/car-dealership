import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredAccountType }) => {
    const { isLoggedIn, accountType } = useContext(AuthContext);
    const requiredType = requiredRole || requiredAccountType;

    if (!isLoggedIn) {
        return <Navigate to="/LoginForm" replace />;
    }

    if (requiredType && accountType !== requiredType) {
        // Redirect to appropriate dashboard based on account type
        if (accountType === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (accountType === 'staff') {
            return <Navigate to="/staff" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 