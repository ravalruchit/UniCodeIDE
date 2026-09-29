import { ROLES, ROLE_CONFIG } from './roles.js';

/**
 * Returns the default dashboard URL for a user role
 */
export const getDefaultDashboardRoute = (role) => {
  return ROLE_CONFIG[role]?.dashboardPath || '/app/student/dashboard';
};

/**
 * Checks if a given role is allowed based on an array of permitted roles
 */
export const isRoleAuthorized = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};

/**
 * Get human-readable role name
 */
export const getRoleDisplayName = (role) => {
  return ROLE_CONFIG[role]?.name || 'User';
};

/**
 * Get role badge styling class
 */
export const getRoleBadgeColor = (role) => {
  return ROLE_CONFIG[role]?.badgeColor || 'bg-muted text-muted-foreground';
};
