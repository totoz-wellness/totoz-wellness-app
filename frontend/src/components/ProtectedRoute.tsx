import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[]; // Changed from requiredRole to allowedRoles to match App.tsx
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const currentUser = getCurrentUser();

  // Debug logs (remove after testing)
  console.log('🛡️ ProtectedRoute Check:');
  console.log('currentUser:', currentUser);
  console.log('location:', location.pathname);
  console.log('allowedRoles:', allowedRoles);

  // Not logged in - redirect to login with return URL
  if (!currentUser) {
    console.log('❌ No user, redirecting to login with state:', { from: location });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log('❌ User role not allowed:', currentUser.role);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Access granted');
  return children;
};

export default ProtectedRoute;