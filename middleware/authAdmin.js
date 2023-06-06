const jwt = require('jsonwebtoken');
const Admin = require('../models/admin_model/admin');

const authenticateAdmin = async (req, res, next) => {
  // Retrieve the token from the request header, query parameter, or cookie
  const token = req.headers.authorization?.split(' ')[1] || req.query?.token || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'No token found. Please log in.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded token contains the necessary fields (e.g., user ID and role)
    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({ error: 'Invalid token. Please log in.' });
    }

    // Check if the user has the "admin" role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }

    // Retrieve the admin based on the user ID
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Set the admin object in the request for future use
    req.admin = admin;

    // Call the next middleware or route handler if authentication is successful
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid token. Please log in.' });
  }
};

module.exports = { authenticateAdmin };
