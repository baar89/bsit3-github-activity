const express = require('express');
const {
  getPendingUsers,
  updateUserStatus,
  createAuction,
  editAuction,
  deleteAuction,
  closeAuction,
  listAllBids,
  getDashboardStats
} = require('../controllers/adminController');
const { authRequired, adminRequired } = require('../middleware/authMiddleware');
const { validateAuction } = require('../middleware/validators');

const router = express.Router();

router.use(authRequired, adminRequired);
router.get('/pending-users', getPendingUsers);
router.patch('/users/:id/status', updateUserStatus);
router.post('/auctions', validateAuction, createAuction);
router.patch('/auctions/:id', editAuction);
router.delete('/auctions/:id', deleteAuction);
router.patch('/auctions/:id/close', closeAuction);
router.get('/bids', listAllBids);
router.get('/stats', getDashboardStats);

module.exports = router;
