import crypto from 'crypto';
import { User, USER_ROLES } from '../models/User.js';
import { University } from '../models/University.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getDBStatus } from '../config/db.js';

// Seed demo users for development fallback when MongoDB is offline
const DEMO_USERS = [
  {
    id: 'demo-super-admin-01',
    name: 'Eleanor Vance',
    email: 'superadmin@unicodeide.edu',
    password: 'password123',
    role: USER_ROLES.SUPER_ADMIN,
    university: null,
    status: 'ACTIVE',
  },
  {
    id: 'demo-univ-admin-01',
    name: 'Dr. Marcus Sterling',
    email: 'admin@meridian.edu',
    password: 'password123',
    role: USER_ROLES.UNIVERSITY_ADMIN,
    university: {
      id: 'demo-univ-01',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      plan: 'ENTERPRISE',
    },
    department: 'Administration',
    status: 'ACTIVE',
  },
  {
    id: 'demo-teacher-01',
    name: 'Prof. Sarah Jenkins',
    email: 'teacher@meridian.edu',
    password: 'password123',
    role: USER_ROLES.TEACHER,
    university: {
      id: 'demo-univ-01',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      plan: 'ENTERPRISE',
    },
    department: 'Computer Science & Engineering',
    status: 'ACTIVE',
  },
  {
    id: 'demo-student-01',
    name: 'Alex Rivera',
    email: 'student@meridian.edu',
    password: 'password123',
    role: USER_ROLES.STUDENT,
    university: {
      id: 'demo-univ-01',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      plan: 'ENTERPRISE',
    },
    department: 'Computer Science (Batch 2026)',
    status: 'ACTIVE',
  },
];

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (getDBStatus()) {
      const user = await User.findOne({ email: normalizedEmail })
        .select('+passwordHash')
        .populate('universityId', 'name code plan');

      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password', 401);
      }

      if (user.status !== 'ACTIVE') {
        return sendError(res, 'Your account is inactive. Please contact your university admin.', 403);
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = signToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        universityId: user.universityId?._id || null,
      });

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        university: user.universityId,
        avatar: user.avatar,
        createdAt: user.createdAt,
      };

      return sendSuccess(res, { user: userResponse, token }, 'Login successful');
    }

    // Fallback: Check Demo Accounts when DB is offline
    const demoUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (demoUser) {
      const token = signToken({
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
        universityId: demoUser.university?.id || null,
      });

      const { password: _, ...userSafe } = demoUser;
      return sendSuccess(
        res,
        {
          user: userSafe,
          token,
          isDemoSession: true,
        },
        'Logged in with demo credentials (offline mode)'
      );
    }

    return sendError(res, 'Invalid email or password', 401);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, universityCode, department } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Security check: Only STUDENT self-registration is allowed through the public endpoint
    // Teachers and Admins must be provisioned through secure invites or Super Admin
    const requestedRole = USER_ROLES.STUDENT;

    if (getDBStatus()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return sendError(res, 'An account with this email address already exists', 409);
      }

      let university = null;
      if (universityCode) {
        university = await University.findOne({ code: universityCode.trim().toUpperCase() });
        if (!university) {
          return sendError(res, 'University code not found. Please verify your institution code.', 404);
        }
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: password,
        role: requestedRole,
        universityId: university?._id || null,
        department: department || '',
        status: 'ACTIVE',
      });

      const token = signToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        universityId: university?._id || null,
      });

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        university: university ? { id: university._id, name: university.name, code: university.code } : null,
        createdAt: user.createdAt,
      };

      return sendSuccess(res, { user: userResponse, token }, 'Registration successful', 201);
    }

    // Offline demo fallback
    const newDemoStudent = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: USER_ROLES.STUDENT,
      university: {
        id: 'demo-univ-01',
        name: 'Meridian Institute of Technology',
        code: universityCode || 'MERIDIAN',
      },
      department: department || 'Computer Science',
      status: 'ACTIVE',
    };

    const token = signToken({
      id: newDemoStudent.id,
      email: newDemoStudent.email,
      role: newDemoStudent.role,
      name: newDemoStudent.name,
      universityId: newDemoStudent.university.id,
    });

    return sendSuccess(
      res,
      { user: newDemoStudent, token, isDemoSession: true },
      'Account created successfully (offline mode)',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    let userProfile = req.user;
    if (getDBStatus() && req.user._id) {
      const user = await User.findById(req.user._id).populate('universityId', 'name code plan settings');
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      userProfile = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        university: user.universityId,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.createdAt,
      };
    }

    return sendSuccess(res, { user: userProfile }, 'Session profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  // In JWT, client discards the token. Server returns successful invalidation response.
  return sendSuccess(res, null, 'Logged out successfully');
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Generate random 32-byte reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

    if (getDBStatus()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpires;
        await user.save();
      }
    }

    // Always respond with success to prevent email enumeration attacks
    return sendSuccess(
      res,
      { resetTokenPreview: resetToken },
      'If an account exists with that email, a password reset link has been dispatched.'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (getDBStatus()) {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return sendError(res, 'Password reset token is invalid or has expired', 400);
      }

      user.passwordHash = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return sendSuccess(res, null, 'Password has been reset successfully. You can now log in.');
    }

    return sendSuccess(res, null, 'Password reset simulated successfully (offline mode).');
  } catch (error) {
    next(error);
  }
};
