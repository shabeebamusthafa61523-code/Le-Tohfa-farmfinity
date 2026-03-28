const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 1. Extract and CLEAN the token
      // This removes literal double quotes and whitespace that often creep in from LocalStorage
      token = req.headers.authorization.split(" ")[1].replace(/[\\"]/g, '').trim();
      
      if (!token || token === "undefined" || token === "null") {
        return res.status(401).json({ message: "Malformed token string" });
      }

      // 2. Verification
      // Ensure process.env.JWT_SECRET is actually set in Render Environment Variables!
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Database User
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Failed:", error.message);
      return res.status(401).json({ 
        message: "Not authorized", 
        error: error.message 
      });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

const admin = (req, res, next) => {
  // Now req.user.role will actually exist because we fetched it from the DB above
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Admin privileges' });
  }
};

module.exports = { protect, admin };