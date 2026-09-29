import { Router } from 'express';
import {
  login,
  register,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validateLoginInput,
  validateRegisterInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from '../validators/authValidator.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', validateLoginInput, login);
router.post('/register', validateRegisterInput, register);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);
router.post('/forgot-password', validateForgotPasswordInput, forgotPassword);
router.post('/reset-password', validateResetPasswordInput, resetPassword);

export default router;
