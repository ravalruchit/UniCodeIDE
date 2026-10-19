import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { ENV } from '../config/env.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required',
    });
  }

  // In production, reject any mock/demo tokens unconditionally
  if (token.startsWith('mock-jwt-token-')) {
    if (ENV.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Unsigned mock tokens are prohibited in production.',
      });
    }

    // In local development only: strictly restrict to student fallback (prohibit admin escalation)
    const rolePart = (token.split('-')[3] || 'student').toUpperCase();
    if (rolePart !== 'STUDENT') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Mock tokens cannot be used for administrative privileges.',
      });
    }

    try {
      if (getDBStatus()) {
        const studentUser = await User.findOne({ role: 'STUDENT' }).populate('universityId', 'name code plan');
        if (studentUser) {
          req.user = studentUser;
          return next();
        }
      }

      req.user = {
        _id: 'demo-student-01',
        id: 'demo-student-01',
        name: 'Alex Rivera',
        email: 'student@meridian.edu',
        role: 'STUDENT',
        status: 'ACTIVE',
      };
      return next();
    } catch {
      // Fall through to standard verification if any error occurs
    }
  }

  try {
    const decoded = verifyToken(token);

    if (getDBStatus()) {
      const user = await User.findById(decoded.id).populate('universityId', 'name code plan');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }
      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Account is inactive or suspended' });
      }
      req.user = user;
    } else {
      // Mock/fallback token payload for offline development
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Demo User',
        email: decoded.email,
        role: decoded.role,
        universityId: decoded.universityId || null,
        status: 'ACTIVE',
      };
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
};
