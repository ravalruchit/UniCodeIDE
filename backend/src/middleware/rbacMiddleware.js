export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to access this resource',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

export const requireSameTenant = (req, res, next) => {
  // Super Admin can access all universities
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const requestedTenantId = req.params.universityId || req.body.universityId;
  const userTenantId = req.user?.universityId?._id?.toString() || req.user?.universityId?.toString();

  if (requestedTenantId && userTenantId && requestedTenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Cannot access data from another university tenant',
    });
  }

  next();
};
