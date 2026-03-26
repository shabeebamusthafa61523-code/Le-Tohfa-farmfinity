const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
  let token;

  console.log("--- AUTH DEBUG START ---");
  console.log("Headers:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // Check 1: Is the token actually there?
      if (!token || token === "undefined" || token === "null") {
        console.error("DEBUG: Token string is literal 'undefined' or empty");
        return res.status(401).json({ message: "Malformed token string" });
      }

      // Check 2: Verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("DEBUG: Decoded ID ->", decoded.id);

      // Check 3: Database User
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.error("DEBUG: User ID in token not found in Database");
        return res.status(401).json({ message: "User no longer exists" });
      }

      console.log("--- AUTH SUCCESS ---");
      next();
    } catch (error) {
      console.error("DEBUG: JWT Error ->", error.message); // THIS IS THE LINE YOU NEED
      return res.status(401).json({ 
        message: "Not authorized", 
        error: error.message // Sending the real error to the frontend for now
      });
    }
  } else {
    console.error("DEBUG: No Bearer token in headers");
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