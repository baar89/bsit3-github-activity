const express = require('express');
const { register, login, logout, verifyEmail } = require('../controllers/authController');
const { loginRateLimiter } = require('../middleware/rateLimiters');
const { validateRegistration } = require('../middleware/validators');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);

module.exports = router;
