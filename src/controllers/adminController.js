const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

const getPendingUsers = async (req, res) => {
  const pending = await User.find({ approved: false, banned: false, role: 'user' }).sort({ joinDate: 1 });
  res.json(pending);
};

const updateUserStatus = async (req, res) => {
  const { action } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  if (action === 'approve') user.approved = true;
  if (action === 'reject') {
    user.approved = false;
  }
  if (action === 'ban') {
    user.banned = true;
  }

  await user.save();
  res.json({ message: `User status updated: ${action}` });
};

const createAuction = async (req, res) => {
  const auction = await Auction.create({
    ...req.body,
    sellerId: req.user._id,
    currentBid: Number(req.body.startPrice)
  });

  res.status(201).json({ message: 'Auction created', auction });
};

const editAuction = async (req, res) => {
  const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!auction) return res.status(404).json({ message: 'Auction not found' });
  res.json({ message: 'Auction updated', auction });
};

const deleteAuction = async (req, res) => {
  const auction = await Auction.findByIdAndDelete(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });
  await Bid.deleteMany({ auctionId: auction._id });
  res.json({ message: 'Auction deleted' });
};

const closeAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  const topBid = await Bid.findOne({ auctionId: auction._id }).sort({ amount: -1, timestamp: 1 });
  auction.status = 'ended';
  auction.winnerId = topBid ? topBid.bidderId : null;
  await auction.save();

  if (topBid) {
    await User.findByIdAndUpdate(topBid.bidderId, { $inc: { auctionWins: 1 } });
  }

  res.json({ message: 'Auction closed', winnerId: auction.winnerId });
};

const listAllBids = async (req, res) => {
  const bids = await Bid.find({})
    .populate('auctionId', 'title')
    .populate('bidderId', 'username email')
    .sort({ createdAt: -1 })
    .limit(500);
  res.json(bids);
};

const getDashboardStats = async (req, res) => {
  const [totalUsers, activeAuctions, totalBids, topBid] = await Promise.all([
    User.countDocuments(),
    Auction.countDocuments({ status: 'active' }),
    Bid.countDocuments(),
    Bid.findOne({}).sort({ amount: -1 })
  ]);

  res.json({
    totalUsers,
    activeAuctions,
    totalBids,
    revenueMockCounter: topBid?.amount || 0
  });
};

module.exports = {
  getPendingUsers,
  updateUserStatus,
  createAuction,
  editAuction,
  deleteAuction,
  closeAuction,
  listAllBids,
  getDashboardStats
};
