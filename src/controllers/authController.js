const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '1d'
});

const register = async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    return res.status(409).json({ message: 'Username or email is already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(20).toString('hex');

  const user = await User.create({
    username,
    email,
    passwordHash,
    role: 'user',
    approved: false,
    banned: false,
    verificationToken,
    emailVerified: false
  });

  return res.status(201).json({
    message: 'Registered successfully. Await admin approval and verify email (mock).',
    verificationLink: `/api/auth/verify-email?token=${verificationToken}`,
    userId: user._id
  });
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ verificationToken: token });

  if (!user) return res.status(400).json({ message: 'Invalid verification token' });

  user.emailVerified = true;
  user.verificationToken = null;
  await user.save();

  return res.json({ message: 'Email verified (mock) successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.banned) return res.status(403).json({ message: 'Your account has been banned' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      approved: user.approved,
      emailVerified: user.emailVerified
    }
  });
};

const logout = (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout
};
