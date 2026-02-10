const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many login attempts, try again later' }
});

const bidRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many bids submitted, slow down' }
});

module.exports = {
  loginRateLimiter,
  bidRateLimiter
};
