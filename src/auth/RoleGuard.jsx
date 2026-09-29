import React from 'react';
import { useAuth } from '../context/AuthContext';
import { isRoleAuthorized } from './authUtils';

export const RoleGuard = ({ allowedRoles = [], fallback = null, children }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return fallback;
  if (!isRoleAuthorized(role, allowedRoles)) return fallback;

  return <>{children}</>;
};
