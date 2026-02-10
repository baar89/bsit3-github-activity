const bcrypt = require('bcrypt');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

const getMe = async (req, res) => {
  const activeBids = await Bid.countDocuments({ bidderId: req.user._id });
  const wins = await Auction.countDocuments({ winnerId: req.user._id });

  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    approved: req.user.approved,
    banned: req.user.banned,
    joinDate: req.user.joinDate,
    avatarUrl: req.user.avatarUrl,
    auctionWins: wins,
    activeBids,
    emailVerified: req.user.emailVerified
  });
};

const updateProfile = async (req, res) => {
  const { username, password, avatarUrl } = req.body;

  if (username && username !== req.user.username) {
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'Username already taken' });
    req.user.username = username;
  }

  if (password) {
    req.user.passwordHash = await bcrypt.hash(password, 12);
  }

  if (avatarUrl) {
    req.user.avatarUrl = avatarUrl;
  }

  await req.user.save();
  res.json({ message: 'Profile updated successfully' });
};

module.exports = {
  getMe,
  updateProfile
};
