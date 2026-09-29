export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  next();
};

export const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email address is required' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }

  next();
};

export const validateForgotPasswordInput = (req, res, next) => {
  const { email } = req.body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email address is required' });
  }

  next();
};

export const validateResetPasswordInput = (req, res, next) => {
  const { token, newPassword } = req.body || {};

  if (!token) {
    return res.status(400).json({ success: false, message: 'Reset token is required' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
  }

  next();
};
