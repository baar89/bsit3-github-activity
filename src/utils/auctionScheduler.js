const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

const closeExpiredAuctions = async () => {
  const now = new Date();
  const expired = await Auction.find({ status: 'active', endTime: { $lte: now } });

  for (const auction of expired) {
    const topBid = await Bid.findOne({ auctionId: auction._id }).sort({ amount: -1, timestamp: 1 });
    auction.status = 'ended';
    auction.winnerId = topBid ? topBid.bidderId : null;
    await auction.save();

    if (topBid) {
      await User.findByIdAndUpdate(topBid.bidderId, { $inc: { auctionWins: 1 } });
    }
  }
};

const startAuctionScheduler = () => {
  setInterval(() => {
    closeExpiredAuctions().catch((err) => console.error('Auction scheduler error:', err.message));
  }, 15 * 1000);
};

module.exports = {
  startAuctionScheduler,
  closeExpiredAuctions
};
