const express = require('express');
const { getMe, updateProfile } = require('../controllers/userController');
const { authRequired } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authRequired, getMe);
router.patch('/me', authRequired, updateProfile);

module.exports = router;
