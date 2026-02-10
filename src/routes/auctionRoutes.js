const express = require('express');
const { listAuctions, getLandingSections, getAuction, placeBid } = require('../controllers/auctionController');
const { authRequired, approvedRequired } = require('../middleware/authMiddleware');
const { bidRateLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/landing', getLandingSections);
router.get('/', listAuctions);
router.get('/:id', getAuction);
router.post('/:id/bids', authRequired, approvedRequired, bidRateLimiter, placeBid);

module.exports = router;
