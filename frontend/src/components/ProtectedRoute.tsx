import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const user = getCurrentUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (! allowedRoles.includes(user.role)) {
    console.warn(`Access denied: User role ${user.role} not in ${allowedRoles. join(', ')}`);
    return <Navigate to="/" replace />;
  }

  // All good! 
  return <>{children}</>;
};

export default ProtectedRoute;