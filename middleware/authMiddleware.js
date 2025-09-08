const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  let token = req.header("Authorization") || req.header("x-auth-token");

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    if (token.startsWith("Bearer ")) token = token.slice(7).trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always store id in req.user
    req.user = { id: decoded.id, role: decoded.role || "user" };

    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// Optional role-based authorization
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Not authenticated" });

  if (!roles.includes(req.user.role)) return res.status(403).json({ msg: "Access denied" });

  next();
};

module.exports = { auth, authorize };
