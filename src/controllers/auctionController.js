const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const buildAuctionFilter = (query) => {
  const filter = { status: query.status || 'active' };
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { robloxItemName: { $regex: query.search, $options: 'i' } }
    ];
  }

  if (query.minPrice || query.maxPrice) {
    filter.currentBid = {};
    if (query.minPrice) filter.currentBid.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.currentBid.$lte = Number(query.maxPrice);
  }

  return filter;
};

const listAuctions = async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 10), 50);
  const skip = (page - 1) * limit;

  const sortMap = {
    endingSoon: { endTime: 1 },
    highestValue: { currentBid: -1 },
    newest: { createdAt: -1 }
  };

  const filter = buildAuctionFilter(req.query);
  const sort = sortMap[req.query.sort] || { endTime: 1 };

  const [auctions, total] = await Promise.all([
    Auction.find(filter)
      .populate('sellerId', 'username')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Auction.countDocuments(filter)
  ]);

  res.json({
    page,
    totalPages: Math.ceil(total / limit),
    total,
    auctions
  });
};

const getLandingSections = async (req, res) => {
  const now = new Date();
  const [featured, endingSoon, highestValue] = await Promise.all([
    Auction.find({ status: 'active' }).sort({ createdAt: -1 }).limit(6).populate('sellerId', 'username'),
    Auction.find({ status: 'active', endTime: { $gt: now } }).sort({ endTime: 1 }).limit(6).populate('sellerId', 'username'),
    Auction.find({ status: 'active' }).sort({ currentBid: -1 }).limit(6).populate('sellerId', 'username')
  ]);

  res.json({ featured, endingSoon, highestValue });
};

const getAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id)
    .populate('sellerId', 'username')
    .populate('winnerId', 'username');
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  const bids = await Bid.find({ auctionId: auction._id })
    .populate('bidderId', 'username')
    .sort({ amount: -1, timestamp: -1 })
    .limit(100);

  res.json({ auction, bids });
};

const placeBid = async (req, res) => {
  const { amount } = req.body;
  const auction = await Auction.findById(req.params.id);

  if (!auction) return res.status(404).json({ message: 'Auction not found' });
  if (auction.status !== 'active') return res.status(400).json({ message: 'Auction ended' });

  if (auction.sellerId.toString() === req.user._id.toString()) {
    return res.status(403).json({ message: 'Seller cannot bid on own auction' });
  }

  const now = new Date();
  if (new Date(auction.endTime) <= now) {
    auction.status = 'ended';
    await auction.save();
    return res.status(400).json({ message: 'Auction already ended' });
  }

  const minAmount = Math.max(auction.startPrice, auction.currentBid || 0) + auction.bidIncrement;
  if (!amount || Number(amount) < minAmount) {
    return res.status(400).json({ message: `Bid too low. Minimum allowed: ${minAmount}` });
  }

  const recentDuplicate = await Bid.findOne({
    auctionId: auction._id,
    bidderId: req.user._id,
    amount: Number(amount),
    timestamp: { $gte: new Date(now.getTime() - 10 * 1000) }
  });

  if (recentDuplicate) {
    return res.status(400).json({ message: 'Duplicate bid detected, please wait' });
  }

  auction.currentBid = Number(amount);

  const msRemaining = new Date(auction.endTime).getTime() - now.getTime();
  if (msRemaining <= 60 * 1000) {
    auction.endTime = new Date(auction.endTime.getTime() + 60 * 1000);
  }

  await auction.save();

  const bid = await Bid.create({
    auctionId: auction._id,
    bidderId: req.user._id,
    amount: Number(amount)
  });

  res.status(201).json({
    message: 'Bid placed successfully',
    bid,
    currentBid: auction.currentBid,
    newEndTime: auction.endTime
  });
};

module.exports = {
  listAuctions,
  getLandingSections,
  getAuction,
  placeBid
};
