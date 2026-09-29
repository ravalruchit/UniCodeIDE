import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { getDefaultDashboardRoute } from '../auth/authUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Restore existing session from stored JWT on initial mount
   */
  const restoreSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await authService.getMe();
      if (userProfile) {
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[Auth] Session restoration check failed:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Log in user
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return { success: true, user: loggedUser, redirectPath: getDefaultDashboardRoute(loggedUser.role) };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new student account
   */
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.register(formData);
      setUser(newUser);
      return { success: true, user: newUser, redirectPath: getDefaultDashboardRoute(newUser.role) };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please check the provided information.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    role: user?.role || null,
    university: user?.university || null,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    register,
    logout,
    refreshSession: restoreSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
