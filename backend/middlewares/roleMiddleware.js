// Role-based access control middleware
// Usage: allowRoles('WHOLESALER') or allowRoles('WHOLESALER', 'SHOP_OWNER')
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(' or ')}`
    });
  }
  next();
};

export default allowRoles;
