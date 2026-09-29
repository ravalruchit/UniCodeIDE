import { apiClient, setStoredToken, getStoredToken } from './api.js';

// Pre-configured development fallback accounts for seamless local evaluation
const DEMO_ACCOUNTS = [
  {
    id: 'demo-super-admin-01',
    name: 'Eleanor Vance',
    email: 'superadmin@unicodeide.edu',
    password: 'password123',
    role: 'SUPER_ADMIN',
    department: 'Global Platform Administration',
    university: null,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'demo-univ-admin-01',
    name: 'Dr. Marcus Sterling',
    email: 'admin@meridian.edu',
    password: 'password123',
    role: 'UNIVERSITY_ADMIN',
    department: 'Dean of Academic Operations',
    university: {
      id: 'demo-univ-01',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      plan: 'ENTERPRISE',
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'demo-teacher-01',
    name: 'Prof. Sarah Jenkins',
    email: 'teacher@meridian.edu',
    password: 'password123',
    role: 'TEACHER',
    department: 'Computer Science & Engineering',
    university: {
      id: 'demo-univ-01',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      plan: 'ENTERPRISE',
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'demo-student-01',
    name: 'Alex Rivera',
    email: 'student@meridian.edu',
    password: 'password123',
    role: 'STUDENT',
    department: 'B.Tech CS - Year 3 (Batch 2026)',
    university: {
      id: 'demo-univ-01',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      plan: 'ENTERPRISE',
    },
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  },
];

export const authService = {
  /**
   * Log in user
   */
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: { email: cleanEmail, password },
        requiresAuth: false,
      });

      if (response?.data?.token) {
        setStoredToken(response.data.token);
      }

      return response.data.user;
    } catch (error) {
      // If backend is not running, check if credentials match development demo accounts
      const matchedDemo = DEMO_ACCOUNTS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === password
      );

      if (matchedDemo) {
        console.info('[Auth] Connected using development demo account (backend offline fallback).');
        const demoToken = `mock-jwt-token-${matchedDemo.role.toLowerCase()}-${Date.now()}`;
        setStoredToken(demoToken);
        const { password: _, ...safeUser } = matchedDemo;
        return safeUser;
      }

      throw error;
    }
  },

  /**
   * Register new student account
   */
  async register(registrationData) {
    try {
      const response = await apiClient('/auth/register', {
        method: 'POST',
        body: registrationData,
        requiresAuth: false,
      });

      if (response?.data?.token) {
        setStoredToken(response.data.token);
      }

      return response.data.user;
    } catch (error) {
      // If backend is offline, create demo student session
      if (error.status === 0 || error.message.includes('Unable to connect')) {
        console.info('[Auth] Created student account in demo mode (backend offline fallback).');
        const newDemoStudent = {
          id: `student-demo-${Date.now()}`,
          name: registrationData.name,
          email: registrationData.email,
          role: 'STUDENT',
          department: registrationData.department || 'Computer Science',
          university: {
            id: 'demo-univ-01',
            name: 'Meridian Institute of Technology',
            code: registrationData.universityCode || 'MERIDIAN',
          },
        };
        setStoredToken(`mock-jwt-token-student-${Date.now()}`);
        return newDemoStudent;
      }
      throw error;
    }
  },

  /**
   * Fetch current authenticated session user profile
   */
  async getMe() {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const response = await apiClient('/auth/me', {
        method: 'GET',
        requiresAuth: true,
      });
      return response.data.user;
    } catch (error) {
      // Handle mock token for demo accounts
      if (token.startsWith('mock-jwt-token-')) {
        const roleMatch = token.split('-')[3]?.toUpperCase();
        const demoUser = DEMO_ACCOUNTS.find((u) => u.role === roleMatch) || DEMO_ACCOUNTS[3];
        const { password: _, ...safeUser } = demoUser;
        return safeUser;
      }
      // If session is invalid, clear token
      setStoredToken(null);
      return null;
    }
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email) {
    try {
      return await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: { email },
        requiresAuth: false,
      });
    } catch (error) {
      if (error.status === 0) {
        return {
          success: true,
          message: 'If an account exists, a password reset link has been dispatched (demo mode).',
        };
      }
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      return await apiClient('/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword },
        requiresAuth: false,
      });
    } catch (error) {
      if (error.status === 0) {
        return {
          success: true,
          message: 'Password has been reset successfully (demo mode).',
        };
      }
      throw error;
    }
  },

  /**
   * Log out user
   */
  async logout() {
    try {
      await apiClient('/auth/logout', {
        method: 'POST',
        requiresAuth: true,
      });
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setStoredToken(null);
    }
  },

  /**
   * Export demo accounts for quick UI testing convenience
   */
  getDemoAccounts() {
    return DEMO_ACCOUNTS.map(({ password: _, ...user }) => ({
      ...user,
      defaultPassword: 'password123',
    }));
  },
};
