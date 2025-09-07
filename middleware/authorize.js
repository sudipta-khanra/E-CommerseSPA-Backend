// roles = array of allowed roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    // If you store role in JWT payload, it will be available as req.user.role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    next();
  };
};

module.exports = authorize;
