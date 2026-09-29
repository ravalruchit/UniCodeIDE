import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isRoleAuthorized, getDefaultDashboardRoute } from './authUtils';
import { Unauthorized } from '../pages/errors/NotFound';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Show professional loading screen while validating session
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex items-center space-x-3 text-muted-foreground animate-fade-up">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="font-mono text-sm">Verifying UniCodeIDE session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check RBAC permission for specific role
  if (allowedRoles.length > 0 && !isRoleAuthorized(role, allowedRoles)) {
    // Show clean 403 Access Denied view with button leading back to their own dashboard
    return (
      <Unauthorized />
    );
  }

  return children;
};
