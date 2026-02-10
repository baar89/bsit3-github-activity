const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user || user.banned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const approvedRequired = (req, res, next) => {
  if (!req.user.approved) {
    return res.status(403).json({ message: 'Your account is not approved yet' });
  }
  if (!req.user.emailVerified) {
    return res.status(403).json({ message: 'Please verify your email first (mock verification)' });
  }
  next();
};

const adminRequired = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = {
  authRequired,
  approvedRequired,
  adminRequired
};
